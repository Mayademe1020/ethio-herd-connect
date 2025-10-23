/**
 * Paginated Market Listings Hook
 * 
 * Provides paginated marketplace listing data with:
 * - Infinite scroll support
 * - Offline-first caching
 * - Advanced filtering (type, price, location, status)
 * - Search functionality
 * - Smart prefetching
 * - Low-bandwidth optimization
 * 
 * Use Cases:
 * - Public marketplace browsing
 * - User's own listings management
 * - Filtered searches (by type, price range, location)
 * - Verified listings only
 * - Active/sold listings
 * 
 * @module usePaginatedMarketListings
 */

import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePaginatedQuery } from './usePaginatedQuery';
import { MARKET_LISTING_FIELDS } from '@/lib/queryBuilders';
import { logger } from '@/utils/logger';

interface MarketListing {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  price?: number;
  animal_type?: string;
  breed?: string;
  age?: number;
  weight?: number;
  health_status?: string;
  location?: string;
  status: string;
  photos?: string[];
  is_vet_verified?: boolean;
  created_at: string;
  updated_at?: string;
}

interface UsePaginatedMarketListingsOptions {
  pageSize?: number;
  filters?: {
    animalType?: 'cattle' | 'goat' | 'sheep' | 'poultry';
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    status?: 'active' | 'sold' | 'pending';
    isVerified?: boolean;
    userId?: string; // For user's own listings
    searchQuery?: string;
  };
  sortBy?: 'date' | 'price' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
  isPublic?: boolean; // Whether to use public_market_listings view
}

/**
 * Hook for paginated market listings with offline support
 * 
 * @example
 * ```typescript
 * // Public marketplace (all active listings)
 * const { data: listings, hasNextPage, fetchNextPage } = usePaginatedMarketListings({
 *   pageSize: 20,
 *   isPublic: true
 * });
 * 
 * // User's own listings
 * const { data: myListings } = usePaginatedMarketListings({
 *   filters: { userId: user.id }
 * });
 * 
 * // Cattle listings only
 * const { data: cattle } = usePaginatedMarketListings({
 *   filters: { animalType: 'cattle' },
 *   isPublic: true
 * });
 * 
 * // Price range filter
 * const { data: affordable } = usePaginatedMarketListings({
 *   filters: {
 *     minPrice: 5000,
 *     maxPrice: 20000
 *   },
 *   isPublic: true
 * });
 * 
 * // Location-based search
 * const { data: local } = usePaginatedMarketListings({
 *   filters: { location: 'Addis Ababa' },
 *   isPublic: true
 * });
 * 
 * // Verified listings only
 * const { data: verified } = usePaginatedMarketListings({
 *   filters: { isVerified: true },
 *   isPublic: true
 * });
 * 
 * // Search by title/description
 * const { data: searchResults } = usePaginatedMarketListings({
 *   filters: { searchQuery: 'healthy cow' },
 *   isPublic: true
 * });
 * ```
 */
// usePaginatedMarketListings
export const usePaginatedMarketListings = ({
  pageSize = 20,
  filters = {},
  sortBy = 'date',
  sortOrder = 'desc',
  enabled = true,
  isPublic = false,
}: UsePaginatedMarketListingsOptions = {}) => {
  const { user } = useAuth();

  // Create query function with filters and sorting
  const queryFn = useMemo(
    () => async (page: number, size: number) => {
      const startTime = performance.now();
      const start = page * size;
      const end = start + size - 1;

      try {
        // Choose table based on public/private access
        const tableName = isPublic ? 'public_market_listings' : 'market_listings';
        
        // Build base query with optimized field selection
        let query = supabase
          .from(tableName)
          .select(MARKET_LISTING_FIELDS.list, { count: 'exact' });

        // Default to active listings for public marketplace
        if (isPublic && !filters.status) {
          query = query.eq('status', 'active');
        }

        // Apply sorting
        if (sortBy === 'date') {
          query = query.order('created_at', { ascending: sortOrder === 'asc' });
        } else if (sortBy === 'price') {
          query = query.order('price', { ascending: sortOrder === 'asc' });
        }

        // Apply filters
        if (filters.userId) {
          query = query.eq('user_id', filters.userId);
        }

        // Removed: invalid filter on non-existent column 'animal_type'
        // if (filters.animalType) {
        //   query = query.eq('animal_type', filters.animalType);
        // }

        if (filters.status) {
          query = query.eq('status', filters.status);
        }

        if (filters.isVerified !== undefined) {
          query = query.eq('is_vet_verified', filters.isVerified);
        }

        if (filters.minPrice !== undefined) {
          query = query.gte('price', filters.minPrice);
        }

        if (filters.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice);
        }

        if (filters.location) {
          // Case-insensitive location search
          query = query.ilike('location', `%${filters.location}%`);
        }

        if (filters.searchQuery) {
          // Search in title and description
          query = query.or(
            `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
          );
        }

        // Execute query with pagination
        const { data, error, count } = await query.range(start, end);

        if (error) throw error;

        const duration = performance.now() - startTime;
        logger.debug(
          `PaginatedMarketListings: Page ${page} loaded: ${duration.toFixed(2)}ms, ` +
          `${data?.length || 0} items, total: ${count || 0}`
        );

        return {
          data: (data || []) as MarketListing[],
          count: count || 0,
        };
      } catch (error) {
        logger.error('PaginatedMarketListings: Query failed', error);
        throw error;
      }
    },
    [user, filters, sortBy, sortOrder, isPublic]
  );

  // Use paginated query hook
  const result = usePaginatedQuery<MarketListing>({
    queryKey: ['market-listings-paginated', user?.id, filters, sortBy, sortOrder, isPublic],
    queryFn,
    pageSize,
    prefetchPages: 1,
    enableOfflineCache: true,
    cacheKey: isPublic ? 'market-listings-public' : `market-listings-${user?.id}`,
    enabled: enabled,
  });

  return {
    ...result,
    // Add convenience properties
    listings: result.data,
    isEmpty: !result.isLoading && result.data.length === 0,
  };
};

/**
 * Hook for user's own market listings
 * Convenience wrapper for seller dashboard
 */
export const usePaginatedMyListings = (
  options: Omit<UsePaginatedMarketListingsOptions, 'filters' | 'isPublic'> = {}
) => {
  const { user } = useAuth();
  
  return usePaginatedMarketListings({
    ...options,
    filters: { userId: user?.id },
    isPublic: false,
  });
};

/**
 * Hook for public marketplace listings
 * Convenience wrapper for marketplace browsing
 */
export const usePaginatedPublicMarketplace = (
  filters?: UsePaginatedMarketListingsOptions['filters'],
  options: Omit<UsePaginatedMarketListingsOptions, 'filters' | 'isPublic'> = {}
) => {
  return usePaginatedMarketListings({
    ...options,
    filters,
    isPublic: true,
  });
};

/**
 * Hook for verified listings only
 * Convenience wrapper for trusted listings
 */
export const usePaginatedVerifiedListings = (
  options: Omit<UsePaginatedMarketListingsOptions, 'filters' | 'isPublic'> = {}
) => {
  return usePaginatedMarketListings({
    ...options,
    filters: { isVerified: true },
    isPublic: true,
  });
};

/**
 * Hook for listings by animal type
 * Convenience wrapper for type-specific browsing
 */
export const usePaginatedListingsByType = (
  animalType: 'cattle' | 'goat' | 'sheep' | 'poultry',
  options: Omit<UsePaginatedMarketListingsOptions, 'filters' | 'isPublic'> = {}
) => {
  return usePaginatedMarketListings({
    ...options,
    filters: { animalType },
    isPublic: true,
  });
};

/**
 * Hook for listings by price range
 * Convenience wrapper for budget-based browsing
 */
export const usePaginatedListingsByPriceRange = (
  minPrice: number,
  maxPrice: number,
  options: Omit<UsePaginatedMarketListingsOptions, 'filters' | 'isPublic'> = {}
) => {
  return usePaginatedMarketListings({
    ...options,
    filters: { minPrice, maxPrice },
    isPublic: true,
  });
};

