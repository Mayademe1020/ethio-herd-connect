
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useRateLimiting } from '@/hooks/useRateLimiting';
import { useToastNotifications } from '@/hooks/useToastNotifications';

export const useEnhancedAuth = () => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { logSecurityEvent } = useSecurityMonitoring();
  const { showError, showSuccess } = useToastNotifications();
  
  // Rate limiting: 5 attempts per 15 minutes, 30 minute block
  const rateLimiter = useRateLimiting({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  });

  const secureSignIn = async (email: string, password: string, rememberMe = false) => {
    // Check rate limiting
    if (rateLimiter.isBlocked()) {
      return { error: new Error('Rate limited') };
    }

    if (!rateLimiter.recordAttempt()) {
      return { error: new Error('Rate limited') };
    }

    setLoading(true);
    
    try {
      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Log security event
      await logSecurityEvent('login_attempt', {
        email: email.toLowerCase(),
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      });

      const { error } = await signIn(email.toLowerCase(), password, rememberMe);
      
      if (error) {
        await logSecurityEvent('login_failed', {
          email: email.toLowerCase(),
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        throw error;
      }

      // Reset rate limiter on successful login
      rateLimiter.reset();
      
      await logSecurityEvent('login_success', {
        email: email.toLowerCase(),
        timestamp: new Date().toISOString()
      });

      showSuccess('Login Successful', 'Welcome back!');
      return { error: null };
      
    } catch (error: any) {
      console.error('Enhanced auth error:', error);
      showError('Login Failed', error.message || 'Failed to sign in');
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
