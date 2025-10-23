/**
 * Paginated Milk Production Hook
 * 
 * Provides paginated milk production data with:
 * - Infinite scroll support
 * - Offline-first caching
 * - Filter by animal, date range, quality
 * - Smart prefetching
 * - Low-bandwidth optimization
 * - Analytics-ready data
 * 
 * Use Cases:
 * - Milk production history
 * - Animal-specific production tracking
 * - Quality analysis
 * - Production trends and charts
 * - Monthly/yearly reports
 * 
 * @module usePaginatedMilkProduction
 */

import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePaginatedQuery } from './usePaginatedQuery';
import { buildMilkProductionQuery, MILK_PRODUCTION_FIELDS } from '@/lib/queryBuilders';
import { logger } from '@/utils/logger';

interface MilkProductionRecord {
  id: string;
  animal_id: string;
  user_id: string;
  amount: number;
  production_date: string;
  quality_grade?: string;
  notes?: string;
  created_at: string;
}

interface UsePaginatedMilkProductionOptions {
  pageSize?: number;
  filters?: {
    animalId?: string;
    qualityGrade?: 'A' | 'B' | 'C';
    dateRange?: {
      start: string;
      end: string;
    };
    minAmount?: number;
    maxAmount?: number;
  };
  sortBy?: 'date' | 'amount' | 'quality';
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
}

/**
 * Hook for paginated milk production records with offline support
 * 
 * @example
 * ```typescript
 * // All production records
 * const { data: records, hasNextPage, fetchNextPage } = usePaginatedMilkProduction({
 *   pageSize: 30
 * });
 * 
 * // Animal-specific production
 * const { data: records } = usePaginatedMilkProduction({
 *   filters: { animalId: 'animal-123' }
 * });
 * 
 * // This month's production
 * const { data: thisMonth } = usePaginatedMilkProduction({
 *   filters: {
 *     dateRange: {
 *       start: '2025-01-01',
 *       end: '2025-01-31'
 *     }
 *   }
 * });
 * 
 * // High-quality production only
 * const { data: gradeA } = usePaginatedMilkProduction({
 *   filters: { qualityGrade: 'A' }
 * });
 * 
 * // Sort by amount (highest first)
 * const { data: topProducers } = usePaginatedMilkProduction({
 *   sortBy: 'amount',
 *   sortOrder: 'desc'
 * });
 * ```
 */
export const usePaginatedMilkProduction = (options?: any) => {
  const { user } = useAuth();

  // Create query function with filters and sorting
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
        let query = buildMilkProductionQuery(supabase, user.id, 'list');

        // Apply sorting
        if (sortBy === 'date') {
          query = query.order('production_date', { ascending: sortOrder === 'asc' });
        } else if (sortBy === 'amount') {
          query = query.order('amount', { ascending: sortOrder === 'asc' });
        } else if (sortBy === 'quality') {
          query = query.order('quality_grade', { ascending: sortOrder === 'asc' });
        }

        // Apply filters
        if (filters.animalId) {
          query = query.eq('animal_id', filters.animalId);
        }

        if (filters.qualityGrade) {
          query = query.eq('quality_grade', filters.qualityGrade);
        }

        if (filters.dateRange) {
          query = query
            .gte('production_date', filters.dateRange.start)
            .lte('production_date', filters.dateRange.end);
        }

        if (filters.minAmount !== undefined) {
          query = query.gte('amount', filters.minAmount);
        }

        if (filters.maxAmount !== undefined) {
          query = query.lte('amount', filters.maxAmount);
        }

        // Execute query with pagination and count
        const { data, error, count } = await query
          .range(start, end)
          .select('*', { count: 'exact' });

        if (error) throw error;

        const duration = performance.now() - startTime;
        logger.debug(
          `PaginatedMilkProduction: Page ${page} loaded: ${duration.toFixed(2)}ms, ` +
          `${data?.length || 0} items, total: ${count || 0}`
        );

        return {
          data: (data || []) as MilkProductionRecord[],
          count: count || 0,
        };
      } catch (error) {
        logger.error('PaginatedMilkProduction: Query failed', error);
        throw error;
      }
    },
    [user, filters, sortBy, sortOrder]
  );

  // Use paginated query hook
  const result = usePaginatedQuery<MilkProductionRecord>({
    queryKey: ['milk-production-paginated', user?.id, filters, sortBy, sortOrder],
    queryFn,
    pageSize,
    prefetchPages: 1,
    enableOfflineCache: true,
    cacheKey: `milk-production-${user?.id}`,
    enabled: enabled && !!user,
  });

  // Calculate summary statistics from loaded data
  // OPTIMIZED: Progressive disclosure - show key metrics first, detailed stats on demand
  const statistics = useMemo(() => {
    if (result.data.length === 0) {
      return {
        // Primary metrics (always visible)
        totalAmount: 0,
        trendDirection: 'stable' as 'up' | 'down' | 'stable',
        // Secondary metrics (hidden by default, shown on "View Details")
        averageAmount: 0,
        highestAmount: 0,
        lowestAmount: 0,
        recordCount: 0,
        weeklyAverage: 0,
        monthlyTotal: 0,
      };
    }

    const amounts = result.data.map(r => r.amount);
    const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);

    const sortedRecords = [...result.data].sort(
      (a, b) => new Date(b.production_date).getTime() - new Date(a.production_date).getTime()
    );
    const recentWeek = sortedRecords.slice(0, 7);
    const previousWeek = sortedRecords.slice(7, 14);

    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    if (recentWeek.length > 0 && previousWeek.length > 0) {
      const recentAvg = recentWeek.reduce((sum, r) => sum + r.amount, 0) / recentWeek.length;
      const previousAvg = previousWeek.reduce((sum, r) => sum + r.amount, 0) / previousWeek.length;
      const change = ((recentAvg - previousAvg) / previousAvg) * 100;
      if (change > 5) trendDirection = 'up';
      else if (change < -5) trendDirection = 'down';
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyRecords = result.data.filter(r => new Date(r.production_date) >= weekAgo);
    const monthlyRecords = result.data.filter(r => new Date(r.production_date) >= monthAgo);

    return {
      // Primary metrics
      totalAmount: Math.round(totalAmount * 100) / 100,
      trendDirection,
      // Secondary metrics
      averageAmount: Math.round((totalAmount / amounts.length) * 100) / 100,
      highestAmount: Math.max(...amounts),
      lowestAmount: Math.min(...amounts),
      recordCount: result.data.length,
      weeklyAverage:
        weeklyRecords.length > 0
          ? Math.round(
              (weeklyRecords.reduce((sum, r) => sum + r.amount, 0) / weeklyRecords.length) * 100
            ) / 100
          : 0,
      monthlyTotal: Math.round(monthlyRecords.reduce((sum, r) => sum + r.amount, 0) * 100) / 100,
    };
  }, [result.data]);

  return {
    ...result,
    // Add convenience properties
    milkRecords: result.data,
    isEmpty: !result.isLoading && result.data.length === 0,
    statistics,
  };
};

/**
 * Hook for paginated milk production by animal
 * Convenience wrapper for animal-specific production tracking
 */
export const usePaginatedMilkProductionByAnimal = (
  animalId: string,
  options: Omit<UsePaginatedMilkProductionOptions, 'filters'> = {}
) => {
  return usePaginatedMilkProduction({
    ...options,
    filters: { animalId },
  });
};

/**
 * Hook for paginated milk production by date range
 * Convenience wrapper for time-based analysis
 */
export const usePaginatedMilkProductionByDateRange = (
  startDate: string,
  endDate: string,
  options: Omit<UsePaginatedMilkProductionOptions, 'filters'> = {}
) => {
  return usePaginatedMilkProduction({
    ...options,
    filters: {
      dateRange: {
        start: startDate,
        end: endDate,
      },
    },
  });
};

/**
 * Hook for this month's milk production
 * Convenience wrapper for current month tracking
 */
export const usePaginatedMilkProductionThisMonth = (
  options: Omit<UsePaginatedMilkProductionOptions, 'filters'> = {}
) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return usePaginatedMilkProduction({
    ...options,
    filters: {
      dateRange: {
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0],
      },
    },
  });
};

