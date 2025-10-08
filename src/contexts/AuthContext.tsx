
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useInputSanitization } from '@/hooks/useInputSanitization';

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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
          
          if (event === 'SIGNED_IN') {
            showSuccess(
              'Welcome back!',
              'You have been successfully signed in.'
            );
          }
        } else {
          setUserProfile(null);
          if (event === 'SIGNED_OUT') {
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
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, remember = false) => {
    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeEmail(email);

      if (!sanitizedEmail || !password) {
        throw new Error('Email and password are required');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        throw new Error('Please enter a valid email address');
      }

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
      // Sanitize inputs
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedFullName = fullName ? sanitizeText(fullName, { maxLength: 100 }) : undefined;
      const sanitizedMobile = sanitizeText(mobileNumber, { maxLength: 20 });

      if (!sanitizedEmail || !password || !sanitizedMobile) {
        throw new Error('Email, password, and mobile number are required');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

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

  const value = {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
