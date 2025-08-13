
import { useCallback } from 'react';

interface SanitizationOptions {
  maxLength?: number;
  allowHTML?: boolean;
  allowSpecialChars?: boolean;
}

export const useInputSanitization = () => {
  const sanitizeText = useCallback((
    input: string, 
    options: SanitizationOptions = {}
  ): string => {
    if (!input || typeof input !== 'string') return '';

    let sanitized = input.trim();

    // Remove HTML tags unless explicitly allowed
    if (!options.allowHTML) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Remove special characters unless explicitly allowed
    if (!options.allowSpecialChars) {
      sanitized = sanitized.replace(/[<>'"&]/g, '');
    }

    // Apply length limit
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized;
  }, []);

  const sanitizeEmail = useCallback((email: string): string => {
    if (!email) return '';
    return email.toLowerCase().trim().replace(/[^\w@.-]/g, '');
  }, []);

  const sanitizeNumeric = useCallback((input: string | number): number => {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    return isNaN(num) ? 0 : Math.max(0, num);
  }, []);

  const validateAndSanitizeForm = useCallback((
    formData: Record<string, any>,
    rules: Record<string, SanitizationOptions>
  ): Record<string, any> => {
    const sanitized: Record<string, any> = {};

    Object.keys(formData).forEach(key => {
      const value = formData[key];
      const rule = rules[key] || {};

      if (typeof value === 'string') {
        sanitized[key] = sanitizeText(value, rule);
      } else if (typeof value === 'number') {
        sanitized[key] = sanitizeNumeric(value);
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }, [sanitizeText, sanitizeNumeric]);

  return {
    sanitizeText,
    sanitizeEmail,
    sanitizeNumeric,
    validateAndSanitizeForm
  };
};
