/**
 * Security utilities for Ethio Herd Connect
 * Provides data encryption, sanitization, and security features
 * Optimized for offline-first applications with sensitive livestock data
 */

import CryptoJS from 'crypto-js';
import DOMPurify from 'dompurify';
import { logger } from './logger';

// Resolve env vars safely across Vite and CRA builds
const getEnv = (keyCRA: string, keyVite: string): string | undefined => {
  try {
    // CRA-style env on server-side or test
    if (typeof process !== 'undefined' && (process as any).env && (process as any).env[keyCRA]) {
      return (process as any).env[keyCRA];
    }
    // Vite-style env in the browser
    const viteEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env : undefined;
    if (viteEnv && viteEnv[keyVite]) {
      return viteEnv[keyVite] as string;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

// Secret key for encryption (in production, this should be stored securely)
const SECRET_KEY = getEnv('REACT_APP_ENCRYPTION_KEY', 'VITE_ENCRYPTION_KEY') || 'ethio-herd-default-key';

// Additional key for sensitive farmer data
const FARMER_DATA_KEY = getEnv('REACT_APP_FARMER_DATA_KEY', 'VITE_FARMER_DATA_KEY') || 'ethio-farmer-data-key';

/**
 * Encrypts sensitive data for local storage
 * @param data Data to encrypt
 * @returns Encrypted string
 */
export const encryptData = (data: any): string => {
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
  } catch (error) {
    logger.error('Encryption error', error);
    return '';
  }
};

/**
 * Enhanced encryption for sensitive farmer data with additional security layer
 * @param data Sensitive farmer data to encrypt
 * @returns Double-encrypted string
 */
export const encryptSensitiveData = (data: any): string => {
  try {
    // First encryption layer
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const firstLayer = CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
    
    // Second encryption layer with different key
    return CryptoJS.AES.encrypt(firstLayer, FARMER_DATA_KEY).toString();
  } catch (error) {
    logger.error('Sensitive data encryption error', error);
    return '';
  }
};

/**
 * Decrypts sensitive farmer data
 * @param encryptedData Double-encrypted string
 * @returns Decrypted data
 */
export const decryptSensitiveData = (encryptedData: string): any => {
  try {
    // First decryption layer
    const firstDecrypt = CryptoJS.AES.decrypt(encryptedData, FARMER_DATA_KEY);
    const firstLayer = firstDecrypt.toString(CryptoJS.enc.Utf8);
    
    // Second decryption layer
    const secondDecrypt = CryptoJS.AES.decrypt(firstLayer, SECRET_KEY);
    const decryptedString = secondDecrypt.toString(CryptoJS.enc.Utf8);
    
    try {
      // Try to parse as JSON first
      return JSON.parse(decryptedString);
    } catch {
      // If not valid JSON, return as string
      return decryptedString;
    }
  } catch (error) {
    logger.error('Sensitive data decryption error', error);
    return null;
  }
};

/**
 * Decrypts data from local storage
 * @param encryptedData Encrypted string
 * @returns Decrypted data
 */
export const decryptData = (encryptedData: string): any => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    try {
      // Try to parse as JSON first
      return JSON.parse(decryptedString);
    } catch {
      // If not valid JSON, return as string
      return decryptedString;
    }
  } catch (error) {
    logger.error('Decryption error', error);
    return null;
  }
};

/**
 * Sanitizes user input to prevent XSS attacks using DOMPurify
 * @param input User input string
 * @param allowBasicFormatting If true, allows basic HTML formatting (bold, italic, etc.)
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string, allowBasicFormatting: boolean = false): string => {
  if (!input) return '';
  
  // Configure DOMPurify based on whether we allow formatting
  const config = allowBasicFormatting
    ? {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
        ALLOWED_ATTR: []
      }
    : {
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: []
      };
  
  return DOMPurify.sanitize(input, config);
};

/**
 * Sanitizes HTML content while preserving safe formatting
 * @param html HTML content to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false
  });
};

/**
 * Sanitizes form data object by sanitizing all string values
 * @param data Form data object
 * @returns Sanitized form data object
 */
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data } as any;
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key] as string);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeFormData(sanitized[key]);
    } else if (Array.isArray(sanitized[key])) {
      // Sanitize array elements
      sanitized[key] = sanitized[key].map((item: any) => 
        typeof item === 'string' ? sanitizeInput(item) : 
        typeof item === 'object' && item !== null ? sanitizeFormData(item) : 
        item
      );
    }
  }
  
  return sanitized as T;
};

/**
 * Validates that a string contains no malicious code
 * @param input String to validate
 * @returns Boolean indicating if string is safe
 */
export const isInputSafe = (input: string): boolean => {
  if (!input) return true;
  
  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:/i,
    /vbscript:/i,
    /expression\(/i,
    /eval\(/i,
    /alert\(/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Sanitizes a URL to prevent javascript: and data: URIs
 * @param url URL to sanitize
 * @returns Sanitized URL or empty string if unsafe
 */
export const sanitizeURL = (url: string): string => {
  if (!url) return '';
  
  const trimmedUrl = url.trim().toLowerCase();
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  if (dangerousProtocols.some(protocol => trimmedUrl.startsWith(protocol))) {
    logger.warn('Blocked dangerous URL protocol', { url });
    return '';
  }
  
  // Allow http, https, mailto, tel
  if (trimmedUrl.startsWith('http://') || 
      trimmedUrl.startsWith('https://') || 
      trimmedUrl.startsWith('mailto:') || 
      trimmedUrl.startsWith('tel:') ||
      trimmedUrl.startsWith('/')) {
    return url.trim();
  }
  
  // If no protocol, assume relative URL
  return url.trim();
};

/**
 * Hashes sensitive data (like passwords) for comparison
 * @param data Data to hash
 * @returns Hashed string
 */
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

/**
 * Securely stores sensitive data in localStorage with encryption
 * @param key Storage key
 * @param data Data to store
 */
export const secureLocalStorage = {
  setItem: (key: string, data: any): void => {
    try {
      const encryptedData = encryptData(data);
      localStorage.setItem(key, encryptedData);
    } catch (error) {
      logger.error('Error storing encrypted data', error);
    }
  },
  
  getItem: (key: string): any => {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) return null;
      return decryptData(encryptedData);
    } catch (error) {
      logger.error('Error retrieving encrypted data', error);
      return null;
    }
  },
  
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  }
};

/**
 * Generates a secure random ID
 * @param length Length of ID
 * @returns Random ID string
 */
export const generateSecureId = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto API if available for better randomness
  if (window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += chars[values[i] % chars.length];
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
};

/**
 * Audit logging for sensitive operations
 * @param action Action performed
 * @param details Action details
 * @param userId User ID
 */
export const logSecurityAudit = (action: string, details: any, userId?: string): void => {
  const auditEntry = {
    action,
    details,
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString(),
    deviceInfo: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    }
  };
  
  // Store in local audit log
  try {
    const auditLog = JSON.parse(localStorage.getItem('security-audit-log') || '[]');
    auditLog.unshift(auditEntry);
    
    // Keep log size manageable
    if (auditLog.length > 100) {
      auditLog.splice(100);
    }
    
    localStorage.setItem('security-audit-log', JSON.stringify(auditLog));
  } catch (error) {
    logger.error('Failed to log security audit', error);
  }
  
  // In production, would also send to server when online
  logger.info('Security Audit', auditEntry);
};