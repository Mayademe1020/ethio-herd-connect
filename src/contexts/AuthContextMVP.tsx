// src/contexts/AuthContextMVP.tsx - Simplified MVP Authentication Context

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProviderMVP: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo user first (DEVELOPMENT ONLY - disabled in production)
    const demoUserJson = localStorage.getItem('demo-user');
    if (import.meta.env.DEV && demoUserJson) {
      try {
        const demoUser = JSON.parse(demoUserJson);
        // Create a mock User object
        const mockUser: User = {
          id: demoUser.id,
          email: demoUser.email,
          user_metadata: demoUser.user_metadata,
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          role: 'authenticated',
          updated_at: new Date().toISOString(),
        } as User;
        
        setUser(mockUser);
        setLoading(false);
        console.log('Demo user loaded:', mockUser.id);
        return;
      } catch (e) {
        console.error('Failed to parse demo user:', e);
        localStorage.removeItem('demo-user');
      }
    }

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toast.success('✓ እንኳን ደህና መጡ / Welcome!', {
            description: 'You have been successfully signed in'
          });
        } else if (event === 'SIGNED_OUT') {
          toast.success('✓ ተወጥተዋል / Signed out', {
            description: 'You have been successfully signed out'
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      // Clear demo user if exists
      const demoUser = localStorage.getItem('demo-user');
      if (demoUser) {
        localStorage.removeItem('demo-user');
        localStorage.removeItem('sb-pbtaolycccmmqmwurinp-auth-token');
        setUser(null);
        setSession(null);
        toast.success('✓ Demo mode ended / ዴሞ ጨረሰ', {
          description: 'You have been signed out'
        });
        return;
      }
      
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('መውጣት አልተቻለም / Sign out failed', {
        description: 'Please try again'
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
