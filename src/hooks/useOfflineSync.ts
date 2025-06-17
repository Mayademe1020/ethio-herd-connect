
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending data from localStorage
    const stored = localStorage.getItem('bet-gitosa-pending-sync');
    if (stored) {
      setPendingSync(JSON.parse(stored));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (type: string, data: any) => {
    const syncItem: SyncData = {
      id: `${Date.now()}-${Math.random()}`,
      type: type as any,
      data,
      timestamp: Date.now(),
      synced: false
    };

    const newQueue = [...pendingSync, syncItem];
    setPendingSync(newQueue);
    localStorage.setItem('bet-gitosa-pending-sync', JSON.stringify(newQueue));

    // If online, try to sync immediately
    if (isOnline) {
      syncData(syncItem);
    }
  };

  const syncData = async (item: SyncData) => {
    try {
      // Simulate API call - replace with actual Supabase calls
      console.log('Syncing:', item);
      
      // Mark as synced
      const updatedQueue = pendingSync.map(q => 
        q.id === item.id ? { ...q, synced: true } : q
      );
      setPendingSync(updatedQueue);
      localStorage.setItem('bet-gitosa-pending-sync', JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const syncAll = async () => {
    if (!isOnline) return;
    
    const unsynced = pendingSync.filter(item => !item.synced);
    for (const item of unsynced) {
      await syncData(item);
    }
  };

  return {
    isOnline,
    pendingSync: pendingSync.filter(item => !item.synced),
    addToQueue,
    syncAll
  };
};
