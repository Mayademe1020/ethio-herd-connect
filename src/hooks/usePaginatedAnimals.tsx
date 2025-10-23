/**
 * Paginated Animals Hook
 * 
 * Provides paginated animal data with:
 * - Infinite scroll support
 * - Offline-first caching
 * - Filter and search support
 * - Smart prefetching
 * - Low-bandwidth optimization
 * 
 * @module usePaginatedAnimals
 */

import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePaginatedQuery } from './usePaginatedQuery';
import { buildAnimalQuery } from '@/lib/queryBuilders';
import { AnimalData } from '@/types';
import { logger } from '@/utils/logger';

interface UsePaginatedAnimalsOptions {
  pageSize?: number;
  filters?: {
    type?: string;
    healthStatus?: string;
    searchQuery?: string;
    location?: string;
    isVetVerified?: boolean;
    ageMin?: number;
    ageMax?: number;
    weightMin?: number;
    weightMax?: number;
  };
  enabled?: boolean;
}

/**
 * Hook for paginated animal data with offline support
 * 
 * @example
 * ```typescript
 * const {
 *   data: animals,
 *   hasNextPage,
 *   fetchNextPage,
 *   isLoading,
 *   isOffline
 * } = usePaginatedAnimals({
 *   pageSize: 20,
 *   filters: {
 *     type: 'cattle',
 *     healthStatus: 'healthy'
 *   }
 * });
 * ```
 */
export const usePaginatedAnimals = ({
  pageSize = 20,
  filters = {},
  enabled = true,
}: UsePaginatedAnimalsOptions = {}) => {
  const { user } = useAuth();

  // Create query function with filters
  const queryFn = useMemo(
    () => async (page: number, size: number) => {
      if (!user) {
        return { data: [], count: 0 };
      }

      const startTime = performance.now();
      const start = page * size;
      const end = start + size - 1;

      try {
        // Build base query - start fresh to get count
        let query = supabase
          .from('animals')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Apply filters
        if (filters.type) {
          query = query.eq('type', filters.type);
        }

        if (filters.healthStatus) {
          query = query.eq('health_status', filters.healthStatus);
        }

        if (filters.searchQuery) {
          // Search in name field (trigram index will make this fast)
          query = query.ilike('name', `%${filters.searchQuery}%`);
        }

        // Advanced filters
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }

        if (filters.isVetVerified !== undefined) {
          query = query.eq('is_vet_verified', filters.isVetVerified);
        }

        if (filters.ageMin !== undefined) {
          query = query.gte('age', filters.ageMin);
        }

        if (filters.ageMax !== undefined) {
          query = query.lte('age', filters.ageMax);
        }

        if (filters.weightMin !== undefined) {
          query = query.gte('weight', filters.weightMin);
        }

        if (filters.weightMax !== undefined) {
          query = query.lte('weight', filters.weightMax);
        }

        // Execute query with pagination
        const { data, error, count } = await query.range(start, end);

        if (error) throw error;

        const duration = performance.now() - startTime;
        logger.debug(
          `PaginatedAnimals: Page ${page} loaded: ${duration.toFixed(2)}ms, ` +
          `${data?.length || 0} items, total: ${count || 0}`
        );

        return {
          data: (data || []) as AnimalData[],
          count: count || 0,
        };
      } catch (error) {
        logger.error('PaginatedAnimals: Query failed', error);
        throw error;
      }
    },
    [user, filters.type, filters.healthStatus, filters.searchQuery, filters.location, 
     filters.isVetVerified, filters.ageMin, filters.ageMax, filters.weightMin, filters.weightMax]
  );

  // Use paginated query hook
  const result = usePaginatedQuery<AnimalData>({
    queryKey: ['animals-paginated', user?.id, filters],
    queryFn,
    pageSize,
    prefetchPages: 1,
    enableOfflineCache: true,
    cacheKey: `animals-${user?.id}`,
    enabled: enabled && !!user,
  });

  return {
    ...result,
    // Add convenience properties
    animals: result.data,
    isEmpty: !result.isLoading && result.data.length === 0,
  };
};

/**
 * Hook for paginated animal data by type
 * Convenience wrapper for common use case
 */
export const usePaginatedAnimalsByType = (
  type: string,
  options: Omit<UsePaginatedAnimalsOptions, 'filters'> = {}
) => {
  return usePaginatedAnimals({
    ...options,
    filters: { type },
  });
};

/**
 * Hook for paginated animals by health status
 * Convenience wrapper for health filtering
 */
export const usePaginatedAnimalsByHealth = (
  healthStatus: string,
  options: Omit<UsePaginatedAnimalsOptions, 'filters'> = {}
) => {
  return usePaginatedAnimals({
    ...options,
    filters: { healthStatus },
  });
};
