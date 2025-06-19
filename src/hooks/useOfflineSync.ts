
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SyncData {
  id: string;
  type: 'animal' | 'health' | 'market' | 'growth';
  data: any;
  timestamp: number;
  synced: boolean;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState<SyncData[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncAll(); // Auto-sync when coming online
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending data from localStorage
    const stored = localStorage.getItem('bet-gitosa-pending-sync');
    if (stored) {
      try {
        setPendingSync(JSON.parse(stored));
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

    // If online, try to sync immediately
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
          // Handle bulk vaccination data structure
          if (item.data.animalIds && Array.isArray(item.data.animalIds)) {
            // This is bulk vaccination data - create individual records
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
            // Single health record
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
        default:
          throw new Error(`Unknown sync type: ${item.type}`);
      }

      if (result.error) {
        throw result.error;
      }

      // Mark as synced
      const updatedQueue = pendingSync.map(q => 
        q.id === item.id ? { ...q, synced: true } : q
      );
      setPendingSync(updatedQueue);
      localStorage.setItem('bet-gitosa-pending-sync', JSON.stringify(updatedQueue));
      
      console.log(`Successfully synced ${item.type}:`, item.id);
    } catch (error) {
      console.error('Sync failed for item:', item, error);
      // Keep in queue for retry
    }
  };

  const syncAll = async () => {
    if (!isOnline || syncing) return;
    
    setSyncing(true);
    console.log('Starting sync for all pending items...');
    
    const unsynced = pendingSync.filter(item => !item.synced);
    
    for (const item of unsynced) {
      await syncData(item);
      // Small delay between syncs to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Clean up synced items
    const stillPending = pendingSync.filter(item => !item.synced);
    setPendingSync(stillPending);
    localStorage.setItem('bet-gitosa-pending-sync', JSON.stringify(stillPending));
    
    setSyncing(false);
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
