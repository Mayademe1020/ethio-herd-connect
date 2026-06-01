
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useRateLimiting } from '@/hooks/useRateLimiting';
import { toast } from 'sonner';

export const useEnhancedAuth = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityMonitoring();
  
  // Rate limiting: 5 attempts per 15 minutes, 30 minute block
  const rateLimiter = useRateLimiting({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  });

  const secureSignIn = async () => {
    // In local-first MVP, user is always auto-authenticated
    if (rateLimiter.isBlocked()) {
      return { error: new Error('Rate limited') };
    }

    if (!rateLimiter.recordAttempt()) {
      return { error: new Error('Rate limited') };
    }

    setLoading(true);
    
    try {
      if (!user) {
        throw new Error('No local user found');
      }

      await logSecurityEvent('login_success', {
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      rateLimiter.reset();
      toast.success('Welcome back!');
      return { error: null };

    } catch (error: unknown) {
      console.error('Enhanced auth error:', error);
      toast.error('Login Failed');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    secureSignIn,
    loading,
    attemptsRemaining: rateLimiter.attemptsRemaining
  };
};
