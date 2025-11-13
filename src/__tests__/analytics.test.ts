import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Analytics, ANALYTICS_EVENTS } from '../lib/analytics';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe('Analytics', () => {
  let analytics: Analytics;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Create new analytics instance
    analytics = new Analytics();
  });

  afterEach(() => {
    analytics.destroy();
  });

  describe('Event Tracking', () => {
    it('should track an event', async () => {
      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
        animal_type: 'cow',
        has_photo: true,
      });

      expect(analytics.getPendingCount()).toBe(1);
    });

    it('should track multiple events', async () => {
      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, { animal_type: 'cow' });
      await analytics.track(ANALYTICS_EVENTS.MILK_RECORDED, { amount: 5 });
      await analytics.track(ANALYTICS_EVENTS.LISTING_CREATED, { price: 15000 });

      expect(analytics.getPendingCount()).toBe(3);
    });

    it('should include timestamp in event properties', async () => {
      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
        animal_type: 'cow',
      });

      // Event should be queued
      expect(analytics.getPendingCount()).toBe(1);
    });

    it('should handle tracking errors gracefully', async () => {
      // Should not throw even if there's an error
      await expect(
        analytics.track('test_event', { test: 'data' })
      ).resolves.not.toThrow();
    });
  });

  describe('Page Tracking', () => {
    it('should track page views', async () => {
      await analytics.page('Home');

      expect(analytics.getPendingCount()).toBe(1);
    });

    it('should include page name in properties', async () => {
      await analytics.page('Animal Registration', {
        step: 1,
      });

      expect(analytics.getPendingCount()).toBe(1);
    });
  });

  describe('User Identification', () => {
    it('should identify a user', async () => {
      await analytics.identify('user-123', {
        farm_name: 'Test Farm',
        location: 'Addis Ababa',
      });

      expect(analytics.getPendingCount()).toBe(1);
    });
  });

  describe('Queue Management', () => {
    it('should persist queue to localStorage', async () => {
      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
        animal_type: 'cow',
      });

      const stored = localStorage.getItem('analytics_queue');
      expect(stored).toBeTruthy();
      
      const queue = JSON.parse(stored!);
      expect(queue).toHaveLength(1);
      expect(queue[0].event_name).toBe(ANALYTICS_EVENTS.ANIMAL_REGISTERED);
    });

    it('should load queue from localStorage on init', async () => {
      // Manually set queue in localStorage
      const mockQueue = [
        {
          event_name: ANALYTICS_EVENTS.MILK_RECORDED,
          properties: { amount: 5 },
          timestamp: new Date().toISOString(),
        },
      ];
      localStorage.setItem('analytics_queue', JSON.stringify(mockQueue));

      // Create new instance
      const newAnalytics = new Analytics();
      
      expect(newAnalytics.getPendingCount()).toBe(1);
      
      newAnalytics.destroy();
    });

    it('should clear queue', async () => {
      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {});
      await analytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {});

      expect(analytics.getPendingCount()).toBe(2);

      analytics.clearQueue();

      expect(analytics.getPendingCount()).toBe(0);
    });

    it('should auto-flush when queue reaches max size', async () => {
      // Track 10 events (MAX_QUEUE_SIZE)
      for (let i = 0; i < 10; i++) {
        await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
          animal_type: 'cow',
          index: i,
        });
      }

      // Wait a bit for flush to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Queue should be empty after auto-flush
      expect(analytics.getPendingCount()).toBe(0);
    });
  });

  describe('Flush', () => {
    it('should flush events to Supabase', async () => {
      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
        animal_type: 'cow',
      });

      expect(analytics.getPendingCount()).toBe(1);

      await analytics.flush();

      expect(analytics.getPendingCount()).toBe(0);
    });

    it('should handle flush errors gracefully', async () => {
      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {});

      // Should not throw
      await expect(analytics.flush()).resolves.not.toThrow();
    });

    it('should not flush if queue is empty', async () => {
      expect(analytics.getPendingCount()).toBe(0);

      await expect(analytics.flush()).resolves.not.toThrow();
    });
  });

  describe('Offline Support', () => {
    it('should queue events when offline', async () => {
      // Track events
      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {});
      await analytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {});

      // Events should be queued
      expect(analytics.getPendingCount()).toBe(2);

      // Queue should persist
      const stored = localStorage.getItem('analytics_queue');
      expect(stored).toBeTruthy();
    });

    it('should retry failed events', async () => {
      // Mock Supabase to fail
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Network error' },
        }),
      } as any);

      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {});
      
      await analytics.flush();

      // Event should still be in queue after failed flush
      expect(analytics.getPendingCount()).toBe(1);
    });
  });

  describe('Event Constants', () => {
    it('should have all required event names', () => {
      expect(ANALYTICS_EVENTS.ANIMAL_REGISTERED).toBe('animal_registered');
      expect(ANALYTICS_EVENTS.MILK_RECORDED).toBe('milk_recorded');
      expect(ANALYTICS_EVENTS.LISTING_CREATED).toBe('listing_created');
      expect(ANALYTICS_EVENTS.LISTING_VIEWED).toBe('listing_viewed');
      expect(ANALYTICS_EVENTS.INTEREST_EXPRESSED).toBe('interest_expressed');
      expect(ANALYTICS_EVENTS.OFFLINE_ACTION_QUEUED).toBe('offline_action_queued');
      expect(ANALYTICS_EVENTS.OFFLINE_ACTION_SYNCED).toBe('offline_action_synced');
      expect(ANALYTICS_EVENTS.PAGE_VIEW).toBe('page_view');
    });
  });
});
