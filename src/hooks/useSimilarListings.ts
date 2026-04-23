// src/hooks/useSimilarListings.ts - Hook for smart recommendations

import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface UseSimilarListingsOptions {
  currentListingId?: string;
  animalType?: string;
  breed?: string;
  location?: string;
  price?: number;
  limit?: number;
}

export const useSimilarListings = ({
  currentListingId,
  animalType,
  breed,
  location,
  price,
  limit = 3
}: UseSimilarListingsOptions) => {
  const queryFn = async () => {
    if (!animalType) return [];

    try {
      // Get active listings, excluding current listing
      let query = supabase
        .from('market_listings')
        .select(`
          id,
          user_id,
          price,
          location,
          status,
          created_at,
          animal:animals(id, name, type, subtype, photo_url, breed)
        `)
        .eq('status', 'active')
        .neq('id', currentListingId || '00000000-0000-0000-0000-000000000000')
        .limit(limit * 3); // Fetch more to filter

      const { data: listings, error } = await query;

      if (error || !listings) return [];

      // Score each listing based on similarity
      const scoredListings = (listings || []).map((listing: any) => {
        let score = 0;

        // Same animal type: +10 points
        if (listing.animal?.type?.toLowerCase() === animalType?.toLowerCase()) {
          score += 10;
        }

        // Same breed: +15 points
        if (breed && listing.animal?.breed?.toLowerCase() === breed?.toLowerCase()) {
          score += 15;
        }

        // Similar price range (±20%): +10 points
        if (price) {
          const priceDiff = Math.abs((listing.price - price) / price);
          if (priceDiff <= 0.2) {
            score += 10;
          } else if (priceDiff <= 0.4) {
            score += 5;
          }
        }

        // Same or nearby location: +5 points
        if (location && listing.location) {
          const sameLocation = listing.location.toLowerCase().includes(location.toLowerCase()) ||
            location.toLowerCase().includes(listing.location.toLowerCase());
          if (sameLocation) {
            score += 5;
          }
        }

        // Recent listings get a small boost: +2 points
        const createdAt = new Date(listing.created_at);
        const daysOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysOld < 7) {
          score += 2;
        }

        return { ...listing, similarityScore: score };
      });

      // Sort by score and return top matches
      const sortedListings = scoredListings
        .filter(l => l.similarityScore > 0)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, limit);

      return sortedListings;
    } catch (error) {
      console.error('Error fetching similar listings:', error);
      return [];
    }
  };

  return useQuery({
    queryKey: ['similar-listings', currentListingId, animalType, breed, location, price, limit],
    queryFn,
    enabled: !!animalType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
