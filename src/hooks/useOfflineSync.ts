
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { sanitizeInput } from '@/utils/animalIdGenerator';

interface SyncData {
  id: string;
  type: 'animal' | 'health' | 'market' | 'growth' | 'poultry_group';
  data: any;
  timestamp: number;
  synced: boolean;
  retryCount?: number;
}

const MAX_RETRY_COUNT = 3;
const SYNC_STORAGE_KEY = 'bet-gitosa-pending-sync';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState<SyncData[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const { showSuccess, showError, showInfo } = useToastNotifications();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showInfo('Back online', 'Starting to sync pending changes...');
      setSyncStatus('syncing');
      syncAll();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('idle');
      showInfo('Offline mode', 'Changes will be saved locally and synced when online.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadPendingSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingSync = () => {
    const stored = localStorage.getItem(SYNC_STORAGE_KEY);
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        setPendingSync(parsedData);
        
        if (parsedData.length > 0 && isOnline) {
          showInfo(
            `${parsedData.length} pending changes`,
            'Will sync automatically when online.'
          );
        }
      } catch (error) {
        console.error('Error parsing stored sync data:', error);
        localStorage.removeItem(SYNC_STORAGE_KEY);
      }
    }
  };

  const savePendingSync = (data: SyncData[]) => {
    try {
      localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(data));
      setPendingSync(data);
    } catch (error) {
      console.error('Error saving pending sync data:', error);
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

    console.log(`Added to offline queue: ${type}`, syncItem);

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
      console.log('Syncing item:', item);
      
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
      
      console.log(`Successfully synced ${item.type}:`, item.id);
    } catch (error) {
      console.error('Sync failed for item:', item, error);
      
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
    console.log('Starting sync for all pending items...');
    
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
    
    console.log('Sync completed');
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
