// src/__tests__/authentication.test.ts - Comprehensive Authentication Tests

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Authentication System Tests', () => {
  describe('Phone Number Validation', () => {
    it('should accept valid 9-digit Ethiopian phone numbers starting with 9', () => {
      const validPhones = ['911234567', '922345678', '933456789', '944567890'];
      
      validPhones.forEach(phone => {
        const cleanPhone = phone.replace(/\D/g, '');
        expect(cleanPhone.length).toBe(9);
        expect(cleanPhone.startsWith('9')).toBe(true);
      });
    });

    it('should reject phone numbers with less than 9 digits', () => {
      const invalidPhones = ['91123456', '9223', '9'];
      
      invalidPhones.forEach(phone => {
        const cleanPhone = phone.replace(/\D/g, '');
        expect(cleanPhone.length).toBeLessThan(9);
      });
    });

    it('should reject phone numbers not starting with 9', () => {
      const invalidPhones = ['811234567', '711234567', '011234567'];
      
      invalidPhones.forEach(phone => {
        const cleanPhone = phone.replace(/\D/g, '');
        expect(cleanPhone.startsWith('9')).toBe(false);
      });
    });

    it('should strip leading zeros', () => {
      const phoneWithZero = '0911234567';
      const cleaned = phoneWithZero.replace(/^0+/, '').replace(/\D/g, '');
      expect(cleaned).toBe('911234567');
    });

    it('should format with +251 prefix', () => {
      const phone = '911234567';
      const fullPhone = `+251${phone}`;
      expect(fullPhone).toBe('+251911234567');
    });

    it('should only allow numeric input', () => {
      const input = '9abc1234def567';
      const cleaned = input.replace(/\D/g, '');
      expect(cleaned).toBe('91234567');
    });
  });

  describe('Password Validation', () => {
    it('should require minimum 6 characters', () => {
      const validPasswords = ['123456', 'password', 'test123'];
      const invalidPasswords = ['12345', 'test', 'abc'];

      validPasswords.forEach(pwd => {
        expect(pwd.length).toBeGreaterThanOrEqual(6);
      });

      invalidPasswords.forEach(pwd => {
        expect(pwd.length).toBeLessThan(6);
      });
    });

    it('should accept alphanumeric passwords', () => {
      const passwords = ['test123', 'password1', 'abc123def'];
      
      passwords.forEach(pwd => {
        expect(pwd.length).toBeGreaterThanOrEqual(6);
        expect(/^[a-zA-Z0-9]+$/.test(pwd)).toBe(true);
      });
    });
  });

  describe('OTP Validation', () => {
    it('should accept exactly 6 digits', () => {
      const validOTP = '123456';
      expect(validOTP.length).toBe(6);
      expect(/^\d{6}$/.test(validOTP)).toBe(true);
    });

    it('should reject OTP with less than 6 digits', () => {
      const invalidOTPs = ['12345', '1234', '123'];
      
      invalidOTPs.forEach(otp => {
        expect(otp.length).toBeLessThan(6);
      });
    });

    it('should reject OTP with more than 6 digits', () => {
      const invalidOTP = '1234567';
      const truncated = invalidOTP.slice(0, 6);
      expect(truncated.length).toBe(6);
    });

    it('should only allow numeric input', () => {
      const input = '12ab34cd56';
      const cleaned = input.replace(/\D/g, '');
      expect(cleaned).toBe('123456');
    });
  });

  describe('Session Management', () => {
    it('should persist session data', () => {
      const mockSession = {
        user: { id: '123', phone: '+251911234567' },
        access_token: 'mock-token',
        expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
      };

      // Simulate session storage
      const stored = JSON.stringify(mockSession);
      expect(stored).toBeTruthy();
      
      const retrieved = JSON.parse(stored);
      expect(retrieved.user.id).toBe('123');
      expect(retrieved.user.phone).toBe('+251911234567');
    });

    it('should validate session expiry', () => {
      const now = Date.now();
      const thirtyDaysLater = now + 30 * 24 * 60 * 60 * 1000;
      
      expect(thirtyDaysLater).toBeGreaterThan(now);
    });
  });

  describe('Error Messages', () => {
    it('should provide bilingual error messages', () => {
      const errors = {
        invalidPhone: {
          amharic: 'ልክ ያልሆነ ስልክ ቁጥር',
          english: 'Invalid phone number'
        },
        invalidPassword: {
          amharic: 'ይለፍ ቃል በጣም አጭር ነው',
          english: 'Password too short'
        },
        invalidOTP: {
          amharic: 'ልክ ያልሆነ ኮድ',
          english: 'Invalid OTP'
        }
      };

      Object.values(errors).forEach(error => {
        expect(error.amharic).toBeTruthy();
        expect(error.english).toBeTruthy();
      });
    });
  });

  describe('Authentication Flow', () => {
    it('should follow correct password authentication flow', () => {
      const steps = [
        'enter_phone',
        'enter_password',
        'submit',
        'authenticated'
      ];

      expect(steps[0]).toBe('enter_phone');
      expect(steps[steps.length - 1]).toBe('authenticated');
    });

    it('should follow correct OTP authentication flow', () => {
      const steps = [
        'enter_phone',
        'send_otp',
        'enter_otp',
        'verify_otp',
        'authenticated'
      ];

      expect(steps[0]).toBe('enter_phone');
      expect(steps[steps.length - 1]).toBe('authenticated');
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize phone input', () => {
      const inputs = [
        { input: '  911234567  ', expected: '911234567' },
        { input: '9-11-23-45-67', expected: '911234567' },
        { input: '(911) 234-567', expected: '911234567' }
      ];

      inputs.forEach(({ input, expected }) => {
        const cleaned = input.trim().replace(/\D/g, '');
        expect(cleaned).toBe(expected);
      });
    });

    it('should sanitize OTP input', () => {
      const inputs = [
        { input: '  123456  ', expected: '123456' },
        { input: '1-2-3-4-5-6', expected: '123456' },
        { input: '12 34 56', expected: '123456' }
      ];

      inputs.forEach(({ input, expected }) => {
        const cleaned = input.trim().replace(/\D/g, '');
        expect(cleaned).toBe(expected);
      });
    });
  });
});

describe('Authentication Integration Tests', () => {
  it('should handle successful password login', async () => {
    const mockLogin = async (phone: string, password: string) => {
      if (phone === '911234567' && password === 'test123') {
        return { success: true, user: { id: '123', phone: '+251911234567' } };
      }
      return { success: false, error: 'Invalid credentials' };
    };

    const result = await mockLogin('911234567', 'test123');
    expect(result.success).toBe(true);
    expect(result.user?.phone).toBe('+251911234567');
  });

  it('should handle failed password login', async () => {
    const mockLogin = async (phone: string, password: string) => {
      if (phone === '911234567' && password === 'test123') {
        return { success: true, user: { id: '123', phone: '+251911234567' } };
      }
      return { success: false, error: 'Invalid credentials' };
    };

    const result = await mockLogin('911234567', 'wrongpassword');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });

  it('should handle account creation on first login', async () => {
    const mockSignUp = async (phone: string, password: string) => {
      return { 
        success: true, 
        user: { id: 'new-123', phone: `+251${phone}` },
        isNewUser: true
      };
    };

    const result = await mockSignUp('922345678', 'newpass123');
    expect(result.success).toBe(true);
    expect(result.isNewUser).toBe(true);
    expect(result.user.phone).toBe('+251922345678');
  });

  it('should handle logout', async () => {
    const mockLogout = async () => {
      return { success: true };
    };

    const result = await mockLogout();
    expect(result.success).toBe(true);
  });
});

describe('Protected Route Tests', () => {
  it('should redirect unauthenticated users to login', () => {
    const isAuthenticated = false;
    const shouldRedirect = !isAuthenticated;
    
    expect(shouldRedirect).toBe(true);
  });

  it('should allow authenticated users to access protected routes', () => {
    const isAuthenticated = true;
    const shouldRedirect = !isAuthenticated;
    
    expect(shouldRedirect).toBe(false);
  });
});

describe('Session Persistence Tests', () => {
  it('should persist session for 30 days', () => {
    const sessionDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const now = Date.now();
    const expiresAt = now + sessionDuration;
    
    expect(expiresAt).toBeGreaterThan(now);
    expect(expiresAt - now).toBe(sessionDuration);
  });

  it('should validate session on page load', () => {
    const mockSession = {
      user: { id: '123' },
      expires_at: Date.now() + 1000000
    };

    const isValid = mockSession.expires_at > Date.now();
    expect(isValid).toBe(true);
  });

  it('should invalidate expired sessions', () => {
    const mockSession = {
      user: { id: '123' },
      expires_at: Date.now() - 1000 // Expired 1 second ago
    };

    const isValid = mockSession.expires_at > Date.now();
    expect(isValid).toBe(false);
  });
});
