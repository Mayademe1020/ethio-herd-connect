/**
 * Rate Limiter for muzzle identification requests
 * Implements sliding window rate limiting to prevent abuse of biometric identification
 * Critical for production security with biometric data
 */

import { logger } from './logger';

export interface RateLimitConfig {
  maxRequests: number; // Maximum requests per window
  windowMs: number; // Time window in milliseconds
  blockDurationMs: number; // How long to block after exceeding limit
}

export interface RateLimitEntry {
  userId: string;
  requests: number[];
  blockedUntil?: number;
}

const DEFAULT_RATE_LIMITS = {
  muzzle_identification: {
    maxRequests: 10, // 10 identifications per minute
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes block
  },
  api_calls: {
    maxRequests: 100, // 100 API calls per minute
    windowMs: 60 * 1000,
    blockDurationMs: 15 * 60 * 1000, // 15 minutes block
  },
} as const;

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();

  /**
   * Check if a request should be allowed based on rate limits
   */
  async checkLimit(
    userId: string,
    action: keyof typeof DEFAULT_RATE_LIMITS,
    config?: Partial<RateLimitConfig>
  ): Promise<{ allowed: boolean; remainingRequests: number; resetTime: number; blockedUntil?: number }> {
    const limitConfig = { ...DEFAULT_RATE_LIMITS[action], ...config };
    const now = Date.now();
    const key = `${userId}:${action}`;

    let entry = this.limits.get(key);
    if (!entry) {
      entry = { userId, requests: [] };
      this.limits.set(key, entry);
    }

    // Check if currently blocked
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.blockedUntil,
        blockedUntil: entry.blockedUntil,
      };
    }

    // Clean old requests outside the window
    entry.requests = entry.requests.filter(timestamp => now - timestamp < limitConfig.windowMs);

    // Check if under limit
    if (entry.requests.length < limitConfig.maxRequests) {
      entry.requests.push(now);
      const remaining = limitConfig.maxRequests - entry.requests.length;
      const resetTime = now + limitConfig.windowMs;

      return {
        allowed: true,
        remainingRequests: remaining,
        resetTime,
      };
    }

    // Exceeded limit - block the user
    entry.blockedUntil = now + limitConfig.blockDurationMs;
    entry.requests = []; // Reset request count

    logger.warn(`Rate limit exceeded for user ${userId}, action: ${action}`, {
      userId,
      action,
      requestCount: entry.requests.length,
      limit: limitConfig.maxRequests,
      blockDurationMs: limitConfig.blockDurationMs,
    });

    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: entry.blockedUntil,
      blockedUntil: entry.blockedUntil,
    };
  }

  /**
   * Get current rate limit status for a user and action
   */
  getStatus(userId: string, action: keyof typeof DEFAULT_RATE_LIMITS): RateLimitEntry | null {
    const key = `${userId}:${action}`;
    return this.limits.get(key) || null;
  }

  /**
   * Clear rate limit data for a user (admin function)
   */
  clearUserLimits(userId: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.limits.keys()) {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.limits.delete(key));
    logger.info(`Cleared rate limits for user: ${userId}`);
  }

  /**
   * Clear all expired blocks and old data
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.limits.entries()) {
      // Remove expired blocks
      if (entry.blockedUntil && now > entry.blockedUntil) {
        entry.blockedUntil = undefined;
      }

      // Remove old requests
      entry.requests = entry.requests.filter(timestamp => now - timestamp < 24 * 60 * 60 * 1000); // Keep last 24 hours

      // Remove empty entries
      if (entry.requests.length === 0 && !entry.blockedUntil) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.limits.delete(key));

    if (keysToDelete.length > 0) {
      logger.debug(`Cleaned up ${keysToDelete.length} expired rate limit entries`);
    }
  }

  /**
   * Get rate limit statistics
   */
  getStats(): {
    totalEntries: number;
    blockedUsers: number;
    activeLimits: number;
  } {
    let blockedUsers = 0;
    let activeLimits = 0;
    const now = Date.now();

    for (const entry of this.limits.values()) {
      if (entry.blockedUntil && now < entry.blockedUntil) {
        blockedUsers++;
      }
      if (entry.requests.length > 0) {
        activeLimits++;
      }
    }

    return {
      totalEntries: this.limits.size,
      blockedUsers,
      activeLimits,
    };
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Periodic cleanup
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000); // Clean up every 5 minutes

export default rateLimiter;
