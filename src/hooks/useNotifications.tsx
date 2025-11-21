import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextMVP';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  Notification,
  NotificationType,
} from '@/services/notificationService';
import { useToast } from '@/hooks/useToast';

export function useNotifications() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    type?: NotificationType;
    isRead?: boolean;
  }>({});
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Track online/offline status for graceful handling
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      if (!isOnline) {
        // Offline: skip network, keep current cached list
        setLoading(false);
        return;
      }
      const data = await getNotifications(filter);
      setNotifications(data);
    } catch (error: any) {
      // Ignore aborted network calls to prevent noisy logs
      const msg = String(error?.message || '')
        .toLowerCase();
      const isAborted = error?.name === 'AbortError' || msg.includes('abort') || msg.includes('cancel');
      if (!isAborted) {
        console.error('Error fetching notifications:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [user, filter, isOnline]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      if (!isOnline) {
        setUnreadCount(0);
        return;
      }
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error: any) {
      const msg = String(error?.message || '').toLowerCase();
      const isAborted = error?.name === 'AbortError' || msg.includes('abort') || msg.includes('cancel');
      if (!isAborted) {
        console.error('Error fetching unread count:', error);
      }
    }
  }, [user, isOnline]);

  // Mark notification as read
  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    const success = await markAsRead(notificationId);
    
    if (success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    const success = await markAllAsRead();
    
    if (success) {
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    }
  }, [showToast]);

  // Delete notification
  const handleDelete = useCallback(async (notificationId: string) => {
    const success = await deleteNotification(notificationId);
    
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  }, [notifications]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, isOnline, fetchNotifications, fetchUnreadCount]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show toast for high-priority notifications
      if (newNotification.priority === 'high') {
        showToast(newNotification.title, 'info');
      }
    });

    return unsubscribe;
  }, [user, showToast]);

  return {
    notifications,
    unreadCount,
    loading,
    filter,
    setFilter,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    refresh: fetchNotifications,
  };
}
