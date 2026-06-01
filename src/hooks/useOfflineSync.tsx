
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sanitizeInput } from '@/utils/animalIdGenerator';
import { useTranslations } from '@/hooks/useTranslations';
import { compressData, decompressData } from '@/utils/dataCompression';
import { logger } from '@/utils/logger';

// Merged from both useOfflineSync implementations
interface SyncData {
  id: string;
  type: 'animal' | 'health' | 'market' | 'growth' | 'poultry_group';
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
  retryCount?: number;
  conflictResolution?: 'local' | 'remote' | 'manual';
  serverVersion?: unknown;
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
  const { t } = useTranslations();
  const pendingSyncRef = useRef(pendingSync);
  const isOnlineRef = useRef(isOnline);
  pendingSyncRef.current = pendingSync;
  isOnlineRef.current = isOnline;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.info(t('Starting to sync pending changes...'));
      setSyncStatus('syncing');
      syncAll();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('idle');
      toast.info(t('Changes will be saved locally and synced when online.'));
    };

    // Check connection stability (HEAD + timeout). Ignore AbortError to avoid noisy logs.
    const checkConnectionStability = async () => {
      if (!navigator.onLine) return;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      try {
        await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store', signal: controller.signal });
        if (!isOnline) {
          setIsOnline(true);
          toast.info(t('Starting to sync pending changes...'));
          syncAll();
        }
      } catch (err: unknown) {
        // Silently ignore aborts; only warn on real connectivity issues
        const errorName = (err as { name?: string })?.name;
        if (errorName === 'AbortError') {
          // Ignore aborted pings due to navigation
        } else if (isOnline) {
          setIsOnline(false);
          toast.warning(t('Your connection appears unstable. Data will be saved locally.'));
        }
      } finally {
        clearTimeout(timeout);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadPendingSync();
    
    // Set up periodic sync
    const syncInterval = setInterval(() => {
      if (isOnlineRef.current && pendingSyncRef.current.filter(item => !item.synced).length > 0) {
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
  }, []);

  const loadPendingSync = useCallback(() => {
    const stored = localStorage.getItem(SYNC_STORAGE_KEY);
    if (stored) {
      try {
        // Try to decompress data if it's compressed
        let parsedData: unknown;
        try {
          parsedData = decompressData(stored);
        } catch (e) {
          // Fallback to regular JSON parsing for backward compatibility
          parsedData = JSON.parse(stored);
        }

        // Validate data structure
        if (Array.isArray(parsedData)) {
          // Filter out any corrupted entries
          const validData = (parsedData as unknown[]).filter((item): item is SyncData =>
            !!item &&
            typeof (item as SyncData).id === 'string' &&
            typeof (item as SyncData).type === 'string' &&
            typeof (item as SyncData).timestamp === 'number' &&
            !!((item as SyncData).data as unknown)
          );

          setPendingSync(validData);

          if (validData.length > 0 && isOnline) {
            const pendingCount = validData.filter(item => !item.synced).length;
            if (pendingCount > 0) {
              toast.info(
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
        toast.error(
          t('There was an issue with your saved data. Please contact support if you notice missing information.')
        );
      }
    }
  }, [isOnline, t]);

  const savePendingSync = useCallback((data: SyncData[]) => {
    try {
      // Compress data before saving to reduce storage usage
      const compressedData = compressData(data);
      localStorage.setItem(SYNC_STORAGE_KEY, compressedData);
      setPendingSync(data);
      
      // Update storage usage metrics
      const storageUsed = estimateStorageUsage();
      if (storageUsed > 80) { // If using more than 80% of available storage
        toast.warning(
          t('Your device storage is {{percent}}% full. Consider clearing old data.', { percent: storageUsed.toFixed(0) })
        );
      }
    } catch (error) {
      logger.error('Error saving pending sync data', error);
      toast.error(
        t('Failed to save data locally. Your device may be out of storage.')
      );
    }
  }, [t]);
  
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

  const addToQueue = (type: SyncData['type'], data: Record<string, unknown>) => {
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

  const sanitizeDataForSync = (data: Record<string, unknown>): Record<string, unknown> => {
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
  };

  const syncData = async (item: SyncData) => {
    try {
      logger.debug('Syncing item', { item });
      const data = item.data;

      let result;
      switch (item.type) {
        case 'animal':
          result = await supabase
            .from('animals')
            .insert([data]);
          break;
        case 'health':
          if (Array.isArray(data.animalIds)) {
            const healthRecords = (data.animalIds as string[]).map((animalId) => ({
              animal_id: animalId,
              user_id: data.user_id as string,
              record_type: 'vaccination',
              medicine_name: data.medicine as string,
              administered_date: data.date as string,
              notes: data.notes as string
            }));

            result = await supabase
              .from('health_records')
              .insert(healthRecords);
          } else {
            result = await supabase
              .from('health_records')
              .insert([data]);
          }
          break;
        case 'market':
          result = await supabase
            .from('market_listings')
            .insert([data]);
          break;
        case 'growth':
          result = await supabase
            .from('growth_records')
            .insert([data]);
          break;
        case 'poultry_group':
          result = await supabase
            .from('poultry_groups')
            .insert([data]);
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
        toast.error(
          `Failed to sync ${item.type} data after ${MAX_RETRY_COUNT} attempts.`
        );
      } else {
        toast.error(
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

    toast.info(
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
      toast.success(
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
