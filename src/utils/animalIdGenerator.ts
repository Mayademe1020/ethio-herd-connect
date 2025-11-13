
// Animal ID Generation and Validation Utilities
// Professional livestock management system with farm-specific prefixes

import { supabase } from '@/integrations/supabase/client';

export interface AnimalIdComponents {
  farmPrefix: string;
  type: string;
  sequence: string;
}

// Type codes for different animal types - Professional livestock standards
export const ANIMAL_TYPE_CODES = {
  cattle: 'CAT',  // Generic cattle (includes cow, bull, ox, calf)
  cow: 'COW',
  bull: 'BUL',
  ox: 'OX',
  calf: 'CAL',
  goat: 'GOA',
  sheep: 'SHP',
  ewe: 'EWE',
  ram: 'RAM',
  poultry: 'POU',
  chicken: 'CHK',
  duck: 'DUC'
} as const;

// Generate farm prefix from farm profile or create from farm name
export const getFarmPrefix = async (userId: string): Promise<string> => {
  try {
    // First, check if farm profile exists with a custom prefix
    const { data: profile } = await supabase
      .from('farm_profiles')
      .select('farm_prefix, farm_name')
      .eq('user_id', userId)
      .single();

    if (profile?.farm_prefix) {
      return profile.farm_prefix.toUpperCase();
    }

    // If no prefix but farm name exists, generate from name
    if (profile?.farm_name) {
      return generatePrefixFromName(profile.farm_name);
    }

    // Fallback: generate from user info
    return await generateFallbackPrefix(userId);
  } catch (error) {
    console.error('Error getting farm prefix:', error);
    return 'FARM'; // Ultimate fallback
  }
};

// Generate prefix from farm name (3-6 characters)
export const generatePrefixFromName = (farmName: string): string => {
  // Clean and process farm name
  const cleanName = farmName
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .trim()
    .toUpperCase();

  // Take first 3-6 characters, preferring word starts
  const words = cleanName.split(/\s+/);
  let prefix = '';

  for (const word of words) {
    if (prefix.length + word.length <= 6) {
      prefix += word;
    } else {
      break;
    }
  }

  // Ensure minimum 3 characters
  if (prefix.length < 3) {
    prefix = cleanName.substring(0, 6).padEnd(3, 'X');
  }

  return prefix.substring(0, 6);
};

// Generate fallback prefix from user phone or ID
export const generateFallbackPrefix = async (userId: string): Promise<string> => {
  try {
    // Try to get user phone number
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.phone) {
      // Use last 4 digits of phone
      const phoneDigits = user.phone.replace(/\D/g, '');
      return `F${phoneDigits.slice(-4)}`;
    }

    // Fallback to user ID hash
    const hash = userId.slice(-4).toUpperCase();
    return `F${hash}`;
  } catch (error) {
    return 'FARM';
  }
};

// Get next sequential number for farm + animal type combination
export const getNextAnimalNumber = async (
  farmPrefix: string,
  animalType: string
): Promise<number> => {
  try {
    const typeCode = ANIMAL_TYPE_CODES[animalType as keyof typeof ANIMAL_TYPE_CODES] || 'ANM';

    // Find highest existing number for this farm + type combination
    const { data: existingAnimals } = await supabase
      .from('animals')
      .select('animal_id')
      .like('animal_id', `${farmPrefix}-${typeCode}-%`)
      .order('animal_id', { ascending: false })
      .limit(1);

    if (existingAnimals?.[0]?.animal_id) {
      // Extract number from ID like "ABEBE-COW-005"
      const parts = existingAnimals[0].animal_id.split('-');
      if (parts.length >= 3) {
        const numberPart = parts[2];
        const currentNumber = parseInt(numberPart, 10);
        if (!isNaN(currentNumber)) {
          return currentNumber + 1;
        }
      }
    }

    return 1; // First animal of this type for this farm
  } catch (error) {
    console.error('Error getting next animal number:', error);
    return 1;
  }
};

// Generate professional Animal ID: FARM-TYPE-###
export const generateAnimalId = async (
  userId: string,
  animalType: string
): Promise<string> => {
  const farmPrefix = await getFarmPrefix(userId);
  const nextNumber = await getNextAnimalNumber(farmPrefix, animalType);
  const typeCode = ANIMAL_TYPE_CODES[animalType as keyof typeof ANIMAL_TYPE_CODES] || 'ANM';

  const animalId = `${farmPrefix}-${typeCode}-${nextNumber.toString().padStart(3, '0')}`;

  // Validate uniqueness (extra safety check)
  const isUnique = await validateAnimalIdUniqueness(animalId);
  if (!isUnique) {
    throw new Error(`Animal ID ${animalId} already exists`);
  }

  return animalId;
};

// Validate animal ID uniqueness
export const validateAnimalIdUniqueness = async (animalId: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('animals')
      .select('id')
      .eq('animal_id', animalId)
      .single();

    return !data; // Return true if no existing record found
  } catch (error) {
    // If error (including no rows found), ID is available
    return true;
  }
};

// Parse Animal ID into components
export const parseAnimalId = (animalId: string): AnimalIdComponents | null => {
  const parts = animalId.split('-');
  if (parts.length !== 3) return null;

  return {
    farmPrefix: parts[0],
    type: parts[1],
    sequence: parts[2]
  };
};

// Validate Animal ID format (FARM-TYPE-###)
export const validateAnimalId = (animalId: string): boolean => {
  const regex = /^[A-Z0-9]{3,8}-[A-Z]{2,3}-\d{3}$/;
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

// Animal status types for professional livestock management
export enum AnimalStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  DECEASED = 'deceased',
  CULLED = 'culled',
  LOST = 'lost',
  TRANSFERRED = 'transferred',
  QUARANTINE = 'quarantine'
}

// Status change interface for audit trail
export interface StatusChangeData {
  animal_id: string;
  old_status: AnimalStatus;
  new_status: AnimalStatus;
  reason?: string;
  details?: {
    sale_price?: number;
    buyer_info?: string;
    cause_of_death?: string;
    transfer_destination?: string;
    cull_reason?: string;
  };
  changed_by: string;
}

// Change animal status (soft delete alternative)
export const changeAnimalStatus = async (
  animalId: string,
  newStatus: AnimalStatus,
  changeData: Omit<StatusChangeData, 'animal_id' | 'old_status'>
): Promise<void> => {
  try {
    // Get current status
    const { data: currentAnimal } = await supabase
      .from('animals')
      .select('status')
      .eq('animal_id', animalId)
      .single();

    if (!currentAnimal) {
      throw new Error('Animal not found');
    }

    const oldStatus = currentAnimal.status as AnimalStatus;

    // Record status change in history
    await supabase.from('animal_status_history').insert({
      animal_id: animalId,
      old_status: oldStatus,
      new_status: newStatus,
      reason: changeData.reason,
      details: changeData.details,
      changed_by: changeData.changed_by
    });

    // Update animal status
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    // Add status-specific fields
    if (newStatus === AnimalStatus.SOLD) {
      updateData.sold_date = new Date().toISOString();
    } else if (newStatus === AnimalStatus.DECEASED) {
      updateData.deceased_date = new Date().toISOString();
    }

    await supabase
      .from('animals')
      .update(updateData)
      .eq('animal_id', animalId);

  } catch (error) {
    console.error('Error changing animal status:', error);
    throw error;
  }
};
