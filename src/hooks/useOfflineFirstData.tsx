/**
 * Offline-first data hook that combines caching and syncing
 * Provides seamless offline/online data access for Ethiopian farmers
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineCache } from './useOfflineCache';
import { useEnhancedOfflineSync } from './useEnhancedOfflineSync';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { STORES } from '@/utils/indexedDB';

interface UseOfflineFirstDataOptions {
  table: 'animals' | 'health_records' | 'milk_production' | 'market_listings';
  autoCache?: boolean;
  cacheOnFetch?: boolean;
}

export const useOfflineFirstData = <T,>({
  table,
  autoCache = true,
  cacheOnFetch = true
}: UseOfflineFirstDataOptions) => {
  const { user } = useAuth();
  const { isOnline, queueAction } = useEnhancedOfflineSync();
  const {
    cacheAnimals,
    cacheHealthRecords,
    cacheMilkProduction,
    cacheMarketListings,
    getCachedAnimals,
    getCachedHealthRecords,
    getCachedMilkProduction,
    getCachedMarketListings,
    isCacheStale
  } = useOfflineCache();

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  /**
   * Get the appropriate cache function
   */
  const getCacheFunction = useCallback(() => {
    switch (table) {
      case 'animals':
        return { cache: cacheAnimals, get: getCachedAnimals, store: STORES.ANIMALS };
      case 'health_records':
        return { cache: cacheHealthRecords, get: getCachedHealthRecords, store: STORES.HEALTH_RECORDS };
      case 'milk_production':
        return { cache: cacheMilkProduction, get: getCachedMilkProduction, store: STORES.MILK_PRODUCTION };
      case 'market_listings':
        return { cache: cacheMarketListings, get: getCachedMarketListings, store: STORES.MARKET_LISTINGS };
      default:
        throw new Error(`Unknown table: ${table}`);
    }
  }, [table, cacheAnimals, cacheHealthRecords, cacheMilkProduction, cacheMarketListings, getCachedAnimals, getCachedHealthRecords, getCachedMilkProduction, getCachedMarketListings]);

  /**
   * Fetch data from server
   */
  const fetchFromServer = useCallback(async (): Promise<T[]> => {
    if (!user) return [];

    const { data: serverData, error: serverError } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (serverError) {
      throw serverError;
    }

    return (serverData || []) as T[];
  }, [user, table]);

  /**
   * Fetch data (offline-first approach)
   */
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { cache, get, store } = getCacheFunction();

      // If offline or cache is fresh, use cached data
      if (!isOnline || (!forceRefresh && !isCacheStale(store))) {
        const cachedData = await get();
        if (cachedData.length > 0) {
          setData(cachedData as T[]);
          setIsFromCache(true);
          logger.debug(`Loaded ${cachedData.length} items from cache for ${table}`);
          setLoading(false);
          return;
        }
      }

      // Try to fetch from server
      if (isOnline) {
        try {
          const serverData = await fetchFromServer();
          setData(serverData);
          setIsFromCache(false);

          // Cache the data if enabled
          if (cacheOnFetch) {
            await cache(serverData);
          }

          logger.debug(`Fetched ${serverData.length} items from server for ${table}`);
        } catch (serverError) {
          // If server fetch fails, fall back to cache
          logger.warn('Server fetch failed, falling back to cache', serverError);
          const cachedData = await get();
          setData(cachedData as T[]);
          setIsFromCache(true);
        }
      } else {
        // Offline: use cache
        const cachedData = await get();
        setData(cachedData as T[]);
        setIsFromCache(true);
      }
    } catch (err) {
      logger.error(`Error fetching data for ${table}`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, table, isOnline, cacheOnFetch, getCacheFunction, fetchFromServer, isCacheStale]);

  /**
   * Create item (offline-first)
   */
  const createItem = useCallback(async (item: Partial<T>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const { store } = getCacheFunction();
    const itemWithUser = { ...item, user_id: user.id };

    if (isOnline) {
      // Try to create on server immediately
      try {
        const { data: newItem, error: createError } = await supabase
          .from(table)
          .insert([itemWithUser])
          .select()
          .single();

        if (createError) throw createError;

        // Update local state
        setData(prev => [newItem as T, ...prev]);
        
        // Update cache
        const { cache } = getCacheFunction();
        await cache([newItem as T, ...data]);

        logger.info(`Created item on server for ${table}`);
      } catch (err) {
        // If server fails, queue for sync
        logger.warn('Server create failed, queuing for sync', err);
        await queueAction('create', store, itemWithUser);
        
        // Optimistically update local state
        const tempItem = { ...itemWithUser, id: `temp-${Date.now()}` } as T;
        setData(prev => [tempItem, ...prev]);
      }
    } else {
      // Offline: queue for sync
      await queueAction('create', store, itemWithUser);
      
      // Optimistically update local state
      const tempItem = { ...itemWithUser, id: `temp-${Date.now()}` } as T;
      setData(prev => [tempItem, ...prev]);
      
      logger.info(`Queued create for ${table}`);
    }
  }, [user, table, isOnline, data, getCacheFunction, queueAction]);

  /**
   * Update item (offline-first)
   */
  const updateItem = useCallback(async (id: string, updates: Partial<T>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const { store } = getCacheFunction();

    if (isOnline) {
      // Try to update on server immediately
      try {
        const { data: updatedItem, error: updateError } = await supabase
          .from(table)
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Update local state
        setData(prev => prev.map(item => 
          (item as any).id === id ? updatedItem as T : item
        ));
        
        // Update cache
        const { cache } = getCacheFunction();
        const updatedData = data.map(item => 
          (item as any).id === id ? updatedItem as T : item
        );
        await cache(updatedData);

        logger.info(`Updated item on server for ${table}`);
      } catch (err) {
        // If server fails, queue for sync
        logger.warn('Server update failed, queuing for sync', err);
        await queueAction('update', store, { id, ...updates });
        
        // Optimistically update local state
        setData(prev => prev.map(item => 
          (item as any).id === id ? { ...item, ...updates } : item
        ));
      }
    } else {
      // Offline: queue for sync
      await queueAction('update', store, { id, ...updates });
      
      // Optimistically update local state
      setData(prev => prev.map(item => 
        (item as any).id === id ? { ...item, ...updates } : item
      ));
      
      logger.info(`Queued update for ${table}`);
    }
  }, [user, table, isOnline, data, getCacheFunction, queueAction]);

  /**
   * Delete item (offline-first)
   */
  const deleteItem = useCallback(async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const { store } = getCacheFunction();

    if (isOnline) {
      // Try to delete on server immediately
      try {
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        // Update local state
        setData(prev => prev.filter(item => (item as any).id !== id));
        
        // Update cache
        const { cache } = getCacheFunction();
        const updatedData = data.filter(item => (item as any).id !== id);
        await cache(updatedData);

        logger.info(`Deleted item on server for ${table}`);
      } catch (err) {
        // If server fails, queue for sync
        logger.warn('Server delete failed, queuing for sync', err);
        await queueAction('delete', store, { id });
        
        // Optimistically update local state
        setData(prev => prev.filter(item => (item as any).id !== id));
      }
    } else {
      // Offline: queue for sync
      await queueAction('delete', store, { id });
      
      // Optimistically update local state
      setData(prev => prev.filter(item => (item as any).id !== id));
      
      logger.info(`Queued delete for ${table}`);
    }
  }, [user, table, isOnline, data, getCacheFunction, queueAction]);

  /**
   * Auto-fetch on mount and when online status changes
   */
  useEffect(() => {
    if (user && autoCache) {
      fetchData();
    }
  }, [user, autoCache, fetchData]);

  /**
   * Refresh when coming back online
   */
  useEffect(() => {
    if (isOnline && user && autoCache) {
      fetchData(true);
    }
  }, [isOnline, user, autoCache, fetchData]);

  return {
    data,
    loading,
    error,
    isFromCache,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    refresh: () => fetchData(true)
  };
};
