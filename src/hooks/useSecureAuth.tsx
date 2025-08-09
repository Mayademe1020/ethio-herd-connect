
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/useToastNotifications';

interface AccountSecurity {
  failed_login_attempts: number;
  account_locked_until: string | null;
}

export const useSecureAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useToastNotifications();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAccountLock = async (email: string): Promise<boolean> => {
    try {
      // Check if account is locked by looking for security record
      const { data, error } = await supabase
        .from('account_security')
        .select('failed_login_attempts, account_locked_until')
        .eq('user_id', email) // We'll use email as identifier for now
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking account lock:', error);
        return false;
      }

      if (data?.account_locked_until) {
        const lockUntil = new Date(data.account_locked_until);
        if (lockUntil > new Date()) {
          const minutesLeft = Math.ceil((lockUntil.getTime() - Date.now()) / 60000);
          showError(
            'Account Locked',
            `Your account is locked due to multiple failed login attempts. Try again in ${minutesLeft} minutes.`
          );
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking account lock:', error);
      return false;
    }
  };

  const recordFailedLogin = async (email: string) => {
    try {
      const { data: existingSecurity } = await supabase
        .from('account_security')
        .select('*')
        .eq('user_id', email)
        .maybeSingle();

      const failedAttempts = (existingSecurity?.failed_login_attempts || 0) + 1;
      const shouldLock = failedAttempts >= 5;
      const lockUntil = shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null; // 15 minutes lock

      if (existingSecurity) {
        await supabase
          .from('account_security')
          .update({
            failed_login_attempts: failedAttempts,
            last_failed_login: new Date().toISOString(),
            account_locked_until: lockUntil?.toISOString() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSecurity.id);
      } else {
        await supabase
          .from('account_security')
          .insert({
            user_id: email,
            failed_login_attempts: failedAttempts,
            last_failed_login: new Date().toISOString(),
            account_locked_until: lockUntil?.toISOString() || null
          });
      }

      if (shouldLock) {
        showError(
          'Account Locked',
          'Too many failed login attempts. Your account has been locked for 15 minutes.'
        );
      } else {
        showError(
          'Login Failed',
          `Invalid credentials. ${5 - failedAttempts} attempts remaining before account lock.`
        );
      }
    } catch (error) {
      console.error('Error recording failed login:', error);
    }
  };

  const clearFailedLogins = async (userId: string) => {
    try {
      await supabase
        .from('account_security')
        .update({
          failed_login_attempts: 0,
          account_locked_until: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error clearing failed logins:', error);
    }
  };

  const secureSignIn = async (email: string, password: string) => {
    try {
      // Check if account is locked
      const isLocked = await checkAccountLock(email);
      if (isLocked) {
        return { error: new Error('Account locked') };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await recordFailedLogin(email);
        return { error };
      }

      if (data.user) {
        await clearFailedLogins(data.user.id);
        showSuccess('Welcome back!', 'You have been successfully signed in.');
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const auditLog = async (action: string, tableName: string, recordId?: string, oldValues?: any, newValues?: any) => {
    if (!user) return;

    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action,
          table_name: tableName,
          record_id: recordId,
          old_values: oldValues,
          new_values: newValues,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  };

  return {
    user,
    session,
    loading,
    secureSignIn,
    auditLog,
    signOut: () => supabase.auth.signOut()
  };
};
