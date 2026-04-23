// src/utils/priceCalculator.ts - Price calculation utilities for marketplace

import { supabase } from '@/integrations/supabase/client';

interface PriceStats {
  average: number;
  min: number;
  max: number;
  count: number;
  median: number;
}

interface PriceComparison {
  status: 'below' | 'at_market' | 'above';
  percentage: number;
  avgPrice: number;
  label: string;
  labelAm: string;
  labelOr: string;
  labelSw: string;
}

// Cache for price stats to avoid repeated queries
const priceStatsCache: Map<string, { data: PriceStats; timestamp: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getPriceStats = async (
  animalType: string,
  breed?: string
): Promise<PriceStats | null> => {
  const cacheKey = `${animalType}-${breed || 'all'}`;
  const cached = priceStatsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    let query = supabase
      .from('market_listings')
      .select('price')
      .eq('status', 'active');

    if (animalType) {
      // Join with animals table to filter by type
      const { data: listings } = await supabase
        .from('market_listings')
        .select('animal_id, price')
        .eq('status', 'active');

      if (!listings) return null;

      // Get animal IDs and fetch their types
      const animalIds = listings.map(l => l.animal_id).filter(Boolean);
      
      if (animalIds.length > 0) {
        let animalQuery = supabase
          .from('animals')
          .select('id, type, breed')
          .in('id', animalIds);

        if (animalType !== 'all') {
          animalQuery = animalQuery.eq('type', animalType);
        }

        const { data: animals } = await animalQuery;
        
        if (!animals || animals.length === 0) return null;

        const validAnimalIds = animals.map(a => a.id);
        const prices = listings
          .filter(l => validAnimalIds.includes(l.animal_id))
          .map(l => l.price)
          .filter(p => p > 0);

        if (prices.length === 0) return null;

        const sorted = [...prices].sort((a, b) => a - b);
        const stats: PriceStats = {
          average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
          min: Math.min(...prices),
          max: Math.max(...prices),
          count: prices.length,
          median: sorted[Math.floor(sorted.length / 2)]
        };

        priceStatsCache.set(cacheKey, { data: stats, timestamp: Date.now() });
        return stats;
      }
    }

    return null;
  } catch (error) {
    console.error('Error calculating price stats:', error);
    return null;
  }
};

export const comparePrice = (
  listingPrice: number,
  marketStats: PriceStats | null
): PriceComparison | null => {
  if (!marketStats || marketStats.count < 3) {
    return null; // Not enough data
  }

  const percentage = ((listingPrice - marketStats.average) / marketStats.average) * 100;
  
  let status: 'below' | 'at_market' | 'above';
  let label: string;
  let labelAm: string;
  let labelOr: string;
  let labelSw: string;

  if (percentage <= -10) {
    status = 'below';
    label = 'Below Market';
    labelAm = 'ከገበያ በታች';
    labelOr = 'Gatii gadi-aanaa';
    labelSw = 'Chini ya Soko';
  } else if (percentage >= 10) {
    status = 'above';
    label = 'Above Market';
    labelAm = 'ከገበያ በላይ';
    labelOr = 'Gatii olaanaa';
    labelSw = 'Juu ya Soko';
  } else {
    status = 'at_market';
    label = 'Fair Price';
    labelAm = 'ተመጣጣኝ ዋጋ';
    labelOr = 'Gatii mijeewera';
    labelSw = 'Bei ya Haki';
  }

  return {
    status,
    percentage: Math.round(Math.abs(percentage)),
    avgPrice: marketStats.average,
    label,
    labelAm,
    labelOr,
    labelSw
  };
};

export const formatPriceComparison = (
  comparison: PriceComparison | null,
  language: string = 'en'
): string => {
  if (!comparison) return '';
  
  const labels: Record<string, string> = {
    en: comparison.label,
    am: comparison.labelAm,
    or: comparison.labelOr,
    sw: comparison.labelSw
  };

  return labels[language] || comparison.label;
};

export const getPriceIndicatorColor = (status: 'below' | 'at_market' | 'above'): string => {
  switch (status) {
    case 'below':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'at_market':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'above':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};
