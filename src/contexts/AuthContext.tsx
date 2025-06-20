
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToastNotifications } from '@/hooks/useToastNotifications';

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
      setRememberMe(remember);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
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
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            mobile_number: mobileNumber,
            full_name: fullName
          }
        }
      });

      // Create farm profile record if signup successful
      if (!error && data.user) {
        const { error: profileError } = await supabase
          .from('farm_profiles')
          .insert([
            {
              user_id: data.user.id,
              owner_name: fullName || '',
              phone: mobileNumber,
              farm_name: `${fullName || 'User'}'s Farm`,
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

      const { error } = await supabase
        .from('farm_profiles')
        .update({
          owner_name: profileUpdates.full_name,
          phone: profileUpdates.mobile_number,
          farm_name: profileUpdates.farm_name,
          farm_prefix: profileUpdates.farm_prefix
        })
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
