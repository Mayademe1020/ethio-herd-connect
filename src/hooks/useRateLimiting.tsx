
import { useState, useCallback } from 'react';
import { useToastNotifications } from '@/hooks/useToastNotifications';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

export const useRateLimiting = (config: RateLimitConfig) => {
  const [state, setState] = useState<RateLimitState>({ attempts: 0, lastAttempt: 0 });
  const { showError } = useToastNotifications();

  const isBlocked = useCallback(() => {
    const now = Date.now();
    
    if (state.blockedUntil && now < state.blockedUntil) {
      const remainingTime = Math.ceil((state.blockedUntil - now) / 1000);
      showError(
        'Rate Limit Exceeded',
        `Too many attempts. Please wait ${remainingTime} seconds before trying again.`
      );
      return true;
    }

    return false;
  }, [state.blockedUntil, showError]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    
    // Reset attempts if window has passed
    if (now - state.lastAttempt > config.windowMs) {
      setState({ attempts: 1, lastAttempt: now });
      return true;
    }

    const newAttempts = state.attempts + 1;
    
    if (newAttempts >= config.maxAttempts) {
      setState({
        attempts: newAttempts,
        lastAttempt: now,
        blockedUntil: now + config.blockDurationMs
      });
      
      showError(
        'Rate Limit Exceeded',
        `Too many attempts. Blocked for ${config.blockDurationMs / 1000} seconds.`
      );
      return false;
    }

    setState({ attempts: newAttempts, lastAttempt: now });
    return true;
  }, [state, config, showError]);

  const reset = useCallback(() => {
    setState({ attempts: 0, lastAttempt: 0 });
  }, []);

  return {
    isBlocked,
    recordAttempt,
    reset,
    attemptsRemaining: Math.max(0, config.maxAttempts - state.attempts)
  };
};
