/**
 * Client-side rate limiting utility
 * Prevents abuse and excessive API calls
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if an action is rate limited
   * @param key - Unique identifier for the action (e.g., 'login:user@email.com')
   * @param config - Rate limit configuration
   * @returns true if action is allowed, false if rate limited
   */
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.storage.get(key);

    // Clean up expired entries periodically
    if (Math.random() < 0.1) {
      this.cleanup();
    }

    // No previous attempts or window expired
    if (!entry || now > entry.resetTime) {
      this.storage.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    // Within rate limit
    if (entry.count < config.maxAttempts) {
      entry.count++;
      return true;
    }

    // Rate limited
    return false;
  }

  /**
   * Get remaining time until rate limit resets
   * @param key - Unique identifier for the action
   * @returns milliseconds until reset, or 0 if not rate limited
   */
  getRemainingTime(key: string): number {
    const entry = this.storage.get(key);
    if (!entry) return 0;

    const now = Date.now();
    const remaining = entry.resetTime - now;
    return Math.max(0, remaining);
  }

  /**
   * Reset rate limit for a specific key
   * @param key - Unique identifier for the action
   */
  reset(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Common rate limit configurations
export const RATE_LIMITS = {
  // Authentication
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  SIGNUP: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  PASSWORD_RESET: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
  
  // API calls
  API_CALL: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 per minute
  SEARCH: { maxAttempts: 30, windowMs: 60 * 1000 }, // 30 per minute
  
  // User actions
  MESSAGE_SEND: { maxAttempts: 20, windowMs: 60 * 1000 }, // 20 per minute
  BOOKING_CREATE: { maxAttempts: 5, windowMs: 60 * 1000 }, // 5 per minute
  REVIEW_CREATE: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  
  // File uploads
  FILE_UPLOAD: { maxAttempts: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
};

/**
 * Helper function to format remaining time
 */
export const formatRemainingTime = (ms: number): string => {
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 1) return 'menos de un minuto';
  if (minutes === 1) return '1 minuto';
  if (minutes < 60) return `${minutes} minutos`;
  const hours = Math.ceil(minutes / 60);
  return hours === 1 ? '1 hora' : `${hours} horas`;
};
