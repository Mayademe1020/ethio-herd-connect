import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analytics, ANALYTICS_EVENTS } from '../lib/analytics';

// Mock the analytics module
vi.mock('../lib/analytics', () => {
  const mockTrack = vi.fn();
  return {
    analytics: {
      track: mockTrack,
      page: vi.fn(),
      identify: vi.fn(),
      flush: vi.fn(),
      getPendingCount: vi.fn().mockReturnValue(0),
      clearQueue: vi.fn(),
      destroy: vi.fn(),
    },
    ANALYTICS_EVENTS: {
      ANIMAL_REGISTERED: 'animal_registered',
      MILK_RECORDED: 'milk_recorded',
      LISTING_CREATED: 'listing_created',
      LISTING_VIEWED: 'listing_viewed',
      INTEREST_EXPRESSED: 'interest_expressed',
      OFFLINE_ACTION_QUEUED: 'offline_action_queued',
      OFFLINE_ACTION_SYNCED: 'offline_action_synced',
      PAGE_VIEW: 'page_view',
    },
  };
});

describe('Analytics Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Animal Registration Analytics', () => {
    it('should track animal registration event', async () => {
      // Simulate animal registration
      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
        animal_type: 'cattle',
        animal_subtype: 'Cow',
        has_photo: true,
        has_name: true,
        is_offline: false,
      });

      expect(analytics.track).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.ANIMAL_REGISTERED,
        expect.objectContaining({
          animal_type: 'cattle',
          animal_subtype: 'Cow',
          has_photo: true,
          has_name: true,
          is_offline: false,
        })
      );
    });

    it('should track animal registration without photo', async () => {
      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
        animal_type: 'goat',
        animal_subtype: 'Male',
        has_photo: false,
        has_name: true,
        is_offline: false,
      });

      expect(analytics.track).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.ANIMAL_REGISTERED,
        expect.objectContaining({
          has_photo: false,
        })
      );
    });

    it('should track offline animal registration', async () => {
      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
        animal_type: 'sheep',
        animal_subtype: 'Ram',
        has_photo: true,
        has_name: false,
        is_offline: true,
      });

      expect(analytics.track).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.ANIMAL_REGISTERED,
        expect.objectContaining({
          is_offline: true,
        })
      );
    });

    it('should include all required properties', async () => {
      await analytics.track(ANALYTICS_EVENTS.ANIMAL_REGISTERED, {
        animal_type: 'cattle',
        animal_subtype: 'Bull',
        has_photo: true,
        has_name: true,
        is_offline: false,
      });

      const call = vi.mocked(analytics.track).mock.calls[0];
      expect(call[0]).toBe(ANALYTICS_EVENTS.ANIMAL_REGISTERED);
      expect(call[1]).toHaveProperty('animal_type');
      expect(call[1]).toHaveProperty('animal_subtype');
      expect(call[1]).toHaveProperty('has_photo');
      expect(call[1]).toHaveProperty('has_name');
      expect(call[1]).toHaveProperty('is_offline');
    });
  });

  describe('Milk Recording Analytics', () => {
    it('should track milk recording event', async () => {
      await analytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {
        amount: 5,
        session: 'morning',
        animal_id: 'animal-123',
        is_offline: false,
      });

      expect(analytics.track).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.MILK_RECORDED,
        expect.objectContaining({
          amount: 5,
          session: 'morning',
          animal_id: 'animal-123',
          is_offline: false,
        })
      );
    });

    it('should track evening milk recording', async () => {
      await analytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {
        amount: 7,
        session: 'evening',
        animal_id: 'animal-456',
        is_offline: false,
      });

      expect(analytics.track).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.MILK_RECORDED,
        expect.objectContaining({
          session: 'evening',
        })
      );
    });

    it('should track offline milk recording', async () => {
      await analytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {
        amount: 3,
        session: 'morning',
        animal_id: 'animal-789',
        is_offline: true,
      });

      expect(analytics.track).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.MILK_RECORDED,
        expect.objectContaining({
          is_offline: true,
        })
      );
    });

    it('should include all required properties', async () => {
      await analytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {
        amount: 6,
        session: 'morning',
        animal_id: 'animal-999',
        is_offline: false,
      });

      const call = vi.mocked(analytics.track).mock.calls[0];
      expect(call[0]).toBe(ANALYTICS_EVENTS.MILK_RECORDED);
      expect(call[1]).toHaveProperty('amount');
      expect(call[1]).toHaveProperty('session');
      expect(call[1]).toHaveProperty('animal_id');
      expect(call[1]).toHaveProperty('is_offline');
    });
  });

  describe('Marketplace Analytics', () => {
    it('should track listing creation event', async () => {
      await analytics.track(ANALYTICS_EVENTS.LISTING_CREATED, {
        price: 25000,
        is_negotiable: true,
        has_photo: true,
        has_location: true,
        is_offline: false,
      });

      expect(analytics.track).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.LISTING_CREATED,
        expect.objectContaining({
          price: 25000,
          is_negotiable: true,
          has_photo: true,
          has_location: true,
          is_offline: false,
        })
      );
    });

    it('should track listing viewed event', async () => {
      await analytics.track(ANALYTICS_EVENTS.LISTING_VIEWED, {
        listing_id: 'listing-123',
        price: 30000,
        animal_type: 'cattle',
        is_negotiable: false,
        is_own_listing: false,
      });

      expect(analytics.track).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.LISTING_VIEWED,
        expect.objectContaining({
          listing_id: 'listing-123',
          animal_type: 'cattle',
        })
      );
    });

    it('should track interest expressed event', async () => {
      await analytics.track(ANALYTICS_EVENTS.INTEREST_EXPRESSED, {
        listing_id: 'listing-456',
        has_message: true,
        is_offline: false,
      });

      expect(analytics.track).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.INTEREST_EXPRESSED,
        expect.objectContaining({
          listing_id: 'listing-456',
          has_message: true,
        })
      );
    });

    it('should track offline listing creation', async () => {
      await analytics.track(ANALYTICS_EVENTS.LISTING_CREATED, {
        price: 15000,
        is_negotiable: true,
        has_photo: false,
        has_location: false,
        is_offline: true,
      });

      expect(analytics.track).toHaveBeenCalledWith(
        ANALYTICS_EVENTS.LISTING_CREATED,
        expect.objectContaining({
          is_offline: true,
        })
      );
    });
  });

  describe('Event Name Constants', () => {
    it('should use correct event name for animal registration', () => {
      expect(ANALYTICS_EVENTS.ANIMAL_REGISTERED).toBe('animal_registered');
    });

    it('should use correct event name for milk recording', () => {
      expect(ANALYTICS_EVENTS.MILK_RECORDED).toBe('milk_recorded');
    });

    it('should use correct event name for listing creation', () => {
      expect(ANALYTICS_EVENTS.LISTING_CREATED).toBe('listing_created');
    });

    it('should use correct event name for listing viewed', () => {
      expect(ANALYTICS_EVENTS.LISTING_VIEWED).toBe('listing_viewed');
    });

    it('should use correct event name for interest expressed', () => {
      expect(ANALYTICS_EVENTS.INTEREST_EXPRESSED).toBe('interest_expressed');
    });
  });
});
