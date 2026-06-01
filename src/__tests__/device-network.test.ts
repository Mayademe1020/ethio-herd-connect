import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeInput,
  validateAndSanitizeText,
  validateEmail,
  validatePhone,
  validateNumericInput,
  validateDate,
  sanitizeFileName,
  validateFileType,
  validateFileSize,
} from '../utils/inputValidation';
import { withRetry, withTimeout, CircuitBreaker } from '../lib/networkUtils';
import {
  shouldShowNotification,
  getThrottledSummary,
  clearThrottledNotifications,
} from '../utils/notificationThrottle';
import { offlineQueue } from '../lib/offlineQueue';

describe('Input Sanitization', () => {
  it('sanitizeInput strips HTML tags and harmful characters, and trims', () => {
    const dirty = '  <script>alert("xss")</script>Hello <b>World</b> &  ';
    const clean = sanitizeInput(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('</script>');
    expect(clean).not.toContain('<b>');
    expect(clean).not.toContain('&');
    expect(clean).toContain('Hello');
    expect(clean).toContain('World');
    expect(clean.startsWith(' ')).toBe(false);
    expect(clean.endsWith(' ')).toBe(false);
  });

  it('sanitizeInput enforces the 1000 character cap', () => {
    const long = 'a'.repeat(1500);
    expect(sanitizeInput(long)).toHaveLength(1000);
  });

  it('validateAndSanitizeText enforces the maxLength cap', () => {
    const result = validateAndSanitizeText('<p>' + 'a'.repeat(2000) + '</p>', 50);
    expect(result.length).toBe(50);
    expect(result).not.toContain('<p>');
  });
});

describe('Phone Validation', () => {
  it('accepts 10-15 digit phone numbers in local and international format', () => {
    expect(validatePhone('0912345678').isValid).toBe(true);
    expect(validatePhone('+251912345678').isValid).toBe(true);
  });

  it('rejects phone numbers that are too short, too long, or empty', () => {
    const tooShort = validatePhone('12345');
    const tooLong = validatePhone('12345678901234567');
    const empty = validatePhone('');

    expect(tooShort.isValid).toBe(false);
    expect(tooShort.error).toBeDefined();
    expect(tooLong.isValid).toBe(false);
    expect(empty.isValid).toBe(false);
    expect(empty.error).toBe('Phone number is required');
  });
});

describe('Numeric Input Validation', () => {
  it('returns the parsed number when within range', () => {
    const result = validateNumericInput('5.5', 0, 10, 'weight');
    expect(result.isValid).toBe(true);
    expect(result.value).toBe(5.5);
  });

  it('rejects out-of-range, non-numeric, and empty values', () => {
    expect(validateNumericInput('15', 0, 10, 'age').isValid).toBe(false);
    expect(validateNumericInput('abc', 0, 10, 'age').isValid).toBe(false);
    const empty = validateNumericInput('', 0, 10, 'age');
    expect(empty.isValid).toBe(false);
    expect(empty.error).toBe('age is required');
  });
});

describe('Date Validation', () => {
  it('past type accepts past dates and rejects future dates', () => {
    expect(validateDate('2020-01-01', 'past').isValid).toBe(true);
    expect(validateDate('2099-01-01', 'past').isValid).toBe(false);
  });

  it('future type accepts future dates and rejects past dates', () => {
    expect(validateDate('2099-01-01', 'future').isValid).toBe(true);
    expect(validateDate('2020-01-01', 'future').isValid).toBe(false);
  });

  it('rejects empty strings and invalid date strings', () => {
    expect(validateDate('', 'any').isValid).toBe(false);
    expect(validateDate('not-a-date', 'any').isValid).toBe(false);
    expect(validateDate('2020-01-01', 'any').isValid).toBe(true);
  });
});

describe('Email Validation', () => {
  it('accepts well-formed email addresses', () => {
    expect(validateEmail('user@example.com').isValid).toBe(true);
    expect(validateEmail('farmer.chaltu@ethio-farm.et').isValid).toBe(true);
  });

  it('rejects malformed email addresses and empty input', () => {
    expect(validateEmail('not-an-email').isValid).toBe(false);
    expect(validateEmail('missing@tld').isValid).toBe(false);
    expect(validateEmail('@example.com').isValid).toBe(false);
    expect(validateEmail('').isValid).toBe(false);
  });
});

describe('File Validation', () => {
  it('sanitizeFileName blocks path traversal and dangerous characters', () => {
    const safe = sanitizeFileName('../etc/passwd');
    expect(safe).not.toContain('..');
    expect(safe).not.toContain('/');
  });

  it('validateFileType accepts allowed and rejects disallowed extensions', () => {
    expect(validateFileType('photo.jpg', ['jpg', 'png']).isValid).toBe(true);
    expect(validateFileType('script.exe', ['jpg', 'png']).isValid).toBe(false);
    expect(validateFileType('noext', ['jpg', 'png']).isValid).toBe(false);
  });

  it('validateFileSize rejects files exceeding the limit', () => {
    expect(validateFileSize(5 * 1024 * 1024, 10).isValid).toBe(true);
    expect(validateFileSize(15 * 1024 * 1024, 10).isValid).toBe(false);
  });
});

describe('Network Utilities', () => {
  it('withRetry returns immediately on success without retrying', async () => {
    let attempts = 0;
    const result = await withRetry(
      async () => {
        attempts++;
        return 'ok';
      },
      { maxRetries: 3, retryDelay: 1 }
    );
    expect(result).toBe('ok');
    expect(attempts).toBe(1);
  });

  it('withRetry retries retryable errors up to maxRetries then throws', async () => {
    let attempts = 0;
    await expect(
      withRetry(
        async () => {
          attempts++;
          throw new Error('network failure');
        },
        { maxRetries: 2, retryDelay: 1 }
      )
    ).rejects.toThrow('network failure');
    expect(attempts).toBe(3);
  });

  it('withRetry does not retry non-retryable errors', async () => {
    let attempts = 0;
    await expect(
      withRetry(
        async () => {
          attempts++;
          throw new Error('permission denied');
        },
        { maxRetries: 3, retryDelay: 1 }
      )
    ).rejects.toThrow('permission denied');
    expect(attempts).toBe(1);
  });

  it('withTimeout rejects when the operation exceeds the timeout', async () => {
    await expect(
      withTimeout(() => new Promise(resolve => setTimeout(resolve, 200)), 30)
    ).rejects.toThrow(/timed out/);
  });

  it('CircuitBreaker opens after threshold failures and rejects immediately', async () => {
    const breaker = new CircuitBreaker(2, 1000);
    const failing = async () => {
      throw new Error('network error');
    };

    await expect(breaker.execute(failing)).rejects.toThrow('network error');
    await expect(breaker.execute(failing)).rejects.toThrow('network error');
    expect(breaker.getState()).toBe('open');

    await expect(breaker.execute(failing)).rejects.toThrow(/Circuit breaker is open/);
  });
});

describe('Notification Throttle', () => {
  beforeEach(() => {
    clearThrottledNotifications();
  });

  it('throttles repeated notifications with the same key', () => {
    expect(shouldShowNotification('error', 'save-failed')).toBe(true);
    expect(shouldShowNotification('error', 'save-failed')).toBe(false);
    expect(shouldShowNotification('error', 'save-failed')).toBe(false);
  });

  it('allows notifications with different keys through', () => {
    expect(shouldShowNotification('error', 'key-a')).toBe(true);
    expect(shouldShowNotification('error', 'key-b')).toBe(true);
  });

  it('getThrottledSummary aggregates suppressed counts by type', () => {
    shouldShowNotification('error', 'a');
    shouldShowNotification('error', 'a');
    shouldShowNotification('warning', 'b');
    shouldShowNotification('warning', 'b');

    const summary = getThrottledSummary();
    expect(summary.error).toBe(2);
    expect(summary.warning).toBe(2);
  });
});

describe('Offline Queue', () => {
  beforeEach(() => {
    offlineQueue.clear();
  });

  it('add stores items in pending state in the in-memory store', () => {
    const item = offlineQueue.add({ action_type: 'milk_record', payload: { amount: 5 } });
    expect(item.status).toBe('pending');
    expect(item.retry_count).toBe(0);
    expect(offlineQueue.getAll()).toHaveLength(1);
  });

  it('getRetryDelay returns the exponential backoff schedule', () => {
    expect(offlineQueue.getRetryDelay(0)).toBe(1000);
    expect(offlineQueue.getRetryDelay(1)).toBe(2000);
    expect(offlineQueue.getRetryDelay(2)).toBe(4000);
    expect(offlineQueue.getRetryDelay(4)).toBe(16000);
  });

  it('getSyncStatus reports pending count and idle state', () => {
    offlineQueue.add({ action_type: 'milk_record', payload: { amount: 3 } });
    offlineQueue.add({ action_type: 'animal_registration', payload: { name: 'Chaltu' } });

    const status = offlineQueue.getSyncStatus();
    expect(status.pendingCount).toBe(2);
    expect(status.isSyncing).toBe(false);
  });
});
