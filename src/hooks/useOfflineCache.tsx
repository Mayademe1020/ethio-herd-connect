/**
 * Hook for managing offline data caching with IndexedDB
 * Optimized for Ethiopian farmers with limited connectivity
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  cacheData,
  getCachedData,
  clearCachedData,
  STORES,
  StoreName,
  getDBSize
} from '@/utils/indexedDB';
import { logger } from '@/utils/logger';
import { useToastNotifications } from './useToastNotifications';
import { useTranslations } from './useTranslations';

interface CacheStatus {
  isInitialized: boolean;
  lastCacheTime: Record<StoreName, number>;
  cacheSize: number;
}

export const useOfflineCache = () => {
  const { user } = useAuth();
  const { showInfo, showError } = useToastNotifications();
  const { t } = useTranslations();
  
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    isInitialized: false,
    lastCacheTime: {} as Record<StoreName, number>,
    cacheSize: 0
  });

  /**
   * Cache animals data
   */
  const cacheAnimals = useCallback(async (animals: any[]) => {
    if (!user) return;

    try {
      await cacheData(STORES.ANIMALS, animals, user.id);
      setCacheStatus(prev => ({
        ...prev,
        lastCacheTime: { ...prev.lastCacheTime, [STORES.ANIMALS]: Date.now() }
      }));
      logger.debug(`Cached ${animals.length} animals`);
    } catch (error) {
      logger.error('Failed to cache animals', error);
      showError(
        t('Cache error'),
        t('Failed to save animals for offline use')
      );
    }
  }, [user, showError, t]);

  /**
   * Cache health records data
   */
  const cacheHealthRecords = useCallback(async (records: any[]) => {
    if (!user) return;

    try {
      await cacheData(STORES.HEALTH_RECORDS, records, user.id);
      setCacheStatus(prev => ({
        ...prev,
        lastCacheTime: { ...prev.lastCacheTime, [STORES.HEALTH_RECORDS]: Date.now() }
      }));
      logger.debug(`Cached ${records.length} health records`);
    } catch (error) {
      logger.error('Failed to cache health records', error);
      showError(
        t('Cache error'),
        t('Failed to save health records for offline use')
      );
    }
  }, [user, showError, t]);

  /**
   * Cache milk production data
   */
  const cacheMilkProduction = useCallback(async (records: any[]) => {
    if (!user) return;

    try {
      await cacheData(STORES.MILK_PRODUCTION, records, user.id);
      setCacheStatus(prev => ({
        ...prev,
        lastCacheTime: { ...prev.lastCacheTime, [STORES.MILK_PRODUCTION]: Date.now() }
      }));
      logger.debug(`Cached ${records.length} milk production records`);
    } catch (error) {
      logger.error('Failed to cache milk production', error);
      showError(
        t('Cache error'),
        t('Failed to save milk production for offline use')
      );
    }
  }, [user, showError, t]);

  /**
   * Cache marketplace listings (read-only)
   */
  const cacheMarketListings = useCallback(async (listings: any[]) => {
    if (!user) return;

    try {
      await cacheData(STORES.MARKET_LISTINGS, listings, user.id);
      setCacheStatus(prev => ({
        ...prev,
        lastCacheTime: { ...prev.lastCacheTime, [STORES.MARKET_LISTINGS]: Date.now() }
      }));
      logger.debug(`Cached ${listings.length} market listings`);
    } catch (error) {
      logger.error('Failed to cache market listings', error);
      showError(
        t('Cache error'),
        t('Failed to save marketplace for offline use')
      );
    }
  }, [user, showError, t]);

  /**
   * Get cached animals
   */
  const getCachedAnimals = useCallback(async () => {
    if (!user) return [];

    try {
      const animals = await getCachedData(STORES.ANIMALS, user.id);
      logger.debug(`Retrieved ${animals.length} cached animals`);
      return animals;
    } catch (error) {
      logger.error('Failed to get cached animals', error);
      return [];
    }
  }, [user]);

  /**
   * Get cached health records
   */
  const getCachedHealthRecords = useCallback(async () => {
    if (!user) return [];

    try {
      const records = await getCachedData(STORES.HEALTH_RECORDS, user.id);
      logger.debug(`Retrieved ${records.length} cached health records`);
      return records;
    } catch (error) {
      logger.error('Failed to get cached health records', error);
      return [];
    }
  }, [user]);

  /**
   * Get cached milk production
   */
  const getCachedMilkProduction = useCallback(async () => {
    if (!user) return [];

    try {
      const records = await getCachedData(STORES.MILK_PRODUCTION, user.id);
      logger.debug(`Retrieved ${records.length} cached milk production records`);
      return records;
    } catch (error) {
      logger.error('Failed to get cached milk production', error);
      return [];
    }
  }, [user]);

  /**
   * Get cached market listings
   */
  const getCachedMarketListings = useCallback(async () => {
    if (!user) return [];

    try {
      const listings = await getCachedData(STORES.MARKET_LISTINGS, user.id);
      logger.debug(`Retrieved ${listings.length} cached market listings`);
      return listings;
    } catch (error) {
      logger.error('Failed to get cached market listings', error);
      return [];
    }
  }, [user]);

  /**
   * Clear all cached data
   */
  const clearAllCache = useCallback(async () => {
    if (!user) return;

    try {
      await clearCachedData(STORES.ANIMALS, user.id);
      await clearCachedData(STORES.HEALTH_RECORDS, user.id);
      await clearCachedData(STORES.MILK_PRODUCTION, user.id);
      await clearCachedData(STORES.MARKET_LISTINGS, user.id);
      
      setCacheStatus({
        isInitialized: true,
        lastCacheTime: {} as Record<StoreName, number>,
        cacheSize: 0
      });

      showInfo(
        t('Cache cleared'),
        t('All offline data has been cleared')
      );
      
      logger.info('Cleared all cached data');
    } catch (error) {
      logger.error('Failed to clear cache', error);
      showError(
        t('Clear error'),
        t('Failed to clear offline data')
      );
    }
  }, [user, showInfo, showError, t]);

  /**
   * Update cache size
   */
  const updateCacheSize = useCallback(async () => {
    try {
      const size = await getDBSize();
      setCacheStatus(prev => ({ ...prev, cacheSize: size }));
    } catch (error) {
      logger.error('Failed to get cache size', error);
    }
  }, []);

  /**
   * Initialize cache on mount
   */
  useEffect(() => {
    if (user) {
      setCacheStatus(prev => ({ ...prev, isInitialized: true }));
      updateCacheSize();
    }
  }, [user, updateCacheSize]);

  /**
   * Get cache age for a store
   */
  const getCacheAge = useCallback((storeName: StoreName): number | null => {
    const lastCacheTime = cacheStatus.lastCacheTime[storeName];
    if (!lastCacheTime) return null;
    return Date.now() - lastCacheTime;
  }, [cacheStatus.lastCacheTime]);

  /**
   * Check if cache is stale (older than 1 hour)
   */
  const isCacheStale = useCallback((storeName: StoreName): boolean => {
    const age = getCacheAge(storeName);
    if (age === null) return true;
    return age > 60 * 60 * 1000; // 1 hour
  }, [getCacheAge]);

  return {
    // Cache operations
    cacheAnimals,
    cacheHealthRecords,
    cacheMilkProduction,
    cacheMarketListings,
    
    // Get cached data
    getCachedAnimals,
    getCachedHealthRecords,
    getCachedMilkProduction,
    getCachedMarketListings,
    
    // Cache management
    clearAllCache,
    updateCacheSize,
    
    // Cache status
    cacheStatus,
    getCacheAge,
    isCacheStale
  };
};
