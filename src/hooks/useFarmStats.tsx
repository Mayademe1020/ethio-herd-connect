// src/hooks/useFarmStats.tsx - Hook to fetch farm statistics

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';

export interface FarmStats {
  totalAnimals: number;
  milkLast30Days: number; // in liters
  activeListings: number;
  lastUpdated?: string; // ISO timestamp of when data was fetched
}

export const useFarmStats = () => {
  const { user } = useAuth();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['farmStats', user?.id, isOnline],
    queryFn: async () => {
      if (!user) return null;
      if (!isOnline) {
        // Offline: provide minimal stats from last known values (if any)
        return {
          totalAnimals: 0,
          milkLast30Days: 0,
          activeListings: 0,
          lastUpdated: new Date().toISOString()
        } as FarmStats;
      }

      try {
        // Count total animals for the user
        const { count: animalCount, error: animalError } = await supabase
          .from('animals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (animalError) {
          console.error('Error counting animals:', animalError);
          throw animalError;
        }

        // Calculate date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Sum milk production for last 30 days
        const { data: milkData, error: milkError } = await supabase
          .from('milk_production')
          .select('liters')
          .eq('user_id', user.id)
          .gte('recorded_at', thirtyDaysAgo.toISOString());

        if (milkError) {
          console.error('Error fetching milk production:', milkError);
          throw milkError;
        }

        // Sum up total milk yield
        const totalMilk = milkData?.reduce((sum, record) => 
          sum + (Number(record.liters) || 0), 0
        ) || 0;

        // Count active market listings
        const { count: listingCount, error: listingError } = await supabase
          .from('market_listings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (listingError) {
          console.error('Error counting listings:', listingError);
          throw listingError;
        }

        const farmStats: FarmStats = {
          totalAnimals: animalCount || 0,
          milkLast30Days: Math.round(totalMilk * 10) / 10, // Round to 1 decimal
          activeListings: listingCount || 0,
          lastUpdated: new Date().toISOString()
        };

        console.log('Farm stats loaded successfully:', farmStats);
        return farmStats;
      } catch (err: any) {
        const msg = String(err?.message || '').toLowerCase();
        const isAborted = err?.name === 'AbortError' || msg.includes('abort') || msg.includes('cancel');
        if (!isAborted) {
          console.error('Farm stats fetch exception:', err);
        }
        throw err;
      }
    },
    enabled: !!user && isOnline,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Check if data is stale (> 24 hours old)
  const isStale = stats?.lastUpdated 
    ? (Date.now() - new Date(stats.lastUpdated).getTime()) > 24 * 60 * 60 * 1000
    : false;

  return {
    stats,
    isLoading,
    error,
    refetch,
    isStale
  };
};
