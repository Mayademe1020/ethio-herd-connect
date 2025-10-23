
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { sanitizeInput } from '@/utils/animalIdGenerator';
import { useTranslations } from '@/hooks/useTranslations';
import { compressData, decompressData } from '@/utils/dataCompression';
import { logger } from '@/utils/logger';

// Merged from both useOfflineSync implementations
interface SyncData {
  id: string;
  type: 'animal' | 'health' | 'market' | 'growth' | 'poultry_group';
  data: any;
  timestamp: number;
  synced: boolean;
  retryCount?: number;
  conflictResolution?: 'local' | 'remote' | 'manual';
  serverVersion?: any;
}

const MAX_RETRY_COUNT = 5; // Using the higher retry count from .tsx version
const SYNC_STORAGE_KEY = 'bet-gitosa-pending-sync';
const SYNC_INTERVAL = 60000; // 1 minute

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState<SyncData[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success' | 'conflict'>('idle');
  const [syncProgress, setSyncProgress] = useState({ total: 0, completed: 0, failed: 0 });
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const { showSuccess, showError, showInfo, showWarning } = useToastNotifications();
  const { t } = useTranslations();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showInfo(t('Back online'), t('Starting to sync pending changes...'));
      setSyncStatus('syncing');
      syncAll();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('idle');
      showInfo(t('Offline mode'), t('Changes will be saved locally and synced when online.'));
    };

    // Check connection stability
    const checkConnectionStability = () => {
      if (navigator.onLine) {
        // Test connection by making a small request
        fetch('/ping', { method: 'HEAD', cache: 'no-store' })
          .then(() => {
            if (!isOnline) {
              setIsOnline(true);
              showInfo(t('Connection restored'), t('Starting to sync pending changes...'));
              syncAll();
            }
          })
          .catch(() => {
            if (isOnline) {
              setIsOnline(false);
              showWarning(t('Unstable connection'), t('Your connection appears unstable. Data will be saved locally.'));
            }
          });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadPendingSync();
    
    // Set up periodic sync
    const syncInterval = setInterval(() => {
      if (isOnline && pendingSync.filter(item => !item.synced).length > 0) {
        syncAll();
      }
    }, SYNC_INTERVAL);
    
    // Set up connection stability check
    const stabilityCheckInterval = setInterval(checkConnectionStability, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
      clearInterval(stabilityCheckInterval);
    };
  }, [isOnline, pendingSync]);

  const loadPendingSync = useCallback(() => {
    const stored = localStorage.getItem(SYNC_STORAGE_KEY);
    if (stored) {
      try {
        // Try to decompress data if it's compressed
        let parsedData;
        try {
          parsedData = decompressData(stored);
        } catch (e) {
          // Fallback to regular JSON parsing for backward compatibility
          parsedData = JSON.parse(stored);
        }
        
        // Validate data structure
        if (Array.isArray(parsedData)) {
          // Filter out any corrupted entries
          const validData = parsedData.filter(item => 
            item && item.id && item.type && item.data && item.timestamp
          );
          
          setPendingSync(validData);
          
          if (validData.length > 0 && isOnline) {
            const pendingCount = validData.filter(item => !item.synced).length;
            if (pendingCount > 0) {
              showInfo(
                t('Pending changes'),
                t('{{count}} changes will sync when online', { count: pendingCount })
              );
            }
          }
        } else {
          throw new Error('Invalid sync data format');
        }
      } catch (error) {
        logger.error('Error parsing stored sync data', error);
        // Create backup before removing
        localStorage.setItem(`${SYNC_STORAGE_KEY}-backup-${Date.now()}`, stored);
        localStorage.removeItem(SYNC_STORAGE_KEY);
        setPendingSync([]);
        showError(
          t('Data recovery needed'),
          t('There was an issue with your saved data. Please contact support if you notice missing information.')
        );
      }
    }
  }, [isOnline, showInfo, showError, t]);

  const savePendingSync = useCallback((data: SyncData[]) => {
    try {
      // Compress data before saving to reduce storage usage
      const compressedData = compressData(data);
      localStorage.setItem(SYNC_STORAGE_KEY, compressedData);
      setPendingSync(data);
      
      // Update storage usage metrics
      const storageUsed = estimateStorageUsage();
      if (storageUsed > 80) { // If using more than 80% of available storage
        showWarning(
          t('Storage nearly full'),
          t('Your device storage is {{percent}}% full. Consider clearing old data.', { percent: storageUsed.toFixed(0) })
        );
      }
    } catch (error) {
      logger.error('Error saving pending sync data', error);
      showError(
        t('Storage error'),
        t('Failed to save data locally. Your device may be out of storage.')
      );
    }
  }, [showWarning, showError, t]);
  
  // Estimate local storage usage percentage
  const estimateStorageUsage = (): number => {
    try {
      let total = 0;
      let used = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            used += value.length * 2; // Approximate bytes used
          }
        }
      }
      
      // Estimate total available (5MB is typical browser limit)
      total = 5 * 1024 * 1024;
      
      return (used / total) * 100;
    } catch (e) {
      return 0;
    }
  };

  const addToQueue = (type: SyncData['type'], data: any) => {
    // Sanitize data before adding to queue
    const sanitizedData = sanitizeDataForSync(data);
    
    const syncItem: SyncData = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      data: sanitizedData,
      timestamp: Date.now(),
      synced: false,
      retryCount: 0
    };

    const newQueue = [...pendingSync, syncItem];
    savePendingSync(newQueue);

    logger.debug(`Added to offline queue: ${type}`, { syncItem });

    if (isOnline && !syncing) {
      syncData(syncItem);
    }
  };

  const sanitizeDataForSync = (data: any): any => {
    const sanitized = { ...data };
    
    // Sanitize text fields
    if (sanitized.name) sanitized.name = sanitizeInput(sanitized.name);
    if (sanitized.description) sanitized.description = sanitizeInput(sanitized.description);
    if (sanitized.notes) sanitized.notes = sanitizeInput(sanitized.notes);
    if (sanitized.symptoms) sanitized.symptoms = sanitizeInput(sanitized.symptoms);
    if (sanitized.medicine_name) sanitized.medicine_name = sanitizeInput(sanitized.medicine_name);
    if (sanitized.group_name) sanitized.group_name = sanitizeInput(sanitized.group_name);
    if (sanitized.title) sanitized.title = sanitizeInput(sanitized.title);
    
    return sanitized;
  };

  const syncData = async (item: SyncData) => {
    try {
      logger.debug('Syncing item', { item });
      
      let result;
      switch (item.type) {
        case 'animal':
          result = await supabase
            .from('animals')
            .insert([item.data]);
          break;
        case 'health':
          if (item.data.animalIds && Array.isArray(item.data.animalIds)) {
            const healthRecords = item.data.animalIds.map((animalId: string) => ({
              animal_id: animalId,
              user_id: item.data.user_id,
              record_type: 'vaccination',
              medicine_name: item.data.medicine,
              administered_date: item.data.date,
              notes: item.data.notes
            }));
            
            result = await supabase
              .from('health_records')
              .insert(healthRecords);
          } else {
            result = await supabase
              .from('health_records')
              .insert([item.data]);
          }
          break;
        case 'market':
          result = await supabase
            .from('market_listings')
            .insert([item.data]);
          break;
        case 'growth':
          result = await supabase
            .from('growth_records')
            .insert([item.data]);
          break;
        case 'poultry_group':
          result = await supabase
            .from('poultry_groups')
            .insert([item.data]);
          break;
        default:
          throw new Error(`Unknown sync type: ${item.type}`);
      }

      if (result.error) {
        throw result.error;
      }

      const updatedQueue = pendingSync.map(q => 
        q.id === item.id ? { ...q, synced: true } : q
      );
      savePendingSync(updatedQueue);
      
      logger.info(`Successfully synced ${item.type}`, { id: item.id });
    } catch (error) {
      logger.error('Sync failed for item', error, { item });
      
      // Increment retry count
      const updatedQueue = pendingSync.map(q => 
        q.id === item.id ? { ...q, retryCount: (q.retryCount || 0) + 1 } : q
      );
      savePendingSync(updatedQueue);
      
      // If max retries reached, show error
      if ((item.retryCount || 0) >= MAX_RETRY_COUNT) {
        showError(
          'Sync failed permanently',
          `Failed to sync ${item.type} data after ${MAX_RETRY_COUNT} attempts.`
        );
      } else {
        showError(
          'Sync failed',
          `Failed to sync ${item.type} data. Will retry later.`
        );
      }
    }
  };

  const syncAll = async () => {
    if (!isOnline || syncing) return;
    
    setSyncing(true);
    setSyncStatus('syncing');
    logger.info('Starting sync for all pending items');
    
    const unsynced = pendingSync.filter(item => !item.synced && (item.retryCount || 0) < MAX_RETRY_COUNT);
    
    if (unsynced.length === 0) {
      setSyncing(false);
      setSyncStatus('success');
      return;
    }

    showInfo(
      'Syncing data',
      `Syncing ${unsynced.length} pending changes...`
    );
    
    let successCount = 0;
    let failCount = 0;
    
    for (const item of unsynced) {
      try {
        await syncData(item);
        successCount++;
      } catch (error) {
        failCount++;
      }
      // Small delay between syncs to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const stillPending = pendingSync.filter(item => !item.synced);
    savePendingSync(stillPending);
    
    setSyncing(false);
    
    if (successCount > 0) {
      setSyncStatus('success');
      showSuccess(
        'Sync complete',
        `Successfully synced ${successCount} items${failCount > 0 ? `, ${failCount} failed` : ''}.`
      );
    } else if (failCount > 0) {
      setSyncStatus('error');
    }
    
    logger.info('Sync completed');
  };

  const clearSyncedItems = () => {
    const stillPending = pendingSync.filter(item => !item.synced);
    savePendingSync(stillPending);
  };

  const getSyncStatusMessage = () => {
    const pendingCount = pendingSync.filter(item => !item.synced).length;
    
    if (!isOnline) {
      return pendingCount > 0 ? `${pendingCount} items queued for sync` : 'Offline mode';
    }
    
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return pendingCount > 0 ? `${pendingCount} items pending` : 'All synced';
      case 'error':
        return 'Sync error';
      default:
        return pendingCount > 0 ? `${pendingCount} items to sync` : 'All synced';
    }
  };

  return {
    isOnline,
    pendingSync: pendingSync.filter(item => !item.synced),
    addToQueue,
    syncAll,
    syncing,
    syncStatus,
    clearSyncedItems,
    getSyncStatusMessage
  };
};
