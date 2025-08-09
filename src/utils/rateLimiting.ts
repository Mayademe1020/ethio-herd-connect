
// Client-side rate limiting utilities

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(key: string, maxRequests: number): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - entry.count);
  }

  getResetTime(key: string): number | null {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return null;
    }
    return entry.resetTime;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  HEALTH_SUBMISSION: { maxRequests: 5, windowMs: 60000 }, // 5 per minute
  VACCINATION_RECORD: { maxRequests: 10, windowMs: 300000 }, // 10 per 5 minutes
  WEIGHT_ENTRY: { maxRequests: 20, windowMs: 300000 }, // 20 per 5 minutes
  MARKET_LISTING: { maxRequests: 3, windowMs: 300000 }, // 3 per 5 minutes
  FILE_UPLOAD: { maxRequests: 5, windowMs: 60000 }, // 5 per minute
  LOGIN_ATTEMPT: { maxRequests: 5, windowMs: 300000 }, // 5 per 5 minutes
} as const;

// Cleanup rate limiter every 5 minutes
setInterval(() => {
  rateLimiter.cleanup();
}, 300000);
