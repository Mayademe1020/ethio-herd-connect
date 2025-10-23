/**
 * Hook for managing offline action queue
 * Provides queue operations, sync functionality, and status tracking
 * Optimized for Ethiopian farmers with intermittent connectivity
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotifications } from './useToastNotifications';
import { useTranslations } from './useTranslations';
import { logger } from '@/utils/logger';
import { StoreName } from '@/utils/indexedDB';
import {
  queueOfflineAction,
  syncAllPendingItems,
  getPendingItemsCount,
  getFailedItems,
  retryFailedItems,
  clearFailedItems,
  SYNC_CONFIG,
  SyncProgress
} from '@/utils/offlineActionQueue';

export interface SyncStatus {
  isOnline: boolean;
  syncing: boolean;
  status: 'idle' | 'syncing' | 'error' | 'success';
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  lastSyncTime: number | null;
  pendingCount: number;
  failedCount: number;
}

export const useOfflineActionQueue = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo, showWarning } = useToastNotifications();
  const { t } = useTranslations();
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    syncing: false,
    status: 'idle',
    progress: { total: 0, completed: 0, failed: 0 },
    lastSyncTime: null,
    pendingCount: 0,
    failedCount: 0
  });

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSyncingRef = useRef(false);

  /**
   * Update pending and failed counts
   */
  const updateCounts = useCallback(async () => {
    if (!user) return;

    try {
      const [pendingCount, failedItems] = await Promise.all([
        getPendingItemsCount(user.id),
        getFailedItems(user.id)
      ]);

      setSyncStatus(prev => ({
        ...prev,
        pendingCount,
        failedCount: failedItems.length
      }));
    } catch (error) {
      logger.error('Failed to update counts', error);
    }
  }, [user]);

  /**
   * Queue an action for offline sync
   */
  const queueAction = useCallback(async (
    type: 'create' | 'update' | 'delete',
    table: StoreName,
    data: any
  ): Promise<string | null> => {
    if (!user) {
      logger.warn('Cannot queue action: user not authenticated');
      showError(t('Error'), t('You must be logged in to save changes'));
      return null;
    }

    try {
      const queueId = await queueOfflineAction(type, table, data, user.id);
      
      logger.info(`Queued ${type} action for ${table}`, { queueId });
      
      // Update counts
      await updateCounts();

      // If online, try to sync immediately
      if (syncStatus.isOnline && !syncStatus.syncing) {
        // Don't await - let it sync in background
        syncAll();
      } else {
        showInfo(
          t('Saved offline'),
          t('Your changes will sync when you\'re back online')
        );
      }

      return queueId;
    } catch (error) {
      logger.error('Failed to queue action', error);
      showError(
        t('Save error'),
        t('Failed to save your changes. Please try again.')
      );
      return null;
    }
  }, [user, syncStatus.isOnline, syncStatus.syncing, updateCounts, showInfo, showError, t]);

  /**
   * Sync all pending items
   */
  const syncAll = useCallback(async (): Promise<boolean> => {
    if (!user || !syncStatus.isOnline || isSyncingRef.current) {
      logger.debug('Skipping sync', {
        hasUser: !!user,
        isOnline: syncStatus.isOnline,
        isSyncing: isSyncingRef.current
      });
      return false;
    }

    try {
      isSyncingRef.current = true;
      setSyncStatus(prev => ({ ...prev, syncing: true, status: 'syncing' }));
      
      logger.info('Starting sync for all pending items');

      // Progress callback
      const onProgress = (progress: SyncProgress) => {
        setSyncStatus(prev => ({
          ...prev,
          progress: {
            total: progress.total,
            completed: progress.completed,
            failed: progress.failed
          }
        }));
      };

      // Execute sync
      const result = await syncAllPendingItems(user.id, onProgress);

      // Update status
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        status: result.completed > 0 ? 'success' : 'error',
        lastSyncTime: Date.now()
      }));

      // Update counts
      await updateCounts();

      // Show notification
      if (result.completed > 0) {
        showSuccess(
          t('Sync complete'),
          `${t('Successfully synced')} ${result.completed} ${t('items')}` +
          (result.failed > 0 ? `, ${result.failed} ${t('failed')}` : '')
        );
      } else if (result.failed > 0) {
        showWarning(
          t('Sync incomplete'),
          `${result.failed} ${t('items failed to sync')}`
        );
      }

      logger.info('Sync completed', {
        completed: result.completed,
        failed: result.failed
      });

      return result.success;
    } catch (error) {
      logger.error('Sync failed', error);
      
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        status: 'error'
      }));

      showError(
        t('Sync error'),
        t('Failed to sync your changes. Will retry later.')
      );

      return false;
    } finally {
      isSyncingRef.current = false;
    }
  }, [user, syncStatus.isOnline, updateCounts, showSuccess, showWarning, showError, t]);

  /**
   * Retry failed items
   */
  const retryFailed = useCallback(async () => {
    if (!user) return;

    try {
      const count = await retryFailedItems(user.id);
      
      if (count > 0) {
        showInfo(
          t('Retrying'),
          `${t('Retrying')} ${count} ${t('failed items')}`
        );
        
        // Update counts and trigger sync
        await updateCounts();
        if (syncStatus.isOnline) {
          syncAll();
        }
      }
    } catch (error) {
      logger.error('Failed to retry items', error);
      showError(t('Error'), t('Failed to retry items'));
    }
  }, [user, syncStatus.isOnline, updateCounts, syncAll, showInfo, showError, t]);

  /**
   * Clear failed items
   */
  const clearFailed = useCallback(async () => {
    if (!user) return;

    try {
      const count = await clearFailedItems(user.id);
      
      if (count > 0) {
        showInfo(
          t('Cleared'),
          `${t('Cleared')} ${count} ${t('failed items')}`
        );
        
        // Update counts
        await updateCounts();
      }
    } catch (error) {
      logger.error('Failed to clear items', error);
      showError(t('Error'), t('Failed to clear items'));
    }
  }, [user, updateCounts, showInfo, showError, t]);

  /**
   * Get sync status message
   */
  const getSyncStatusMessage = useCallback((): string => {
    if (!syncStatus.isOnline) {
      return syncStatus.pendingCount > 0
        ? `${syncStatus.pendingCount} ${t('items queued for sync')}`
        : t('Offline mode');
    }

    switch (syncStatus.status) {
      case 'syncing':
        return t('Syncing...');
      case 'success':
        return syncStatus.pendingCount > 0
          ? `${syncStatus.pendingCount} ${t('items pending')}`
          : t('All synced');
      case 'error':
        return t('Sync error');
      default:
        return syncStatus.pendingCount > 0
          ? `${syncStatus.pendingCount} ${t('items to sync')}`
          : t('All synced');
    }
  }, [syncStatus, t]);

  /**
   * Handle online event
   */
  const handleOnline = useCallback(() => {
    logger.info('Connection restored');
    setSyncStatus(prev => ({ ...prev, isOnline: true }));
    
    showInfo(
      t('Back online'),
      t('Starting to sync pending changes...')
    );
    
    // Trigger sync after a short delay
    setTimeout(() => {
      syncAll();
    }, 1000);
  }, [syncAll, showInfo, t]);

  /**
   * Handle offline event
   */
  const handleOffline = useCallback(() => {
    logger.info('Connection lost');
    setSyncStatus(prev => ({ ...prev, isOnline: false, status: 'idle' }));
    
    showInfo(
      t('Offline mode'),
      t('Changes will be saved locally and synced when online.')
    );
  }, [showInfo, t]);

  /**
   * Set up online/offline event listeners
   */
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  /**
   * Set up periodic sync
   */
  useEffect(() => {
    if (!user) return;

    // Clear existing interval
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    // Set up new interval
    syncIntervalRef.current = setInterval(() => {
      if (syncStatus.isOnline && syncStatus.pendingCount > 0 && !syncStatus.syncing) {
        logger.debug('Periodic sync triggered');
        syncAll();
      }
    }, SYNC_CONFIG.SYNC_INTERVAL);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [user, syncStatus.isOnline, syncStatus.pendingCount, syncStatus.syncing, syncAll]);

  /**
   * Load initial counts
   */
  useEffect(() => {
    if (user) {
      updateCounts();
    }
  }, [user, updateCounts]);

  /**
   * Sync on mount if online and has pending items
   */
  useEffect(() => {
    if (user && syncStatus.isOnline && syncStatus.pendingCount > 0) {
      // Delay initial sync to avoid race conditions
      const timer = setTimeout(() => {
        syncAll();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user]); // Only run on mount

  return {
    // Queue operations
    queueAction,
    
    // Sync operations
    syncAll,
    retryFailed,
    clearFailed,
    
    // Status
    syncStatus,
    getSyncStatusMessage,
    
    // Convenience getters
    isOnline: syncStatus.isOnline,
    isSyncing: syncStatus.syncing,
    pendingCount: syncStatus.pendingCount,
    failedCount: syncStatus.failedCount,
    hasItemsToSync: syncStatus.pendingCount > 0 || syncStatus.failedCount > 0
  };
};
