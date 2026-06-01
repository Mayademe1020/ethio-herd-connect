/**
 * Enhanced offline sync hook with IndexedDB queue and exponential backoff
 * Optimized for Ethiopian farmers with intermittent connectivity
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextMVP';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslations } from '@/hooks/useTranslations';
import { sanitizeInput } from '@/utils/animalIdGenerator';
import { logger } from '@/utils/logger';
import {
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  updateSyncQueueRetryCount,
  STORES,
  StoreName,
  SyncQueueItem
} from '@/utils/indexedDB';

const MAX_RETRY_COUNT = 5;
const SYNC_INTERVAL = 60000; // 1 minute
const BASE_RETRY_DELAY = 1000; // 1 second

interface SyncStatus {
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
}

export const useEnhancedOfflineSync = () => {
  const { user } = useAuth();
  const { t } = useTranslations();

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    syncing: false,
    status: 'idle',
    progress: { total: 0, completed: 0, failed: 0 },
    lastSyncTime: null,
    pendingCount: 0
  });

  /**
   * Calculate exponential backoff delay
   */
  const getRetryDelay = (retryCount: number): number => {
    return BASE_RETRY_DELAY * Math.pow(2, retryCount);
  };

  /**
   * Sanitize data before syncing
   */
  const sanitizeDataForSync = useCallback((data: Record<string, unknown>): Record<string, unknown> => {
    const sanitized: Record<string, unknown> = { ...data };

    // Sanitize text fields
    if (typeof sanitized.name === 'string') sanitized.name = sanitizeInput(sanitized.name);
    if (typeof sanitized.description === 'string') sanitized.description = sanitizeInput(sanitized.description);
    if (typeof sanitized.notes === 'string') sanitized.notes = sanitizeInput(sanitized.notes);
    if (typeof sanitized.symptoms === 'string') sanitized.symptoms = sanitizeInput(sanitized.symptoms);
    if (typeof sanitized.medicine_name === 'string') sanitized.medicine_name = sanitizeInput(sanitized.medicine_name);
    if (typeof sanitized.group_name === 'string') sanitized.group_name = sanitizeInput(sanitized.group_name);
    if (typeof sanitized.title === 'string') sanitized.title = sanitizeInput(sanitized.title);

    return sanitized;
  }, []);

  /**
   * Add action to sync queue
   */
  const queueAction = useCallback(async (
    type: 'create' | 'update' | 'delete',
    table: StoreName,
    data: Record<string, unknown>
  ) => {
    if (!user) {
      logger.warn('Cannot queue action: user not authenticated');
      return;
    }

    try {
      const sanitizedData = sanitizeDataForSync(data);
      const queueId = await addToSyncQueue(type, table, sanitizedData, user.id);
      
      logger.debug(`Queued ${type} action for ${table}`, { queueId });
      
      // Update pending count
      const queue = await getSyncQueue(user.id);
      setSyncStatus(prev => ({ ...prev, pendingCount: queue.length }));

      // If online, try to sync immediately
      if (syncStatus.isOnline && !syncStatus.syncing) {
        syncAll();
      } else {
        toast.info(
          t('Your changes will sync when you\'re back online')
        );
      }
    } catch (error) {
      logger.error('Failed to queue action', error);
      toast.error(
        t('Failed to save your changes. Please try again.')
      );
    }
  }, [user, syncStatus.isOnline, syncStatus.syncing, sanitizeDataForSync, t]);

  /**
   * Sync a single queue item
   */
  const syncQueueItem = useCallback(async (item: SyncQueueItem): Promise<boolean> => {
    try {
      logger.debug('Syncing queue item', { item });

      const { type, table } = item;
      const data = item.data as Record<string, unknown>;

      // Map STORES constants to actual table names
      const tableMap: Record<string, string> = {
        [STORES.ANIMALS]: 'animals',
        [STORES.HEALTH_RECORDS]: 'health_records',
        [STORES.MILK_PRODUCTION]: 'milk_production',
        [STORES.MARKET_LISTINGS]: 'market_listings'
      };

      const actualTable = tableMap[table] || table;
      let result: { error?: unknown } | null = null;

      switch (actualTable) {
        case 'animals':
          if (type === 'create') {
            result = await supabase.from('animals').insert([data]);
          } else if (type === 'update') {
            result = await supabase.from('animals').update(data).eq('id', data.id as string);
          } else if (type === 'delete') {
            result = await supabase.from('animals').delete().eq('id', data.id as string);
          }
          break;

        case 'health_records':
          if (type === 'create') {
            // Handle bulk vaccination
            const animalIds = data.animalIds;
            if (Array.isArray(animalIds)) {
              const healthRecords = (animalIds as string[]).map((animalId) => ({
                animal_id: animalId,
                user_id: data.user_id as string,
                record_type: 'vaccination',
                medicine_name: data.medicine as string,
                administered_date: data.date as string,
                notes: data.notes as string
              }));
              result = await supabase.from('health_records').insert(healthRecords);
            } else {
              result = await supabase.from('health_records').insert([data]);
            }
          } else if (type === 'update') {
            result = await supabase.from('health_records').update(data).eq('id', data.id as string);
          } else if (type === 'delete') {
            result = await supabase.from('health_records').delete().eq('id', data.id as string);
          }
          break;

        case 'milk_production':
          if (type === 'create') {
            result = await supabase.from('milk_production').insert([data]);
          } else if (type === 'update') {
            result = await supabase.from('milk_production').update(data).eq('id', data.id as string);
          } else if (type === 'delete') {
            result = await supabase.from('milk_production').delete().eq('id', data.id as string);
          }
          break;

        case 'market_listings':
          if (type === 'create') {
            result = await supabase.from('market_listings').insert([data]);
          } else if (type === 'update') {
            result = await supabase.from('market_listings').update(data).eq('id', data.id as string);
          } else if (type === 'delete') {
            result = await supabase.from('market_listings').delete().eq('id', data.id as string);
          }
          break;

        default:
          throw new Error(`Unknown table: ${table}`);
      }

      if (result?.error) {
        throw result.error;
      }

      logger.info(`Successfully synced ${type} for ${table}`, { id: item.id });
      return true;
    } catch (error) {
      logger.error('Failed to sync queue item', error);
      return false;
    }
  }, []);

  /**
   * Sync all pending items with exponential backoff
   */
  const syncAll = useCallback(async () => {
    if (!user || !syncStatus.isOnline || syncStatus.syncing) {
      return;
    }

    try {
      setSyncStatus(prev => ({ ...prev, syncing: true, status: 'syncing' }));
      logger.info('Starting sync for all pending items');

      const queue = await getSyncQueue(user.id);
      const itemsToSync = queue.filter(item => item.retryCount < MAX_RETRY_COUNT);

      if (itemsToSync.length === 0) {
        setSyncStatus(prev => ({
          ...prev,
          syncing: false,
          status: 'success',
          pendingCount: 0
        }));
        return;
      }

      toast.info(
        `${t('Syncing')} ${itemsToSync.length} ${t('pending changes')}...`
      );

      let completed = 0;
      let failed = 0;

      for (const item of itemsToSync) {
        // Apply exponential backoff delay
        if (item.retryCount > 0) {
          const delay = getRetryDelay(item.retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const success = await syncQueueItem(item);

        if (success) {
          await removeFromSyncQueue(item.id);
          completed++;
        } else {
          await updateSyncQueueRetryCount(item.id, item.retryCount + 1);
          failed++;

          // Show warning if max retries reached
          if (item.retryCount + 1 >= MAX_RETRY_COUNT) {
            toast.warning(
              `${t('Failed to sync')} ${item.table} ${t('after')} ${MAX_RETRY_COUNT} ${t('attempts')}`
            );
          }
        }

        // Update progress
        setSyncStatus(prev => ({
          ...prev,
          progress: {
            total: itemsToSync.length,
            completed,
            failed
          }
        }));

        // Small delay between syncs
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Get updated queue count
      const remainingQueue = await getSyncQueue(user.id);

      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        status: completed > 0 ? 'success' : 'error',
        lastSyncTime: Date.now(),
        pendingCount: remainingQueue.length
      }));

      if (completed > 0) {
        toast.success(
          `${t('Successfully synced')} ${completed} ${t('items')}` +
          (failed > 0 ? `, ${failed} ${t('failed')}` : '')
        );
      }

      logger.info('Sync completed', { completed, failed });
    } catch (error) {
      logger.error('Sync failed', error);
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        status: 'error'
      }));
      toast.error(
        t('Failed to sync your changes. Will retry later.')
      );
    }
  }, [user, syncStatus.isOnline, syncStatus.syncing, syncQueueItem, t]);

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
   * Handle online/offline events
   */
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      toast.info(t('Starting to sync pending changes...'));
      syncAll();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false, status: 'idle' }));
      toast.info(
        t('Changes will be saved locally and synced when online.')
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncAll, t]);

  /**
   * Periodic sync
   */
  useEffect(() => {
    if (!user) return;

    const syncInterval = setInterval(() => {
      if (syncStatus.isOnline && syncStatus.pendingCount > 0 && !syncStatus.syncing) {
        syncAll();
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(syncInterval);
  }, [user, syncStatus.isOnline, syncStatus.pendingCount, syncStatus.syncing, syncAll]);

  /**
   * Load pending count on mount
   */
  useEffect(() => {
    if (user) {
      getSyncQueue(user.id).then(queue => {
        setSyncStatus(prev => ({ ...prev, pendingCount: queue.length }));
      });
    }
  }, [user]);

  return {
    // Queue operations
    queueAction,
    
    // Sync operations
    syncAll,
    
    // Status
    syncStatus,
    getSyncStatusMessage,
    
    // Convenience getters
    isOnline: syncStatus.isOnline,
    isSyncing: syncStatus.syncing,
    pendingCount: syncStatus.pendingCount
  };
};
