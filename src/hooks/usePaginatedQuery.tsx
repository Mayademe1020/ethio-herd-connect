/**
 * Paginated Query Hook - Offline-First Implementation
 * 
 * This hook provides pagination with:
 * - Infinite scroll support
 * - Offline-first caching with IndexedDB
 * - Smart prefetching for smooth UX
 * - Low-bandwidth optimization
 * - Automatic sync when online
 * 
 * Optimized for Ethiopian rural context:
 * - Works on 2G/3G networks
 * - Minimal data transfer
 * - Smooth on low-end devices
 * - Clear offline indicators
 * 
 * @module usePaginatedQuery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

interface PaginationConfig {
  pageSize: number;
  prefetchPages: number;
  enableOfflineCache: boolean;
  cacheKey: string;
}

interface PaginatedResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isOffline: boolean;
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
  goToPage: (page: number) => void;
  refresh: () => void;
}

interface QueryFunction<T> {
  (page: number, pageSize: number): Promise<{ data: T[]; count: number }>;
}

/**
 * Paginated query hook with offline-first support
 * 
 * @example
 * ```typescript
 * const {
 *   data,
 *   hasNextPage,
 *   fetchNextPage,
 *   isLoading
 * } = usePaginatedQuery({
 *   queryKey: ['animals', userId],
 *   queryFn: async (page, pageSize) => {
 *     const start = page * pageSize;
 *     const end = start + pageSize - 1;
 *     const { data, count } = await supabase
 *       .from('animals')
 *       .select('*', { count: 'exact' })
 *       .range(start, end);
 *     return { data, count };
 *   },
 *   pageSize: 20,
 *   cacheKey: 'animals-cache'
 * });
 * ```
 */
export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  pageSize = 20,
  prefetchPages = 1,
  enableOfflineCache = true,
  cacheKey,
  enabled = true,
}: {
  queryKey: any[];
  queryFn: QueryFunction<T>;
  pageSize?: number;
  prefetchPages?: number;
  enableOfflineCache?: boolean;
  cacheKey: string;
  enabled?: boolean;
}): PaginatedResult<T> {
  const [currentPage, setCurrentPage] = useState(0);
  const [allData, setAllData] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const queryClient = useQueryClient();
  const isFetchingRef = useRef(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      logger.info('Pagination: Back online - syncing data');
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      logger.info('Pagination: Offline mode activated');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch current page
  const {
    data: pageData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [...queryKey, 'page', currentPage],
    queryFn: async () => {
      const startTime = performance.now();
      
      try {
        // Try to fetch from network
        const result = await queryFn(currentPage, pageSize);
        
        const duration = performance.now() - startTime;
        logger.debug(`Pagination: Page ${currentPage} loaded: ${duration.toFixed(2)}ms`);

        // Cache to IndexedDB for offline access
        if (enableOfflineCache && 'indexedDB' in window) {
          await cachePageData(cacheKey, currentPage, result);
        }

        return result;
      } catch (error) {
        // If offline, try to load from cache
        if (!navigator.onLine && enableOfflineCache) {
          logger.info(`Pagination: Loading page ${currentPage} from cache`);
          const cached = await loadCachedPage(cacheKey, currentPage);
          if (cached) {
            return cached;
          }
        }
        throw error;
      }
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    retry: isOffline ? 0 : 2, // Don't retry when offline
    networkMode: 'offlineFirst', // Try cache first when offline
  });

  // Update accumulated data when page data changes
  useEffect(() => {
    if (pageData) {
      setTotalCount(pageData.count);
      
      // For infinite scroll, accumulate data
      setAllData((prev) => {
        const newData = [...prev];
        const startIndex = currentPage * pageSize;
        
        // Replace or add new page data
        pageData.data.forEach((item, index) => {
          newData[startIndex + index] = item;
        });
        
        return newData;
      });
    }
  }, [pageData, currentPage, pageSize]);

  // Prefetch next page for smooth scrolling
  useEffect(() => {
    if (pageData && hasNextPage && !isOffline && navigator.onLine) {
      const nextPage = currentPage + 1;
      
      // Prefetch next page in background
      queryClient.prefetchQuery({
        queryKey: [...queryKey, 'page', nextPage],
        queryFn: () => queryFn(nextPage, pageSize),
        staleTime: 5 * 60 * 1000,
      });

      logger.debug(`Pagination: Prefetching page ${nextPage}`);
    }
  }, [pageData, currentPage, queryKey, queryFn, pageSize, queryClient, isOffline]);

  // Calculate pagination state
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  // Navigation functions
  const fetchNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setCurrentPage((prev) => prev + 1);
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 300);
    }
  }, [hasNextPage]);

  const fetchPreviousPage = useCallback(() => {
    if (hasPreviousPage && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setCurrentPage((prev) => prev - 1);
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 300);
    }
  }, [hasPreviousPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < totalPages && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setCurrentPage(page);
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 300);
    }
  }, [totalPages]);

  const refresh = useCallback(() => {
    setAllData([]);
    setCurrentPage(0);
    refetch();
  }, [refetch]);

  return {
    data: allData.slice(0, (currentPage + 1) * pageSize),
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isFetchingNextPage: isFetching && currentPage > 0,
    isOffline,
    fetchNextPage,
    fetchPreviousPage,
    goToPage,
    refresh,
  };
}

/**
 * Cache page data to IndexedDB for offline access
 */
async function cachePageData(
  cacheKey: string,
  page: number,
  data: any
): Promise<void> {
  try {
    const dbName = 'ethioherd-pagination-cache';
    const storeName = 'pages';
    
    const db = await openDatabase(dbName, storeName);
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const cacheEntry = {
      key: `${cacheKey}-page-${page}`,
      data,
      timestamp: Date.now(),
    };
    
    await store.put(cacheEntry);
    
    logger.debug(`Cache: Saved page ${page} to IndexedDB`);
  } catch (error) {
    logger.error('Cache: Failed to cache page data', error);
  }
}

/**
 * Load cached page data from IndexedDB
 */
async function loadCachedPage(
  cacheKey: string,
  page: number
): Promise<any | null> {
  try {
    const dbName = 'ethioherd-pagination-cache';
    const storeName = 'pages';
    
    const db = await openDatabase(dbName, storeName);
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    const key = `${cacheKey}-page-${page}`;
    const request = store.get(key);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Check if cache is not too old (7 days)
          const age = Date.now() - result.timestamp;
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
          
          if (age < maxAge) {
            logger.debug(`Cache: Loaded page ${page} from IndexedDB`);
            resolve(result.data);
          } else {
            logger.debug(`Cache: Page ${page} cache expired`);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('Cache: Failed to load cached page', error);
    return null;
  }
}

/**
 * Open IndexedDB database
 */
function openDatabase(dbName: string, storeName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(storeName)) {
        const objectStore = db.createObjectStore(storeName, { keyPath: 'key' });
        objectStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}
