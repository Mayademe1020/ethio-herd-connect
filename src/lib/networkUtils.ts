// src/lib/networkUtils.ts
// Network utilities with retry logic and timeout handling

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  backoffMultiplier?: number;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000,
  backoffMultiplier: 2,
};

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxRetries, retryDelay, backoffMultiplier } = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if it's the last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Check if error is retryable
      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
      
      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms:`, lastError.message);
      
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Execute a function with timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = DEFAULT_CONFIG.timeout
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Execute a function with both retry and timeout
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { timeout, ...retryConfig } = { ...DEFAULT_CONFIG, ...config };
  
  return withRetry(() => withTimeout(fn, timeout), retryConfig);
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: Error): boolean {
  const retryableMessages = [
    'network',
    'timeout',
    'aborted',
    'failed to fetch',
    'connection',
    '503',
    '502',
    '504',
    '429',
    'ECONNRESET',
    'ETIMEDOUT',
    'ERR_CONNECTION_CLOSED',
  ];

  const errorMessage = error.message.toLowerCase();
  return retryableMessages.some(msg => errorMessage.includes(msg));
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Wait for online status
 */
export function waitForOnline(timeoutMs: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout waiting for online status'));
    }, timeoutMs);

    const handleOnline = () => {
      cleanup();
      resolve();
    };

    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('online', handleOnline);
    };

    window.addEventListener('online', handleOnline);
  });
}

/**
 * Circuit breaker pattern for failing operations
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold = 5,
    private resetTimeoutMs = 30000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - (this.lastFailureTime || 0) > this.resetTimeoutMs) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open - too many failures');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }
}

// Global circuit breaker for Supabase
export const supabaseCircuitBreaker = new CircuitBreaker(5, 30000);
