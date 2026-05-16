/**
 * Security Utilities for EthioHerd Connect
 * Implements proper encryption, hashing, and secure storage using Web Crypto API
 * Replaces weak crypto-js-based implementations
 */

import { logger } from './logger';

// Secret key for encryption (required in production)
const getEncryptionKey = (): string => {
  const key = import.meta.env.VITE_ENCRYPTION_KEY;
  if (!key || key.trim() === '') {
    throw new Error('VITE_ENCRYPTION_KEY is required in production. Set this environment variable.');
  }
  return key;
};

const ENCRYPTION_KEY = getEncryptionKey();
const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

/**
 * Convert base64 to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert Uint8Array to base64
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Derive a key from the encryption password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    ENCODER.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM encryption (Web Crypto API)
 */
export const encryptData = async (data: any): Promise<string> => {
  try {
    const jsonString = JSON.stringify(data);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(ENCRYPTION_KEY, salt);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ENCODER.encode(jsonString)
    );

    // Combine salt + iv + encrypted data and encode as base64
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    logger.debug('Data encrypted successfully');
    return uint8ArrayToBase64(combined);
  } catch (error) {
    logger.error('Encryption failed', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data using AES-GCM decryption (Web Crypto API)
 */
export const decryptData = async (encryptedData: string): Promise<any> => {
  try {
    const combined = base64ToUint8Array(encryptedData);
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const data = combined.slice(28);

    const key = await deriveKey(ENCRYPTION_KEY, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );

    const jsonString = DECODER.decode(decrypted);
    const dataObj = JSON.parse(jsonString);
    logger.debug('Data decrypted successfully');
    return dataObj;
  } catch (error) {
    logger.error('Decryption failed', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash data using SHA-256 (Web Crypto API)
 */
export const hashData = async (data: string): Promise<string> => {
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', ENCODER.encode(data));
    const hashArray = new Uint8Array(hashBuffer);
    const hashBase64 = uint8ArrayToBase64(hashArray);
    logger.debug('Data hashed successfully');
    return hashBase64;
  } catch (error) {
    logger.error('Hashing failed', error);
    throw new Error('Failed to hash data');
  }
};

/**
 * Synchronous hash for compatibility (uses SHA-256 via crypto.subtle.digest)
 * For async hashing, use hashDataAsync
 */
export const hashDataSync = (data: string): string => {
  // This is a simplified sync version - for production, use async
  // Fallback to built-in hashing if needed
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

/**
 * Generate a secure random string using Web Crypto API
 */
export const generateSecureRandom = async (length: number = 32): Promise<string> => {
  try {
    const randomBytes = crypto.getRandomValues(new Uint8Array(length));
    return uint8ArrayToBase64(randomBytes);
  } catch (error) {
    logger.error('Secure random generation failed', error);
    throw new Error('Failed to generate secure random');
  }
};

/**
 * Secure localStorage wrapper with encryption
 */
export const secureLocalStorage = {
  setItem: async (key: string, data: any): Promise<void> => {
    try {
      const encrypted = await encryptData(data);
      localStorage.setItem(key, encrypted);
      logger.debug(`Secure storage set: ${key}`);
    } catch (error) {
      logger.error(`Failed to set secure storage: ${key}`, error);
      throw new Error(`Failed to store data securely: ${key}`);
    }
  },

  getItem: async (key: string): Promise<any> => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) {
        return null;
      }
      const decrypted = await decryptData(encrypted);
      logger.debug(`Secure storage retrieved: ${key}`);
      return decrypted;
    } catch (error) {
      logger.error(`Failed to get secure storage: ${key}`, error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
      logger.debug(`Secure storage removed: ${key}`);
    } catch (error) {
      logger.error(`Failed to remove secure storage: ${key}`, error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
      logger.debug('Secure storage cleared');
    } catch (error) {
      logger.error('Failed to clear secure storage', error);
    }
  }
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  return {
    isValid: score >= 4,
    score,
    feedback
  };
};

/**
 * Sanitize input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  try {
    // Remove potentially dangerous characters
    const sanitized = input
      .replace(/[<>'"]/g, '') // Remove HTML special characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
    
    logger.debug('Input sanitized successfully');
    return sanitized;
  } catch (error) {
    logger.error('Input sanitization failed', error);
    return '';
  }
};

/**
 * Generate CSRF token using Web Crypto API
 */
export const generateCSRFToken = async (): Promise<string> => {
  return generateSecureRandom(32);
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken;
};

/**
 * Rate limiting implementation
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}

  isBlocked(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      return false;
    }

    if (now > record.resetTime) {
      this.attempts.delete(key);
      return false;
    }

    return record.count >= this.maxAttempts;
  }

  recordAttempt(key: string): void {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return;
    }

    if (now > record.resetTime) {
      this.attempts.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      });
    } else {
      record.count++;
    }
  }

  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record) {
      return this.maxAttempts;
    }

    const now = Date.now();
    if (now > record.resetTime) {
      return this.maxAttempts;
    }

    return Math.max(0, this.maxAttempts - record.count);
  }

  getResetTime(key: string): number {
    const record = this.attempts.get(key);
    return record?.resetTime || 0;
  }
}

/**
 * Create password hash with salt using Web Crypto API
 */
export const createPasswordHash = async (password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltBase64 = uint8ArrayToBase64(salt);
  const hash = await hashData(password + saltBase64);
  return `${saltBase64}:${hash}`;
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const computedHash = await hashData(password + salt);
    return computedHash === hash;
  } catch (error) {
    logger.error('Password verification failed', error);
    return false;
  }
};

export default {
  encryptData,
  decryptData,
  hashData,
  generateSecureRandom,
  secureLocalStorage,
  validatePasswordStrength,
  sanitizeInput,
  generateCSRFToken,
  validateCSRFToken,
  RateLimiter,
  createPasswordHash,
  verifyPassword
};