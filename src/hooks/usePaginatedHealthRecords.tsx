/**
 * Paginated Health Records Hook
 * 
 * Provides paginated health record data with:
 * - Infinite scroll support
 * - Offline-first caching
 * - Filter by animal, record type, severity
 * - Smart prefetching
 * - Low-bandwidth optimization
 * 
 * Use Cases:
 * - Health history page (all records)
 * - Animal-specific health records
 * - Vaccination schedules
 * - Illness tracking
 * 
 * @module usePaginatedHealthRecords
 */

import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePaginatedQuery } from './usePaginatedQuery';
import { buildHealthRecordQuery, HEALTH_RECORD_FIELDS } from '@/lib/queryBuilders';
import { logger } from '@/utils/logger';

interface HealthRecord {
  id: string;
  animal_id: string;
  user_id: string;
  record_type: string;
  administered_date: string;
  medicine_name?: string;
  severity?: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
}

interface UsePaginatedHealthRecordsOptions {
  pageSize?: number;
  filters?: {
    animalId?: string;
    recordType?: 'vaccination' | 'treatment' | 'checkup' | 'illness';
    severity?: 'mild' | 'moderate' | 'severe' | 'critical';
    dateRange?: {
      start: string;
      end: string;
    };
  };
  enabled?: boolean;
}

/**
 * Hook for paginated health records with offline support
 * 
 * @example
 * ```typescript
 * // All health records
 * const { data: records, hasNextPage, fetchNextPage } = usePaginatedHealthRecords({
 *   pageSize: 20
 * });
 * 
 * // Animal-specific records
 * const { data: records } = usePaginatedHealthRecords({
 *   filters: { animalId: 'animal-123' }
 * });
 * 
 * // Vaccination records only
 * const { data: vaccinations } = usePaginatedHealthRecords({
 *   filters: { recordType: 'vaccination' }
 * });
 * 
 * // Critical health issues
 * const { data: critical } = usePaginatedHealthRecords({
 *   filters: { severity: 'critical' }
 * });
 * ```
 */
export const usePaginatedHealthRecords = ({
  pageSize = 20,
  filters = {},
  enabled = true,
}: UsePaginatedHealthRecordsOptions = {}) => {
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
        // Build base query with optimized field selection
        let query = buildHealthRecordQuery(supabase, user.id, 'list')
          .order('administered_date', { ascending: false });

        // Apply filters
        if (filters.animalId) {
          query = query.eq('animal_id', filters.animalId);
        }

        if (filters.recordType) {
          query = query.eq('record_type', filters.recordType);
        }

        if (filters.severity) {
          query = query.eq('severity', filters.severity);
        }

        if (filters.dateRange) {
          query = query
            .gte('administered_date', filters.dateRange.start)
            .lte('administered_date', filters.dateRange.end);
        }

        // Execute query with pagination and count
        const { data, error, count } = await query
          .range(start, end)
          .select('*', { count: 'exact' });

        if (error) throw error;

        const duration = performance.now() - startTime;
        logger.debug(
          `PaginatedHealthRecords: Page ${page} loaded: ${duration.toFixed(2)}ms, ` +
          `${data?.length || 0} items, total: ${count || 0}`
        );

        return {
          data: (data || []) as HealthRecord[],
          count: count || 0,
        };
      } catch (error) {
        logger.error('PaginatedHealthRecords: Query failed', error);
        throw error;
      }
    },
    [user, filters.animalId, filters.recordType, filters.severity, filters.dateRange]
  );

  // Use paginated query hook
  const result = usePaginatedQuery<HealthRecord>({
    queryKey: ['health-records-paginated', user?.id, filters],
    queryFn,
    pageSize,
    prefetchPages: 1,
    enableOfflineCache: true,
    cacheKey: `health-records-${user?.id}`,
    enabled: enabled && !!user,
  });

  return {
    ...result,
    // Add convenience properties
    healthRecords: result.data,
    isEmpty: !result.isLoading && result.data.length === 0,
  };
};

/**
 * Hook for paginated health records by animal
 * Convenience wrapper for animal-specific health history
 */
export const usePaginatedHealthRecordsByAnimal = (
  animalId: string,
  options: Omit<UsePaginatedHealthRecordsOptions, 'filters'> = {}
) => {
  return usePaginatedHealthRecords({
    ...options,
    filters: { animalId },
  });
};

/**
 * Hook for paginated vaccination records
 * Convenience wrapper for vaccination history
 */
export const usePaginatedVaccinations = (
  options: Omit<UsePaginatedHealthRecordsOptions, 'filters'> = {}
) => {
  return usePaginatedHealthRecords({
    ...options,
    filters: { recordType: 'vaccination' },
  });
};

/**
 * Hook for paginated critical health issues
 * Convenience wrapper for urgent health monitoring
 */
export const usePaginatedCriticalHealthIssues = (
  options: Omit<UsePaginatedHealthRecordsOptions, 'filters'> = {}
) => {
  return usePaginatedHealthRecords({
    ...options,
    filters: { severity: 'critical' },
  });
};

