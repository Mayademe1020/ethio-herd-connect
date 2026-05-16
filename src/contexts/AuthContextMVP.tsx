// src/contexts/AuthContextMVP.tsx - Resilient MVP Authentication Context

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
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

// Demo user for offline mode
const createDemoUser = (): User => ({
  id: 'demo-user-123',
  email: 'demo@ethioherdconnect.app',
  user_metadata: {
    full_name: 'Demo Farmer',
    phone: '+251911000000',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
});

export const AuthProviderMVP: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (initRef.current) return;
    initRef.current = true;

    // Check for demo user in localStorage first
    const demoUserJson = localStorage.getItem('demo-user');
    if (demoUserJson) {
      try {
        const demoUser = JSON.parse(demoUserJson);
        const mockUser = createDemoUser();
        mockUser.user_metadata = demoUser.user_metadata || mockUser.user_metadata;
        setUser(mockUser);
        setIsDemoMode(true);
        setLoading(false);
        console.log('[Auth] Demo user loaded from localStorage');
        return;
      } catch (e) {
        console.error('[Auth] Failed to parse demo user:', e);
        localStorage.removeItem('demo-user');
      }
    }

    // If Supabase is not configured, enable demo mode automatically
    if (!isSupabaseConfigured || !supabase) {
      console.log('[Auth] Supabase not configured - enabling demo mode');
      const demoUser = createDemoUser();
      setUser(demoUser);
      setIsDemoMode(true);
      localStorage.setItem('demo-user', JSON.stringify({
        id: demoUser.id,
        email: demoUser.email,
        user_metadata: demoUser.user_metadata,
      }));
      setLoading(false);
      return;
    }

    // Set a timeout to ensure loading completes even if Supabase is slow
    const timeoutId = setTimeout(() => {
      console.log('[Auth] Timeout reached - enabling demo mode fallback');
      if (loading) {
        const demoUser = createDemoUser();
        setUser(demoUser);
        setIsDemoMode(true);
        localStorage.setItem('demo-user', JSON.stringify({
          id: demoUser.id,
          email: demoUser.email,
          user_metadata: demoUser.user_metadata,
        }));
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeoutId);
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        console.log('[Auth] Session loaded:', session.user.id);
      } else {
        console.log('[Auth] No existing session');
      }
      setLoading(false);
    }).catch((error) => {
      clearTimeout(timeoutId);
      console.warn('[Auth] Supabase error, enabling demo mode:', error.message);
      const demoUser = createDemoUser();
      setUser(demoUser);
      setIsDemoMode(true);
      localStorage.setItem('demo-user', JSON.stringify({
        id: demoUser.id,
        email: demoUser.email,
        user_metadata: demoUser.user_metadata,
      }));
      setLoading(false);
    });

    // Listen for auth state changes (only if supabase exists)
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('[Auth] State changed:', event);
        if (session?.user) {
          setSession(session);
          setUser(session.user);
        }
        setLoading(false);
      });
      subscription = data.subscription;
    } catch (error) {
      console.warn('[Auth] Failed to subscribe to auth changes:', error);
    }

    return () => {
      clearTimeout(timeoutId);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('demo-user');
      setUser(null);
      setSession(null);
      setIsDemoMode(false);
      toast.success('✓ Demo mode ended / ዴሞ ጨረሰ');
      return;
    }

    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('[Auth] Sign out error:', error);
      }
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