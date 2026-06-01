import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLocalUser: boolean;
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

const STORAGE_KEY = 'ethio-herd-user-id';

const getOrCreateLocalUserId = (): string => {
  let userId = localStorage.getItem(STORAGE_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, userId);
  }
  return userId;
};

const createLocalUser = (userId: string): User => ({
  id: userId,
  email: null,
  user_metadata: {
    is_local: true,
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
  const [isLocalUser, setIsLocalUser] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const localUserId = getOrCreateLocalUserId();
    let cancelled = false;

    if (!isSupabaseConfigured || !supabase) {
      setUser(createLocalUser(localUserId));
      setIsLocalUser(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        setIsLocalUser(false);
      } else {
        setUser(createLocalUser(localUserId));
        setIsLocalUser(true);
      }
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setUser(createLocalUser(localUserId));
      setIsLocalUser(true);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        setIsLocalUser(false);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const localUserId = localStorage.getItem(STORAGE_KEY) || crypto.randomUUID();
    setUser(createLocalUser(localUserId));
    setIsLocalUser(true);
    setSession(null);

    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) { logger.warn('Failed to sign out from Supabase:', e); }
    }
  };

  const value = {
    user,
    session,
    loading,
    isLocalUser,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
