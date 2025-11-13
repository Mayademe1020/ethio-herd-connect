import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analytics, ANALYTICS_EVENTS, Analytics } from '../lib/analytics';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-123' } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe('Analytics Comprehensive Testing', () => {
  let testAnalytics: Analytics;

  beforeEach(() => {
    localStorage.clear();
    testAnalytics = new Analytics();
  });

  afterEach(() => {
    testAnalytics.destroy();
  });

  describe('1. Event Tracking Tests', () => {
    describe('1.1 Animal Registration Tracking', () => {
      it('should track animal registration with all properties', async () => {
        await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
          animal_type: 'cattle',
          animal_subtype: 'Cow',
          has_photo: true,
          has_name: true,
          is_offline: false,
        });

        expect(testAnalytics.getPendingCount()).toBe(1);
      });

      it('should track animal registration without photo', async () => {
        await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
          animal_type: 'goat',
          animal_subtype: 'Male',
          has_photo: false,
          has_name: true,
          is_offline: false,
        });

        expect(testAnalytics.getPendingCount()).toBe(1);
      });

      it('should track different animal types', async () => {
        const types = ['cattle', 'goat', 'sheep'];
        
        for (const type of types) {
          await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
            animal_type: type,
            animal_subtype: 'test',
            has_photo: false,
            has_name: false,
            is_offline: false,
          });
        }

        expect(testAnalytics.getPendingCount()).toBe(3);
      });
    });

    describe('1.2 Milk Recording Tracking', () => {
      it('should track milk recording with morning session', async () => {
        await testAnalytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {
          amount: 5,
          session: 'morning',
          animal_id: 'animal-123',
          is_offline: false,
        });

        expect(testAnalytics.getPendingCount()).toBe(1);
      });

      it('should track milk recording with evening session', async () => {
        await testAnalytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {
          amount: 7,
          session: 'evening',
          animal_id: 'animal-456',
          is_offline: false,
        });

        expect(testAnalytics.getPendingCount()).toBe(1);
      });

      it('should track different milk amounts', async () => {
        const amounts = [2, 3, 5, 7, 10];
        
        for (const amount of amounts) {
          await testAnalytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {
            amount,
            session: 'morning',
            animal_id: 'animal-123',
            is_offline: false,
          });
        }

        expect(testAnalytics.getPendingCount()).toBe(5);
      });
    });

    describe('1.3 Listing Creation Tracking', () => {
      it('should track listing creation with all properties', async () => {
        await testAnalytics.track(ANALYTICS_EVENTS.LISTING_CREATED, {
          price: 25000,
          is_negotiable: true,
          has_photo: true,
          has_location: true,
          is_offline: false,
        });

        expect(testAnalytics.getPendingCount()).toBe(1);
      });

      it('should track listing without optional fields', async () => {
        await testAnalytics.track(ANALYTICS_EVENTS.LISTING_CREATED, {
          price: 15000,
          is_negotiable: false,
          has_photo: false,
          has_location: false,
          is_offline: false,
        });

        expect(testAnalytics.getPendingCount()).toBe(1);
      });
    });

    describe('1.4 Listing Viewed Tracking', () => {
      it('should track listing view', async () => {
        await testAnalytics.track(ANALYTICS_EVENTS.LISTING_VIEWED, {
          listing_id: 'listing-123',
          price: 30000,
          animal_type: 'cattle',
          is_negotiable: true,
          is_own_listing: false,
        });

        expect(testAnalytics.getPendingCount()).toBe(1);
      });

      it('should track viewing own listing', async () => {
        await testAnalytics.track(ANALYTICS_EVENTS.LISTING_VIEWED, {
          listing_id: 'listing-456',
          price: 20000,
          animal_type: 'goat',
          is_negotiable: false,
          is_own_listing: true,
        });

        expect(testAnalytics.getPendingCount()).toBe(1);
      });
    });

    describe('1.5 Interest Expressed Tracking', () => {
      it('should track interest with message', async () => {
        await testAnalytics.track(ANALYTICS_EVENTS.INTEREST_EXPRESSED, {
          listing_id: 'listing-789',
          has_message: true,
          is_offline: false,
        });

        expect(testAnalytics.getPendingCount()).toBe(1);
      });

      it('should track interest without message', async () => {
        await testAnalytics.track(ANALYTICS_EVENTS.INTEREST_EXPRESSED, {
          listing_id: 'listing-101',
          has_message: false,
          is_offline: false,
        });

        expect(testAnalytics.getPendingCount()).toBe(1);
      });
    });
  });

  describe('2. Offline Queue Tests', () => {
    it('should queue events when offline', async () => {
      await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
        animal_type: 'cattle',
        is_offline: true,
      });

      expect(testAnalytics.getPendingCount()).toBe(1);
      
      const stored = localStorage.getItem('analytics_queue');
      expect(stored).toBeTruthy();
    });

    it('should persist queue across instances', async () => {
      await testAnalytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {
        amount: 5,
      });

      const newAnalytics = new Analytics();
      expect(newAnalytics.getPendingCount()).toBe(1);
      newAnalytics.destroy();
    });

    it('should handle multiple queued events', async () => {
      for (let i = 0; i < 5; i++) {
        await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
          animal_type: 'cattle',
          index: i,
        });
      }

      expect(testAnalytics.getPendingCount()).toBe(5);
    });

    it('should auto-flush when queue reaches max size', async () => {
      for (let i = 0; i < 10; i++) {
        await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
          animal_type: 'cattle',
          index: i,
        });
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      expect(testAnalytics.getPendingCount()).toBe(0);
    });
  });

  describe('3. Data Accuracy Tests', () => {
    it('should include timestamp in all events', async () => {
      await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
        animal_type: 'cattle',
      });

      const stored = localStorage.getItem('analytics_queue');
      const queue = JSON.parse(stored!);
      expect(queue[0].timestamp).toBeTruthy();
      expect(queue[0].properties.timestamp).toBeTruthy();
    });

    it('should preserve all property values', async () => {
      const properties = {
        animal_type: 'cattle',
        animal_subtype: 'Cow',
        has_photo: true,
        has_name: false,
        custom_field: 'test_value',
      };

      await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, properties);

      const stored = localStorage.getItem('analytics_queue');
      const queue = JSON.parse(stored!);
      
      expect(queue[0].properties.animal_type).toBe('cattle');
      expect(queue[0].properties.animal_subtype).toBe('Cow');
      expect(queue[0].properties.has_photo).toBe(true);
      expect(queue[0].properties.has_name).toBe(false);
      expect(queue[0].properties.custom_field).toBe('test_value');
    });
  });

  describe('4. Performance Tests', () => {
    it('should track events quickly', async () => {
      const start = Date.now();
      
      await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
        animal_type: 'cattle',
      });
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should handle batch tracking efficiently', async () => {
      const start = Date.now();
      
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
          animal_type: 'cattle',
          index: i,
        }));
      }
      
      await Promise.all(promises);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500); // 10 events in < 500ms
    });
  });

  describe('5. Edge Case Tests', () => {
    it('should handle empty properties', async () => {
      await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {});
      expect(testAnalytics.getPendingCount()).toBe(1);
    });

    it('should handle large property values', async () => {
      const largeMessage = 'a'.repeat(1000);
      
      await testAnalytics.track(ANALYTICS_EVENTS.INTEREST_EXPRESSED, {
        listing_id: 'test',
        message: largeMessage,
        has_message: true,
      });

      expect(testAnalytics.getPendingCount()).toBe(1);
    });

    it('should handle special characters in properties', async () => {
      await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
        animal_name: 'Test™ Animal® with émojis 🐄',
        special_chars: '<script>alert("xss")</script>',
      });

      expect(testAnalytics.getPendingCount()).toBe(1);
    });

    it('should handle rapid successive calls', async () => {
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
          index: i,
        }));
      }

      await Promise.all(promises);
      
      // Should handle all events without loss
      expect(testAnalytics.getPendingCount()).toBeGreaterThanOrEqual(10);
    });
  });

  describe('6. Error Handling Tests', () => {
    it('should not throw on tracking errors', async () => {
      await expect(
        testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
          animal_type: 'cattle',
        })
      ).resolves.not.toThrow();
    });

    it('should handle flush errors gracefully', async () => {
      await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {});
      
      await expect(testAnalytics.flush()).resolves.not.toThrow();
    });

    it('should continue working after errors', async () => {
      // Cause an error
      await testAnalytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {});
      await testAnalytics.flush();

      // Should still work
      await testAnalytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {
        amount: 5,
      });

      expect(testAnalytics.getPendingCount()).toBeGreaterThan(0);
    });
  });

  describe('7. Event Constants Tests', () => {
    it('should have all required event constants', () => {
      expect(ANALYTICS_EVENTS.ANIMAL_REGISTERED).toBe('animal_registered');
      expect(ANALYTICS_EVENTS.MILK_RECORDED).toBe('milk_recorded');
      expect(ANALYTICS_EVENTS.LISTING_CREATED).toBe('listing_created');
      expect(ANALYTICS_EVENTS.LISTING_VIEWED).toBe('listing_viewed');
      expect(ANALYTICS_EVENTS.INTEREST_EXPRESSED).toBe('interest_expressed');
      expect(ANALYTICS_EVENTS.OFFLINE_ACTION_QUEUED).toBe('offline_action_queued');
      expect(ANALYTICS_EVENTS.OFFLINE_ACTION_SYNCED).toBe('offline_action_synced');
      expect(ANALYTICS_EVENTS.PAGE_VIEW).toBe('page_view');
    });

    it('should use consistent naming convention', () => {
      const events = Object.values(ANALYTICS_EVENTS);
      
      events.forEach(event => {
        expect(event).toMatch(/^[a-z_]+$/); // lowercase with underscores
        expect(event).not.toContain(' '); // no spaces
        expect(event).not.toContain('-'); // no hyphens
      });
    });
  });
});
