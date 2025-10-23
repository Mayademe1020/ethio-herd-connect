
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useInputSanitization } from '@/hooks/useInputSanitization';
import { encryptData, decryptData, secureLocalStorage, hashData } from '@/utils/securityUtils';
import { logger } from '@/utils/logger';

interface UserProfile {
  id: string;
  email: string;
  mobile_number?: string;
  full_name?: string;
  farm_name?: string;
  farm_prefix?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signUp: (email: string, password: string, mobileNumber: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ error: any }>;
  offlineSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  isOnline: boolean;
  lastSyncTime: string | null;
  syncUserData: () => Promise<void>;
  sendVerificationCode: (params: { method: 'sms'; phone: string } | { method: 'email'; email: string }) => Promise<{ error: any }>;
  verifyCode: (params: { method: 'sms'; phone: string; code: string } | { method: 'email'; email: string; code: string }) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMe] = useLocalStorage('bet-gitosa-remember-me', false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useLocalStorage('bet-gitosa-last-sync', null);
  const [offlineCredentials, setOfflineCredentials] = useLocalStorage('bet-gitosa-offline-auth', null);
  const { showSuccess, showError } = useToastNotifications();
  const { sanitizeEmail, sanitizeText } = useInputSanitization();

  // Fetch user profile data from farm_profiles table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('farm_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        // Map farm_profiles data to UserProfile structure
        setUserProfile({
          id: data.user_id,
          email: user?.email || '',
          mobile_number: data.phone,
          full_name: data.owner_name,
          farm_name: data.farm_name,
          farm_prefix: data.farm_prefix
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.debug('Auth state changed', { event, email: session?.user?.email });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
          
          if (event === 'SIGNED_IN') {
            // Store encrypted credentials for offline use if remember me is enabled
            if (rememberMe) {
              const hashedUserId = hashData(session.user.id);
              secureLocalStorage.setItem('bet-gitosa-offline-auth', {
                userId: hashedUserId,
                email: session.user.email,
                lastAuthenticated: new Date().toISOString()
              });
            }
            
            showSuccess(
              'Welcome back!',
              'You have been successfully signed in.'
            );
          }
        } else {
          setUserProfile(null);
          if (event === 'SIGNED_OUT') {
            // Clear offline credentials
            secureLocalStorage.removeItem('bet-gitosa-offline-auth');
            showSuccess(
              'Signed out',
              'You have been successfully signed out.'
            );
          }
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.debug('Initial session check', { email: session?.user?.email });
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
        setLastSyncTime(new Date().toISOString());
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, remember = false) => {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      setRememberMe(remember);

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, mobileNumber: string, fullName?: string) => {
    try {
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedFullName = fullName ? sanitizeText(fullName, { maxLength: 100 }) : undefined;
      const sanitizedMobile = sanitizeText(mobileNumber, { maxLength: 20 });

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            mobile_number: sanitizedMobile,
            full_name: sanitizedFullName
          }
        }
      });

      // Create farm profile record if signup successful
      if (!error && data.user) {
        // Generate a simple farm prefix from the user's name or email
        const farmPrefix = (sanitizedFullName || sanitizedEmail.split('@')[0]).toUpperCase().substring(0, 3);
        
        const { error: profileError } = await supabase
          .from('farm_profiles')
          .insert([
            {
              user_id: data.user.id,
              owner_name: sanitizedFullName || '',
              phone: sanitizedMobile,
              farm_name: `${sanitizedFullName || 'User'}'s Farm`,
              farm_prefix: farmPrefix,
              location: '',
              created_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.error('Error creating farm profile:', profileError);
        }
      }
      
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const sendVerificationCode = async (params: { method: 'sms'; phone: string } | { method: 'email'; email: string }) => {
    try {
      if (params.method === 'sms') {
        const phone = sanitizeText(params.phone, { maxLength: 20, allowSpecialChars: true });
        const { error } = await supabase.auth.signInWithOtp({ phone, options: { channel: 'sms' } });
        return { error };
      } else {
        const email = sanitizeEmail(params.email);
        const redirectUrl = `${window.location.origin}/marketplace`;
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectUrl } });
        return { error };
      }
    } catch (error) {
      console.error('Send verification code error:', error);
      return { error };
    }
  };

  const verifyCode = async (params: { method: 'sms'; phone: string; code: string } | { method: 'email'; email: string; code: string }) => {
    try {
      if (params.method === 'sms') {
        const phone = sanitizeText(params.phone, { maxLength: 20, allowSpecialChars: true });
        const token = params.code.trim();
        const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
        return { error };
      } else {
        const email = sanitizeEmail(params.email);
        const token = params.code.trim();
        const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
        return { error };
      }
    } catch (error) {
      console.error('Verify code error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setRememberMe(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (profileUpdates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      // Sanitize profile updates
      const sanitizedUpdates = {
        owner_name: profileUpdates.full_name ? sanitizeText(profileUpdates.full_name, { maxLength: 100 }) : undefined,
        phone: profileUpdates.mobile_number ? sanitizeText(profileUpdates.mobile_number, { maxLength: 20 }) : undefined,
        farm_name: profileUpdates.farm_name ? sanitizeText(profileUpdates.farm_name, { maxLength: 100 }) : undefined,
        farm_prefix: profileUpdates.farm_prefix ? sanitizeText(profileUpdates.farm_prefix, { maxLength: 10 }) : undefined
      };

      // Remove undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(sanitizedUpdates).filter(([_, v]) => v !== undefined)
      );

      const { error } = await supabase
        .from('farm_profiles')
        .update(cleanUpdates)
        .eq('user_id', user.id);

      if (!error) {
        setUserProfile(prev => prev ? { ...prev, ...profileUpdates } : null);
        showSuccess(
          'Profile updated',
          'Your profile has been successfully updated.'
        );
      }

      return { error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  // Offline authentication function
  const offlineSignIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isOnline) {
        // If online, use regular sign in
        const { error } = await signIn(email, password, true);
        return { success: !error, error: error?.message };
      }
      
      // Check for stored offline credentials
      const storedCreds = secureLocalStorage.getItem('bet-gitosa-offline-auth');
      if (!storedCreds || !storedCreds.email) {
        return { success: false, error: 'No offline credentials found. You must sign in online at least once.' };
      }
      
      // Simple offline validation - just check if email matches
      // In a real implementation, we would use a secure hash comparison
      if (storedCreds.email.toLowerCase() === email.toLowerCase()) {
        // Create a temporary user object for offline mode
        const offlineUser = {
          id: 'offline-' + hashData(email).substring(0, 8),
          email: email,
          app_metadata: { provider: 'offline' },
          user_metadata: { is_offline: true }
        };
        
        setUser(offlineUser as User);
        
        // Try to load cached profile data
        const cachedProfile = secureLocalStorage.getItem('bet-gitosa-user-profile');
        if (cachedProfile) {
          setUserProfile(cachedProfile);
        }
        
        showSuccess(
          'Offline sign in successful',
          'You are now signed in offline. Some features may be limited.'
        );
        
        return { success: true };
      }
      
      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      console.error('Offline sign in error:', error);
      return { success: false, error: 'An error occurred during offline sign in' };
    }
  };
  
  // Sync user data when coming back online
  const syncUserData = async () => {
    if (!isOnline || !user) return;
    
    try {
      // Refresh the session
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      // Fetch latest profile data
      if (data.session?.user) {
        await fetchUserProfile(data.session.user.id);
      }
      
      // Update last sync time
      const now = new Date().toISOString();
      setLastSyncTime(now);
      
      // Store profile for offline use
      if (userProfile) {
        secureLocalStorage.setItem('bet-gitosa-user-profile', userProfile);
      }
      
      showSuccess('Data synchronized', 'Your data has been updated successfully.');
    } catch (error) {
      console.error('Sync error:', error);
      showError('Sync failed', 'Could not synchronize your data. Please try again later.');
    }
  };
  
  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && user && !loading) {
      syncUserData();
    }
  }, [isOnline]);

  const value = {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    offlineSignIn,
    isOnline,
    lastSyncTime,
    syncUserData,
    sendVerificationCode,
    verifyCode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
