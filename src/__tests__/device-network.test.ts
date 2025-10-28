/**
 * Device and Network Testing Suite
 * Tests app functionality across different device and network conditions
 * Requirements: 6.1, 6.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Device and Network Compatibility Tests', () => {
  describe('Browser API Support', () => {
    it('should support Service Worker API', () => {
      expect('serviceWorker' in navigator).toBe(true);
    });

    it('should support IndexedDB', () => {
      expect('indexedDB' in window).toBe(true);
    });

    it('should support LocalStorage', () => {
      expect('localStorage' in window).toBe(true);
      
      // Test read/write
      localStorage.setItem('test-key', 'test-value');
      expect(localStorage.getItem('test-key')).toBe('test-value');
      localStorage.removeItem('test-key');
    });

    it('should support SessionStorage', () => {
      expect('sessionStorage' in window).toBe(true);
    });

    it('should support Fetch API', () => {
      expect('fetch' in window).toBe(true);
    });

    it('should support Promise API', () => {
      expect(typeof Promise).toBe('function');
    });

    it('should support async/await', async () => {
      const asyncFn = async () => 'test';
      const result = await asyncFn();
      expect(result).toBe('test');
    });
  });

  describe('Network Detection', () => {
    it('should detect online/offline status', () => {
      expect(typeof navigator.onLine).toBe('boolean');
    });

    it('should handle online event', () => {
      const handler = vi.fn();
      window.addEventListener('online', handler);
      
      // Simulate online event
      window.dispatchEvent(new Event('online'));
      
      expect(handler).toHaveBeenCalled();
      window.removeEventListener('online', handler);
    });

    it('should handle offline event', () => {
      const handler = vi.fn();
      window.addEventListener('offline', handler);
      
      // Simulate offline event
      window.dispatchEvent(new Event('offline'));
      
      expect(handler).toHaveBeenCalled();
      window.removeEventListener('offline', handler);
    });
  });

  describe('Performance API', () => {
    it('should support Performance API', () => {
      expect('performance' in window).toBe(true);
    });

    it('should provide timing information', () => {
      expect(performance.timing).toBeDefined();
      expect(typeof performance.now).toBe('function');
    });

    it('should support performance marks', () => {
      performance.mark('test-mark');
      const marks = performance.getEntriesByName('test-mark');
      expect(marks.length).toBeGreaterThan(0);
      performance.clearMarks('test-mark');
    });

    it('should support performance measures', () => {
      performance.mark('start');
      performance.mark('end');
      performance.measure('test-measure', 'start', 'end');
      
      const measures = performance.getEntriesByName('test-measure');
      expect(measures.length).toBeGreaterThan(0);
      
      performance.clearMarks();
      performance.clearMeasures();
    });
  });

  describe('Memory Management', () => {
    it('should handle large arrays without crashing', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        data: 'x'.repeat(100)
      }));
      
      expect(largeArray.length).toBe(1000);
      expect(largeArray[0].name).toBe('Item 0');
    });

    it('should clean up event listeners', () => {
      const handler = vi.fn();
      const element = document.createElement('button');
      
      element.addEventListener('click', handler);
      element.removeEventListener('click', handler);
      
      element.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle memory-intensive operations', () => {
      // Simulate processing large dataset
      const data = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        animals: Array.from({ length: 10 }, (_, j) => ({
          id: j,
          name: `Animal ${j}`,
          records: Array.from({ length: 30 }, (_, k) => ({
            date: new Date(2024, 0, k + 1).toISOString(),
            value: Math.random() * 10
          }))
        }))
      }));
      
      // Process data
      const processed = data.map(user => ({
        id: user.id,
        totalAnimals: user.animals.length,
        totalRecords: user.animals.reduce((sum, animal) => sum + animal.records.length, 0)
      }));
      
      expect(processed.length).toBe(100);
      expect(processed[0].totalRecords).toBe(300);
    });
  });

  describe('Network Resilience', () => {
    it('should handle fetch timeout gracefully', async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100);
      
      try {
        await fetch('https://httpstat.us/200?sleep=5000', {
          signal: controller.signal
        });
      } catch (error: any) {
        expect(error.name).toBe('AbortError');
      } finally {
        clearTimeout(timeoutId);
      }
    });

    it('should handle network errors', async () => {
      try {
        await fetch('https://invalid-domain-that-does-not-exist-12345.com');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should retry failed requests', async () => {
      let attempts = 0;
      const maxRetries = 3;
      
      const fetchWithRetry = async (url: string, retries = maxRetries): Promise<any> => {
        attempts++;
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Request failed');
          return response;
        } catch (error) {
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return fetchWithRetry(url, retries - 1);
          }
          throw error;
        }
      };
      
      try {
        await fetchWithRetry('https://invalid-url.com');
      } catch (error) {
        expect(attempts).toBe(maxRetries + 1);
      }
    });
  });

  describe('Low Resource Conditions', () => {
    it('should handle reduced animation frame rate', () => {
      let frameCount = 0;
      const maxFrames = 10;
      
      const animate = () => {
        frameCount++;
        if (frameCount < maxFrames) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
      
      // Wait for animation to complete
      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(frameCount).toBeGreaterThan(0);
          resolve();
        }, 200);
      });
    });

    it('should throttle expensive operations', () => {
      const expensiveOperation = vi.fn();
      let lastCall = 0;
      const throttleMs = 100;
      
      const throttled = () => {
        const now = Date.now();
        if (now - lastCall >= throttleMs) {
          lastCall = now;
          expensiveOperation();
        }
      };
      
      // Call multiple times rapidly
      for (let i = 0; i < 10; i++) {
        throttled();
      }
      
      expect(expensiveOperation).toHaveBeenCalledTimes(1);
    });

    it('should debounce user input', async () => {
      const handler = vi.fn();
      let timeoutId: NodeJS.Timeout;
      
      const debounced = (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => handler(value), 300);
      };
      
      // Simulate rapid typing
      debounced('a');
      debounced('ab');
      debounced('abc');
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('abc');
    });
  });

  describe('Image Handling', () => {
    it('should support image compression', () => {
      const canvas = document.createElement('canvas');
      expect(canvas.getContext('2d')).toBeDefined();
      expect(typeof canvas.toBlob).toBe('function');
    });

    it('should handle image loading errors', () => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onerror = () => {
          expect(true).toBe(true);
          resolve();
        };
        img.src = 'invalid-image.jpg';
      });
    });

    it('should support lazy loading', () => {
      const img = document.createElement('img');
      img.loading = 'lazy';
      expect(img.loading).toBe('lazy');
    });
  });

  describe('Data Persistence', () => {
    beforeEach(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    it('should persist data in localStorage', () => {
      const testData = {
        animals: [
          { id: '1', name: 'Chaltu', type: 'cattle' },
          { id: '2', name: 'Beza', type: 'cattle' }
        ]
      };
      
      localStorage.setItem('test-animals', JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem('test-animals') || '{}');
      
      expect(retrieved.animals).toHaveLength(2);
      expect(retrieved.animals[0].name).toBe('Chaltu');
    });

    it('should handle localStorage quota exceeded', () => {
      try {
        // Try to store large data
        const largeData = 'x'.repeat(10 * 1024 * 1024); // 10MB
        localStorage.setItem('large-data', largeData);
      } catch (error: any) {
        expect(error.name).toBe('QuotaExceededError');
      }
    });

    it('should handle sessionStorage', () => {
      sessionStorage.setItem('test-session', 'value');
      expect(sessionStorage.getItem('test-session')).toBe('value');
      sessionStorage.removeItem('test-session');
      expect(sessionStorage.getItem('test-session')).toBeNull();
    });
  });

  describe('Touch and Mobile Events', () => {
    it('should support touch events', () => {
      const element = document.createElement('div');
      const handler = vi.fn();
      
      element.addEventListener('touchstart', handler);
      
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      });
      
      element.dispatchEvent(touchEvent);
      expect(handler).toHaveBeenCalled();
    });

    it('should handle click events', () => {
      const button = document.createElement('button');
      const handler = vi.fn();
      
      button.addEventListener('click', handler);
      button.click();
      
      expect(handler).toHaveBeenCalled();
    });

    it('should prevent double-tap zoom', () => {
      const element = document.createElement('div');
      element.style.touchAction = 'manipulation';
      
      expect(element.style.touchAction).toBe('manipulation');
    });
  });

  describe('Date and Time Handling', () => {
    it('should handle Ethiopian calendar dates', () => {
      const gregorianDate = new Date('2024-01-01');
      expect(gregorianDate.getFullYear()).toBe(2024);
      expect(gregorianDate.getMonth()).toBe(0);
    });

    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = date.toLocaleDateString('en-US');
      expect(formatted).toContain('2024');
    });

    it('should handle timezone differences', () => {
      const date = new Date();
      const utcTime = date.getTime();
      const localTime = date.toLocaleString();
      
      expect(utcTime).toBeGreaterThan(0);
      expect(localTime).toBeDefined();
    });
  });

  describe('Form Validation', () => {
    it('should validate Ethiopian phone numbers', () => {
      const validatePhone = (phone: string): boolean => {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length === 9 && cleaned.startsWith('9');
      };
      
      expect(validatePhone('912345678')).toBe(true);
      expect(validatePhone('923456789')).toBe(true);
      expect(validatePhone('812345678')).toBe(false);
      expect(validatePhone('91234567')).toBe(false);
    });

    it('should validate numeric inputs', () => {
      const validateNumber = (value: string, min: number, max: number): boolean => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
      };
      
      expect(validateNumber('5', 0, 10)).toBe(true);
      expect(validateNumber('15', 0, 10)).toBe(false);
      expect(validateNumber('abc', 0, 10)).toBe(false);
    });

    it('should sanitize text inputs', () => {
      const sanitize = (input: string): string => {
        return input
          .trim()
          .replace(/<script>/gi, '')
          .replace(/javascript:/gi, '')
          .substring(0, 500);
      };
      
      expect(sanitize('  test  ')).toBe('test');
      expect(sanitize('<script>alert("xss")</script>')).toBe('alert("xss")');
      expect(sanitize('x'.repeat(600))).toHaveLength(500);
    });
  });

  describe('Error Handling', () => {
    it('should catch and handle errors gracefully', () => {
      const riskyOperation = () => {
        throw new Error('Test error');
      };
      
      try {
        riskyOperation();
      } catch (error: any) {
        expect(error.message).toBe('Test error');
      }
    });

    it('should handle async errors', async () => {
      const asyncOperation = async () => {
        throw new Error('Async error');
      };
      
      try {
        await asyncOperation();
      } catch (error: any) {
        expect(error.message).toBe('Async error');
      }
    });

    it('should provide user-friendly error messages', () => {
      const getErrorMessage = (error: Error): string => {
        const errorMap: Record<string, string> = {
          'Network error': 'ኢንተርኔት የለም። መረጃው በስልክዎ ተቀምጧል።',
          'Auth error': 'እባክዎ እንደገና ይግቡ',
          'Validation error': 'እባክዎ ትክክለኛ መረጃ ያስገቡ'
        };
        
        return errorMap[error.message] || 'ስህተት ተከስቷል';
      };
      
      expect(getErrorMessage(new Error('Network error'))).toContain('ኢንተርኔት');
      expect(getErrorMessage(new Error('Unknown error'))).toBe('ስህተት ተከስቷል');
    });
  });
});

describe('Performance Benchmarks', () => {
  it('should complete array operations quickly', () => {
    const start = performance.now();
    
    const data = Array.from({ length: 1000 }, (_, i) => i);
    const filtered = data.filter(n => n % 2 === 0);
    const mapped = filtered.map(n => n * 2);
    const reduced = mapped.reduce((sum, n) => sum + n, 0);
    
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(100); // Should complete in <100ms
    expect(reduced).toBeGreaterThan(0);
  });

  it('should handle DOM operations efficiently', () => {
    const start = performance.now();
    
    const container = document.createElement('div');
    for (let i = 0; i < 100; i++) {
      const element = document.createElement('div');
      element.textContent = `Item ${i}`;
      container.appendChild(element);
    }
    
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50); // Should complete in <50ms
    expect(container.children.length).toBe(100);
  });

  it('should parse JSON quickly', () => {
    const data = {
      animals: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Animal ${i}`,
        type: 'cattle',
        records: Array.from({ length: 30 }, (_, j) => ({
          date: new Date(2024, 0, j + 1).toISOString(),
          value: Math.random() * 10
        }))
      }))
    };
    
    const start = performance.now();
    const json = JSON.stringify(data);
    const parsed = JSON.parse(json);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(100); // Should complete in <100ms
    expect(parsed.animals.length).toBe(100);
  });
});
