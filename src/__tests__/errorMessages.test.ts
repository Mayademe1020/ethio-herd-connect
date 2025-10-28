import { describe, it, expect } from 'vitest';
import {
  mapTechnicalError,
  getUserFriendlyError,
  getSuccessMessage,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../lib/errorMessages';

describe('Error Message System', () => {
  describe('mapTechnicalError', () => {
    it('should map network errors correctly', () => {
      const error = { message: 'network error' };
      expect(mapTechnicalError(error)).toBe('network');
    });

    it('should map JWT/auth errors correctly', () => {
      const error = { message: 'JWT expired' };
      expect(mapTechnicalError(error)).toBe('auth_expired');
    });

    it('should map OTP errors correctly', () => {
      const error = { message: 'Invalid login credentials' };
      expect(mapTechnicalError(error)).toBe('auth_invalid_otp');
    });

    it('should map permission errors correctly', () => {
      const error = { code: 'PGRST301' };
      expect(mapTechnicalError(error)).toBe('permission_denied');
    });

    it('should map not found errors correctly', () => {
      const error = { status: 404 };
      expect(mapTechnicalError(error)).toBe('not_found');
    });

    it('should map database errors correctly', () => {
      const error = { code: 'PGRST116' };
      expect(mapTechnicalError(error)).toBe('not_found');
    });

    it('should map validation errors correctly', () => {
      const error = { message: 'required field missing' };
      expect(mapTechnicalError(error)).toBe('validation_required');
    });

    it('should default to unknown for unrecognized errors', () => {
      const error = { message: 'some random error' };
      expect(mapTechnicalError(error)).toBe('unknown');
    });
  });

  describe('getUserFriendlyError', () => {
    it('should return Amharic message by default', () => {
      const error = { message: 'network error' };
      const result = getUserFriendlyError(error);
      
      expect(result.message).toBe('ኢንተርኔት የለም። መረጃው በስልክዎ ተቀምጧል።');
      expect(result.icon).toBe('📱');
      expect(result.type).toBe('network');
    });

    it('should return English message when specified', () => {
      const error = { message: 'network error' };
      const result = getUserFriendlyError(error, 'english');
      
      expect(result.message).toBe('No internet. Your data is saved on your phone.');
      expect(result.icon).toBe('📱');
      expect(result.type).toBe('network');
    });

    it('should handle auth expired errors', () => {
      const error = { message: 'JWT expired' };
      const result = getUserFriendlyError(error, 'amharic');
      
      expect(result.message).toBe('ክፍለ ጊዜዎ አልቋል። እባክዎ እንደገና ይግቡ።');
      expect(result.icon).toBe('🔐');
      expect(result.type).toBe('auth_expired');
    });

    it('should handle invalid OTP errors', () => {
      const error = { message: 'Invalid login credentials' };
      const result = getUserFriendlyError(error, 'amharic');
      
      expect(result.message).toBe('የተሳሳተ ኮድ። እባክዎ እንደገና ይሞክሩ።');
      expect(result.icon).toBe('❌');
      expect(result.type).toBe('auth_invalid_otp');
    });
  });

  describe('getSuccessMessage', () => {
    it('should return Amharic success message by default', () => {
      const result = getSuccessMessage('animal_registered');
      
      expect(result.message).toBe('እንስሳው በተሳካ ሁኔታ ተመዝግቧል!');
      expect(result.icon).toBe('✅');
    });

    it('should return English success message when specified', () => {
      const result = getSuccessMessage('animal_registered', 'english');
      
      expect(result.message).toBe('Animal registered successfully!');
      expect(result.icon).toBe('✅');
    });

    it('should handle milk recorded success', () => {
      const result = getSuccessMessage('milk_recorded', 'amharic');
      
      expect(result.message).toBe('ወተት በተሳካ ሁኔታ ተመዝግቧል!');
      expect(result.icon).toBe('🥛');
    });

    it('should handle listing created success', () => {
      const result = getSuccessMessage('listing_created', 'amharic');
      
      expect(result.message).toBe('ማስታወቂያው በተሳካ ሁኔታ ተፈጥሯል!');
      expect(result.icon).toBe('🛒');
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have all required error types', () => {
      const requiredTypes = [
        'network',
        'auth_expired',
        'auth_invalid_otp',
        'auth_phone_invalid',
        'photo_too_large',
        'photo_upload_failed',
        'video_too_large',
        'video_too_long',
        'video_upload_failed',
        'validation_required',
        'validation_invalid',
        'database_error',
        'sync_failed',
        'permission_denied',
        'not_found',
        'unknown',
      ];

      requiredTypes.forEach((type) => {
        expect(ERROR_MESSAGES).toHaveProperty(type);
      });
    });

    it('should have Amharic and English for all error types', () => {
      Object.values(ERROR_MESSAGES).forEach((message) => {
        expect(message).toHaveProperty('amharic');
        expect(message).toHaveProperty('english');
        expect(message).toHaveProperty('icon');
        expect(typeof message.amharic).toBe('string');
        expect(typeof message.english).toBe('string');
        expect(typeof message.icon).toBe('string');
      });
    });
  });

  describe('SUCCESS_MESSAGES', () => {
    it('should have all required success types', () => {
      const requiredTypes = [
        'animal_registered',
        'milk_recorded',
        'listing_created',
        'interest_sent',
        'animal_deleted',
        'listing_sold',
        'synced',
        'logout',
      ];

      requiredTypes.forEach((type) => {
        expect(SUCCESS_MESSAGES).toHaveProperty(type);
      });
    });

    it('should have Amharic and English for all success types', () => {
      Object.values(SUCCESS_MESSAGES).forEach((message) => {
        expect(message).toHaveProperty('amharic');
        expect(message).toHaveProperty('english');
        expect(message).toHaveProperty('icon');
        expect(typeof message.amharic).toBe('string');
        expect(typeof message.english).toBe('string');
        expect(typeof message.icon).toBe('string');
      });
    });
  });
});
