
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/useToastNotifications';

interface SyncData {
  id: string;
  type: 'animal' | 'health' | 'market' | 'growth' | 'poultry_group';
  data: any;
  timestamp: number;
  synced: boolean;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState<SyncData[]>([]);
  const [syncing, setSyncing] = useState(false);
  const { showSuccess, showError, showInfo } = useToastNotifications();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showInfo('Back online', 'Starting to sync pending changes...');
      syncAll();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      showInfo('Offline mode', 'Changes will be saved locally and synced when online.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const stored = localStorage.getItem('bet-gitosa-pending-sync');
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
        localStorage.removeItem('bet-gitosa-pending-sync');
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (type: SyncData['type'], data: any) => {
    const syncItem: SyncData = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    const newQueue = [...pendingSync, syncItem];
    setPendingSync(newQueue);
    localStorage.setItem('bet-gitosa-pending-sync', JSON.stringify(newQueue));

    console.log(`Added to offline queue: ${type}`, syncItem);

    if (isOnline && !syncing) {
      syncData(syncItem);
    }
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
      setPendingSync(updatedQueue);
      localStorage.setItem('bet-gitosa-pending-sync', JSON.stringify(updatedQueue));
      
      console.log(`Successfully synced ${item.type}:`, item.id);
    } catch (error) {
      console.error('Sync failed for item:', item, error);
      showError(
        'Sync failed',
        `Failed to sync ${item.type} data. Will retry later.`
      );
    }
  };

  const syncAll = async () => {
    if (!isOnline || syncing) return;
    
    setSyncing(true);
    console.log('Starting sync for all pending items...');
    
    const unsynced = pendingSync.filter(item => !item.synced);
    
    if (unsynced.length === 0) {
      setSyncing(false);
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
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const stillPending = pendingSync.filter(item => !item.synced);
    setPendingSync(stillPending);
    localStorage.setItem('bet-gitosa-pending-sync', JSON.stringify(stillPending));
    
    setSyncing(false);
    
    if (successCount > 0) {
      showSuccess(
        'Sync complete',
        `Successfully synced ${successCount} items${failCount > 0 ? `, ${failCount} failed` : ''}.`
      );
    }
    
    console.log('Sync completed');
  };

  return {
    isOnline,
    pendingSync: pendingSync.filter(item => !item.synced),
    addToQueue,
    syncAll,
    syncing
  };
};
