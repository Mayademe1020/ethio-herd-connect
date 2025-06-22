
// Animal ID Generation and Validation Utilities

export interface AnimalIdComponents {
  type: string;
  sequence: string;
  date: string;
  farmPrefix?: string;
}

// Type codes for different animal types
export const ANIMAL_TYPE_CODES = {
  cattle: 'COW',
  poultry: 'POU', 
  goat: 'GOT',
  sheep: 'SHP'
} as const;

// Generate Animal ID in format: FARM-COW-001-241222
export const generateAnimalId = (animalType: string, farmPrefix: string = 'FARM'): string => {
  const typeCode = ANIMAL_TYPE_CODES[animalType as keyof typeof ANIMAL_TYPE_CODES] || 'ANM';
  const sequence = Math.floor(Math.random() * 999) + 1;
  const sequenceStr = sequence.toString().padStart(3, '0');
  
  // Generate date suffix in YYMMDD format
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  return `${farmPrefix}-${typeCode}-${sequenceStr}-${dateStr}`;
};

// Parse Animal ID into components
export const parseAnimalId = (animalId: string): AnimalIdComponents | null => {
  const parts = animalId.split('-');
  if (parts.length !== 4) return null;
  
  return {
    farmPrefix: parts[0],
    type: parts[1],
    sequence: parts[2],
    date: parts[3]
  };
};

// Validate Animal ID format
export const validateAnimalId = (animalId: string): boolean => {
  const regex = /^[A-Z0-9]+-[A-Z]{3}-\d{3}-\d{6}$/;
  return regex.test(animalId);
};

// Get animal type from type code
export const getAnimalTypeFromCode = (typeCode: string): string => {
  const reverseMap = Object.entries(ANIMAL_TYPE_CODES).find(([_, code]) => code === typeCode);
  return reverseMap ? reverseMap[0] : 'unknown';
};

// Generate display-friendly Animal ID
export const formatAnimalIdForDisplay = (animalId: string): string => {
  return animalId.replace(/-/g, ' • ');
};

// Input validation functions
export const validateInput = (value: string, type: 'name' | 'age' | 'weight' | 'price' | 'count'): boolean => {
  if (!value || value.trim() === '') return type !== 'name'; // name is required, others optional
  
  switch (type) {
    case 'name':
      return value.trim().length >= 1 && value.trim().length <= 50;
    case 'age':
      const age = parseInt(value);
      return !isNaN(age) && age >= 0 && age <= 50;
    case 'weight':
      const weight = parseFloat(value);
      return !isNaN(weight) && weight > 0 && weight <= 5000; // reasonable weight limits
    case 'price':
      const price = parseFloat(value);
      return !isNaN(price) && price >= 0 && price <= 1000000; // reasonable price limits
    case 'count':
      const count = parseInt(value);
      return !isNaN(count) && count >= 1 && count <= 10000; // reasonable count limits
    default:
      return true;
  }
};

// Input sanitization function
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove HTML tags and potentially harmful characters
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>\"'&]/g, '') // Remove potentially harmful characters
    .trim()
    .substring(0, 1000); // Limit length
};

// Date validation
export const validateDate = (date: Date | null, type: 'birth' | 'future' | 'past'): boolean => {
  if (!date) return false;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  switch (type) {
    case 'birth':
      return inputDate <= today; // Birth date cannot be in future
    case 'future':
      return inputDate >= today; // Must be today or future
    case 'past':
      return inputDate <= today; // Must be today or past
    default:
      return true;
  }
};

// Numeric validation with range
export const validateNumericRange = (value: string, min: number, max: number): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Phone number validation (basic)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Email validation (basic)
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
