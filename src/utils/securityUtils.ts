/**
 * Security Utilities for EthioHerd Connect
 * Implements proper encryption, hashing, and secure storage
 * Replaces weak btoa-based implementations with cryptographically secure alternatives
 */

import CryptoJS from 'crypto-js';
import { logger } from './logger';

// Secret key for encryption (required in production)
const getEncryptionKey = (): string => {
  const key = import.meta.env.VITE_ENCRYPTION_KEY;
  if (!key || key.trim() === '') {
    if (import.meta.env.PROD) {
      throw new Error('VITE_ENCRYPTION_KEY is required in production. Set this environment variable.');
    }
    return 'dev-fallback-key-not-for-production';
  }
  return key;
};

const ENCRYPTION_KEY = getEncryptionKey();

/**
 * Encrypt data using AES encryption
 */
export const encryptData = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
    logger.debug('Data encrypted successfully');
    return encrypted;
  } catch (error) {
    logger.error('Encryption failed', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data using AES decryption
 */
export const decryptData = (encryptedData: string): any => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!jsonString) {
      throw new Error('Decryption resulted in empty string');
    }
    
    const data = JSON.parse(jsonString);
    logger.debug('Data decrypted successfully');
    return data;
  } catch (error) {
    logger.error('Decryption failed', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Hash data using SHA-256
 */
export const hashData = (data: string): string => {
  try {
    const hash = CryptoJS.SHA256(data).toString();
    logger.debug('Data hashed successfully');
    return hash;
  } catch (error) {
    logger.error('Hashing failed', error);
    throw new Error('Failed to hash data');
  }
};

/**
 * Generate a secure random string
 */
export const generateSecureRandom = (length: number = 32): string => {
  try {
    const randomBytes = CryptoJS.lib.WordArray.random(length);
    return randomBytes.toString();
  } catch (error) {
    logger.error('Secure random generation failed', error);
    throw new Error('Failed to generate secure random');
  }
};

/**
 * Secure localStorage wrapper with encryption
 */
export const secureLocalStorage = {
  setItem: (key: string, data: any): void => {
    try {
      const encrypted = encryptData(data);
      localStorage.setItem(key, encrypted);
      logger.debug(`Secure storage set: ${key}`);
    } catch (error) {
      logger.error(`Failed to set secure storage: ${key}`, error);
      throw new Error(`Failed to store data securely: ${key}`);
    }
  },

  getItem: (key: string): any => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) {
        return null;
      }
      
      const decrypted = decryptData(encrypted);
      logger.debug(`Secure storage retrieved: ${key}`);
      return decrypted;
    } catch (error) {
      logger.error(`Failed to get secure storage: ${key}`, error);
      // Return null for corrupted data instead of throwing
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
 * Generate CSRF token
 */
export const generateCSRFToken = (): string => {
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
 * Create password hash with salt
 */
export const createPasswordHash = async (password: string): Promise<string> => {
  const salt = generateSecureRandom(16);
  const hash = hashData(password + salt);
  return `${salt}:${hash}`;
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const computedHash = hashData(password + salt);
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