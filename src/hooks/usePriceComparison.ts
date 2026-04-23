// src/hooks/usePriceComparison.ts - Hook for price fairness comparison

import { useState, useEffect } from 'react';
import { getPriceStats, comparePrice, PriceComparison, PriceStats } from '@/utils/priceCalculator';

interface UsePriceComparisonOptions {
  price: number;
  animalType?: string;
  breed?: string;
}

export const usePriceComparison = ({ price, animalType, breed }: UsePriceComparisonOptions) => {
  const [comparison, setComparison] = useState<PriceComparison | null>(null);
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchComparison = async () => {
      if (!price || price <= 0 || !animalType) {
        setComparison(null);
        return;
      }

      setIsLoading(true);
      try {
        const priceStats = await getPriceStats(animalType, breed);
        setStats(priceStats);
        
        if (priceStats) {
          const priceComparison = comparePrice(price, priceStats);
          setComparison(priceComparison);
        } else {
          setComparison(null);
        }
      } catch (error) {
        console.error('Error fetching price comparison:', error);
        setComparison(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the fetch
    const timeoutId = setTimeout(fetchComparison, 500);
    return () => clearTimeout(timeoutId);
  }, [price, animalType, breed]);

  return { comparison, stats, isLoading };
};
