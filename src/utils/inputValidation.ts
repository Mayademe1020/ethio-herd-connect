// Comprehensive input validation utilities for security

export const validateAndSanitizeText = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  
  // Remove HTML tags and potentially harmful characters
  const sanitized = input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>\"'&]/g, '') // Remove potentially harmful characters
    .trim();
  
  return sanitized.substring(0, maxLength);
};

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
};

export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { isValid: false, error: 'Phone number must be between 10 and 15 digits' };
  }
  
  return { isValid: true };
};

export const validateNumericInput = (
  value: string, 
  min: number, 
  max: number, 
  fieldName: string
): { isValid: boolean; error?: string; value?: number } => {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (numValue < min || numValue > max) {
    return { isValid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }
  
  return { isValid: true, value: numValue };
};

export const validateDate = (
  date: string, 
  type: 'past' | 'future' | 'any' = 'any'
): { isValid: boolean; error?: string } => {
  if (!date) {
    return { isValid: false, error: 'Date is required' };
  }
  
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }
  
  switch (type) {
    case 'past':
      if (dateObj > today) {
        return { isValid: false, error: 'Date cannot be in the future' };
      }
      break;
    case 'future':
      if (dateObj < today) {
        return { isValid: false, error: 'Date cannot be in the past' };
      }
      break;
  }
  
  return { isValid: true };
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove path traversal attempts and dangerous characters
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '_') // Replace multiple dots
    .substring(0, 255); // Limit length
};

export const validateFileType = (
  fileName: string, 
  allowedTypes: string[]
): { isValid: boolean; error?: string } => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    return { isValid: false, error: 'File must have an extension' };
  }
  
  if (!allowedTypes.includes(extension)) {
    return { isValid: false, error: `File type .${extension} is not allowed` };
  }
  
  return { isValid: true };
};

export const validateFileSize = (
  size: number, 
  maxSizeMB: number
): { isValid: boolean; error?: string } => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (size > maxSizeBytes) {
    return { isValid: false, error: `File size cannot exceed ${maxSizeMB}MB` };
  }
  
  return { isValid: true };
};

export const validateInput = (input: string, fieldName: string): boolean => {
  if (!input || input.trim().length === 0) {
    return false;
  }
  
  if (input.length > 100) {
    return false;
  }
  
  return true;
};

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>\"'&]/g, '') // Remove potentially harmful characters
    .trim()
    .substring(0, 1000); // Limit length
};
