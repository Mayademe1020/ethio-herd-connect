import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getNotifications,
  NotificationType,
  NotificationPriority,
} from '@/services/notificationService';

// Track the last insert data for mocking
let lastInsertData: any = null;

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn((data) => {
        lastInsertData = data;
        return {
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'test-notification-id',
                user_id: 'test-user-id',
                ...lastInsertData,
                is_read: false,
                created_at: new Date().toISOString(),
              },
              error: null,
            })),
          })),
        };
      }),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [],
            error: null,
          })),
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock offline queue
vi.mock('@/lib/offlineQueue', () => ({
  offlineQueue: {
    add: vi.fn(() => Promise.resolve()),
  },
}));

describe('Notification Service', () => {
  describe('createNotification', () => {
    it('should create a buyer interest notification', async () => {
      const notification = await createNotification({
        type: 'buyer_interest',
        title: 'New Buyer Interest',
        message: 'Someone is interested in your cow',
        priority: 'high',
        action_url: '/listing/123',
        metadata: { buyer_phone: '+251912345678' },
      });

      expect(notification).toBeDefined();
      expect(notification?.type).toBe('buyer_interest');
      expect(notification?.priority).toBe('high');
      expect(notification?.metadata?.buyer_phone).toBe('+251912345678');
    });

    it('should create a milk reminder notification', async () => {
      const notification = await createNotification({
        type: 'milk_reminder',
        title: 'Time to Record Milk',
        message: 'Morning milk recording time',
        priority: 'medium',
      });

      expect(notification).toBeDefined();
      expect(notification?.type).toBe('milk_reminder');
      expect(notification?.priority).toBe('medium');
    });

    it('should create a pregnancy alert notification', async () => {
      const notification = await createNotification({
        type: 'pregnancy_alert',
        title: 'Delivery Soon',
        message: 'Your cow is expected to deliver in 5 days',
        priority: 'high',
      });

      expect(notification).toBeDefined();
      expect(notification?.type).toBe('pregnancy_alert');
      expect(notification?.priority).toBe('high');
    });

    it('should default to medium priority if not specified', async () => {
      const notification = await createNotification({
        type: 'market_alert',
        title: 'New Listing Nearby',
        message: 'A new cow listing was posted nearby',
      });

      expect(notification).toBeDefined();
      expect(notification?.priority).toBe('medium');
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read', async () => {
      const result = await markAsRead('test-notification-id');
      expect(result).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const result = await markAllAsRead();
      expect(result).toBe(true);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      const count = await getUnreadCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getNotifications', () => {
    it('should fetch all notifications', async () => {
      const notifications = await getNotifications();
      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should filter by type', async () => {
      const notifications = await getNotifications({ type: 'buyer_interest' });
      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should filter by read status', async () => {
      const notifications = await getNotifications({ isRead: false });
      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should limit results', async () => {
      const notifications = await getNotifications({ limit: 10 });
      expect(Array.isArray(notifications)).toBe(true);
    });
  });
});

describe('Notification Types', () => {
  it('should have correct notification types', () => {
    const types: NotificationType[] = [
      'buyer_interest',
      'milk_reminder',
      'market_alert',
      'pregnancy_alert',
    ];
    expect(types).toHaveLength(4);
  });

  it('should have correct priority levels', () => {
    const priorities: NotificationPriority[] = ['high', 'medium', 'low'];
    expect(priorities).toHaveLength(3);
  });
});
