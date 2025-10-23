/**
 * Validation schemas for Ethio Herd Connect
 * Provides consistent validation rules for all input types
 * Optimized for Ethiopian livestock farming context
 */

import * as z from 'zod';

// Common validation patterns
const PHONE_REGEX = /^(\+251|0)[97]\d{8}$/; // Ethiopian phone numbers
const ANIMAL_ID_REGEX = /^[A-Z0-9]{2,10}$/; // Animal ID format
const ETHIOPIAN_DATE_REGEX = /^\d{1,2}\/\d{1,2}\/\d{4}$/; // DD/MM/YYYY

// Common validation messages
export const ValidationMessages = {
  required: 'This field is required',
  tooShort: (min: number) => `Must be at least ${min} characters`,
  tooLong: (max: number) => `Must be at most ${max} characters`,
  invalidFormat: 'Invalid format',
  invalidPhone: 'Invalid Ethiopian phone number',
  invalidEmail: 'Invalid email address',
  invalidNumber: 'Must be a valid number',
  invalidDate: 'Invalid date format',
  invalidAnimalId: 'Invalid animal ID format',
  invalidWeight: 'Weight must be a positive number',
  invalidPrice: 'Price must be a positive number',
  invalidAge: 'Age must be a positive number',
};

// Animal registration schema
export const animalSchema = z.object({
  name: z.string()
    .min(2, { message: ValidationMessages.tooShort(2) })
    .max(50, { message: ValidationMessages.tooLong(50) }),
  
  animal_id: z.string()
    .regex(ANIMAL_ID_REGEX, { message: ValidationMessages.invalidAnimalId })
    .optional(),
  
  species: z.string()
    .min(2, { message: ValidationMessages.tooShort(2) })
    .max(30, { message: ValidationMessages.tooLong(30) }),
  
  breed: z.string()
    .min(2, { message: ValidationMessages.tooShort(2) })
    .max(30, { message: ValidationMessages.tooLong(30) })
    .optional(),
  
  age: z.union([
    z.number().positive({ message: ValidationMessages.invalidAge }),
    z.string().transform((val, ctx) => {
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ValidationMessages.invalidAge,
        });
        return z.NEVER;
      }
      return parsed;
    })
  ]).optional(),
  
  gender: z.enum(['male', 'female']),
  
  weight: z.union([
    z.number().positive({ message: ValidationMessages.invalidWeight }),
    z.string().transform((val, ctx) => {
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ValidationMessages.invalidWeight,
        });
        return z.NEVER;
      }
      return parsed;
    })
  ]).optional(),
  
  acquisition_date: z.string()
    .regex(ETHIOPIAN_DATE_REGEX, { message: ValidationMessages.invalidDate })
    .optional(),
  
  notes: z.string()
    .max(500, { message: ValidationMessages.tooLong(500) })
    .optional(),
    
  photo_url: z.string().url().optional(),
});

// Health record schema
export const healthRecordSchema = z.object({
  animal_id: z.string()
    .regex(ANIMAL_ID_REGEX, { message: ValidationMessages.invalidAnimalId }),
  
  record_type: z.enum(['vaccination', 'illness', 'treatment', 'checkup']),
  
  medicine_name: z.string()
    .min(2, { message: ValidationMessages.tooShort(2) })
    .max(100, { message: ValidationMessages.tooLong(100) })
    .optional(),
  
  administered_date: z.string()
    .regex(ETHIOPIAN_DATE_REGEX, { message: ValidationMessages.invalidDate }),
  
  symptoms: z.string()
    .max(500, { message: ValidationMessages.tooLong(500) })
    .optional(),
  
  diagnosis: z.string()
    .max(500, { message: ValidationMessages.tooLong(500) })
    .optional(),
  
  treatment: z.string()
    .max(500, { message: ValidationMessages.tooLong(500) })
    .optional(),
  
  notes: z.string()
    .max(500, { message: ValidationMessages.tooLong(500) })
    .optional(),
});

// Growth record schema
export const growthRecordSchema = z.object({
  animal_id: z.string()
    .regex(ANIMAL_ID_REGEX, { message: ValidationMessages.invalidAnimalId }),
  
  weight: z.union([
    z.number().positive({ message: ValidationMessages.invalidWeight }),
    z.string().transform((val, ctx) => {
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ValidationMessages.invalidWeight,
        });
        return z.NEVER;
      }
      return parsed;
    })
  ]),
  
  measurement_date: z.string()
    .regex(ETHIOPIAN_DATE_REGEX, { message: ValidationMessages.invalidDate }),
  
  height: z.union([
    z.number().positive(),
    z.string().transform((val, ctx) => {
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Height must be a positive number',
        });
        return z.NEVER;
      }
      return parsed;
    })
  ]).optional(),
  
  notes: z.string()
    .max(500, { message: ValidationMessages.tooLong(500) })
    .optional(),
});

// Market listing schema
export const marketListingSchema = z.object({
  title: z.string()
    .min(5, { message: ValidationMessages.tooShort(5) })
    .max(100, { message: ValidationMessages.tooLong(100) }),
  
  description: z.string()
    .min(10, { message: ValidationMessages.tooShort(10) })
    .max(1000, { message: ValidationMessages.tooLong(1000) }),
  
  price: z.union([
    z.number().positive({ message: ValidationMessages.invalidPrice }),
    z.string().transform((val, ctx) => {
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ValidationMessages.invalidPrice,
        });
        return z.NEVER;
      }
      return parsed;
    })
  ]),
  
  location: z.string()
    .min(2, { message: ValidationMessages.tooShort(2) })
    .max(100, { message: ValidationMessages.tooLong(100) }),
  
  category: z.string(),
  
  animal_id: z.string()
    .regex(ANIMAL_ID_REGEX, { message: ValidationMessages.invalidAnimalId })
    .optional(),
  
  contact_phone: z.string()
    .regex(PHONE_REGEX, { message: ValidationMessages.invalidPhone })
    .optional(),
  
  photo_urls: z.array(z.string().url()).optional(),
  
  is_negotiable: z.boolean().optional(),
  
  listing_date: z.string()
    .regex(ETHIOPIAN_DATE_REGEX, { message: ValidationMessages.invalidDate })
    .optional(),
});

// User profile schema
export const userProfileSchema = z.object({
  name: z.string()
    .min(2, { message: ValidationMessages.tooShort(2) })
    .max(50, { message: ValidationMessages.tooLong(50) }),
  
  phone: z.string()
    .regex(PHONE_REGEX, { message: ValidationMessages.invalidPhone }),
  
  email: z.string()
    .email({ message: ValidationMessages.invalidEmail })
    .optional(),
  
  location: z.string()
    .min(2, { message: ValidationMessages.tooShort(2) })
    .max(100, { message: ValidationMessages.tooLong(100) }),
  
  farm_name: z.string()
    .min(2, { message: ValidationMessages.tooShort(2) })
    .max(100, { message: ValidationMessages.tooLong(100) })
    .optional(),
  
  preferred_language: z.enum(['en', 'am', 'or', 'sw']).optional(),
});

// Poultry group schema
export const poultryGroupSchema = z.object({
  group_name: z.string()
    .min(2, { message: ValidationMessages.tooShort(2) })
    .max(50, { message: ValidationMessages.tooLong(50) }),
  
  species: z.string()
    .min(2, { message: ValidationMessages.tooShort(2) })
    .max(30, { message: ValidationMessages.tooLong(30) }),
  
  breed: z.string()
    .min(2, { message: ValidationMessages.tooShort(2) })
    .max(30, { message: ValidationMessages.tooLong(30) })
    .optional(),
  
  count: z.union([
    z.number().int().positive(),
    z.string().transform((val, ctx) => {
      const parsed = parseInt(val);
      if (isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Count must be a positive integer',
        });
        return z.NEVER;
      }
      return parsed;
    })
  ]),
  
  acquisition_date: z.string()
    .regex(ETHIOPIAN_DATE_REGEX, { message: ValidationMessages.invalidDate }),
  
  notes: z.string()
    .max(500, { message: ValidationMessages.tooLong(500) })
    .optional(),
});

// Milk production record schema
export const milkProductionSchema = z.object({
  animal_id: z.string()
    .regex(ANIMAL_ID_REGEX, { message: ValidationMessages.invalidAnimalId }),
  
  date: z.string()
    .regex(ETHIOPIAN_DATE_REGEX, { message: ValidationMessages.invalidDate }),
  
  morning_amount: z.union([
    z.number().nonnegative(),
    z.string().transform((val, ctx) => {
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amount must be a non-negative number',
        });
        return z.NEVER;
      }
      return parsed;
    })
  ]).optional(),
  
  evening_amount: z.union([
    z.number().nonnegative(),
    z.string().transform((val, ctx) => {
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amount must be a non-negative number',
        });
        return z.NEVER;
      }
      return parsed;
    })
  ]).optional(),
  
  notes: z.string()
    .max(500, { message: ValidationMessages.tooLong(500) })
    .optional(),
});