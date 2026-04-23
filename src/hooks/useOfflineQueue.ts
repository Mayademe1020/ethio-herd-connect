// src/hooks/useOfflineQueue.ts
// Enhanced offline queue system with automatic retry and conflict resolution

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface QueueItem {
  id: string;
  user_id: string;
  action_type: 'create_animal' | 'update_animal' | 'delete_animal' | 'record_milk' | 'create_listing' | 'update_listing';
  payload: any;
  status: 'pending' | 'processing' | 'synced' | 'failed';
  retry_count: number;
  created_at: string;
  synced_at?: string;
  error_message?: string;
}

export interface OfflineQueueStats {
  pending: number;
  processing: number;
  failed: number;
  synced: number;
  total: number;
}

export const useOfflineQueue = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online/offline status
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

  // Fetch offline queue items
  const { data: queueItems = [], isLoading } = useQuery({
    queryKey: ['offline-queue', user?.id],
    queryFn: async (): Promise<QueueItem[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('offline_queue' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as QueueItem[];
    },
    enabled: !!user,
    refetchInterval: isOnline ? 30000 : false, // Refetch every 30s when online
  });

  // Calculate queue statistics
  const stats: OfflineQueueStats = {
    pending: queueItems.filter(item => item.status === 'pending').length,
    processing: queueItems.filter(item => item.status === 'processing').length,
    failed: queueItems.filter(item => item.status === 'failed').length,
    synced: queueItems.filter(item => item.status === 'synced').length,
    total: queueItems.length,
  };

  // Add item to offline queue
  const addToQueue = useMutation({
    mutationFn: async (item: Omit<QueueItem, 'id' | 'user_id' | 'status' | 'retry_count' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const queueItem = {
        ...item,
        user_id: user.id,
        status: 'pending' as const,
        retry_count: 0,
      };

      const { data, error } = await supabase
        .from('offline_queue' as any)
        .insert(queueItem)
        .select()
        .single();
      if (error) throw error;

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-queue', user?.id] });
    },
  });

  // Process queue items when online
  const processQueue = useMutation({
    mutationFn: async () => {
      if (!isOnline || !user) return;

      const pendingItems = queueItems.filter(item => item.status === 'pending');

      for (const item of pendingItems) {
        try {
          // Update status to processing
          await supabase
            .from('offline_queue' as any)
            .update({
              status: 'processing',
              retry_count: item.retry_count + 1
            })
            .eq('id', item.id);

          // Process the action based on type
          await processQueueItem(item);

          // Mark as synced
          await supabase
            .from('offline_queue' as any)
            .update({
              status: 'synced',
              synced_at: new Date().toISOString(),
              error_message: null
            })
            .eq('id', item.id);

        } catch (error: any) {
          // Mark as failed
          await supabase
            .from('offline_queue' as any)
            .update({
              status: 'failed',
              error_message: error.message,
              retry_count: item.retry_count + 1
            })
            .eq('id', item.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-queue', user?.id] });
      // Also invalidate related data queries
      queryClient.invalidateQueries({ queryKey: ['animals', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['milk-analytics', user?.id] });
    },
  });

  // Process individual queue item
  const processQueueItem = async (item: QueueItem) => {
    switch (item.action_type) {
      case 'create_animal':
        await supabase.from('animals' as any).insert(item.payload);
        break;
      case 'update_animal':
        await supabase
          .from('animals' as any)
          .update(item.payload)
          .eq('id', item.payload.id);
        break;
      case 'delete_animal':
        await supabase
          .from('animals' as any)
          .delete()
          .eq('id', item.payload.id);
        break;
      case 'record_milk':
        await supabase.from('milk_production' as any).insert(item.payload);
        break;
      case 'create_listing':
        await supabase.from('market_listings' as any).insert(item.payload);
        break;
      case 'update_listing':
        await supabase
          .from('market_listings' as any)
          .update(item.payload)
          .eq('id', item.payload.id);
        break;
      default:
        throw new Error(`Unknown action type: ${item.action_type}`);
    }
  };

  // Retry failed items
  const retryFailedItems = useMutation({
    mutationFn: async () => {
      if (!isOnline || !user) return;

      const failedItems = queueItems.filter(item =>
        item.status === 'failed' && item.retry_count < 3
      );

      for (const item of failedItems) {
        await supabase
          .from('offline_queue' as any)
          .update({
            status: 'pending',
            error_message: null
          })
          .eq('id', item.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-queue', user?.id] });
    },
  });

  // Clear old synced items
  const clearSyncedItems = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      await supabase
        .from('offline_queue' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('status', 'synced')
        .lt('synced_at', sevenDaysAgo.toISOString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-queue', user?.id] });
    },
  });

  // Auto-process queue when coming online
  useEffect(() => {
    if (isOnline && user && queueItems.some(item => item.status === 'pending')) {
      processQueue.mutate();
    }
  }, [isOnline, user, queueItems, processQueue]);

  // Helper functions for adding common actions
  const addAnimalToQueue = useCallback((animalData: any) => {
    addToQueue.mutate({
      action_type: 'create_animal',
      payload: animalData,
    });
  }, [addToQueue]);

  const addMilkRecordToQueue = useCallback((milkData: any) => {
    addToQueue.mutate({
      action_type: 'record_milk',
      payload: milkData,
    });
  }, [addToQueue]);

  const addListingToQueue = useCallback((listingData: any) => {
    addToQueue.mutate({
      action_type: 'create_listing',
      payload: listingData,
    });
  }, [addToQueue]);

  return {
    // Data
    queueItems,
    stats,
    isOnline,
    isLoading,

    // Actions
    addToQueue: addToQueue.mutate,
    processQueue: processQueue.mutate,
    retryFailedItems: retryFailedItems.mutate,
    clearSyncedItems: clearSyncedItems.mutate,

    // Helper functions
    addAnimalToQueue,
    addMilkRecordToQueue,
    addListingToQueue,

    // Status
    isProcessing: processQueue.isPending,
    hasFailedItems: stats.failed > 0,
    hasPendingItems: stats.pending > 0,
  };
};