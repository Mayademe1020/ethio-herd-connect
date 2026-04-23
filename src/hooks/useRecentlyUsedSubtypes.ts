import { useState, useEffect, useCallback } from 'react';
import { AnimalType } from '@/components/AnimalTypeSelector';

const RECENTLY_USED_KEY = 'ethio-herd-recently-used-subtypes';
const MAX_RECENT = 5;

interface RecentlyUsedSubtypes {
  [key in AnimalType]: string[];
}

export const useRecentlyUsedSubtypes = () => {
  const [recentlyUsed, setRecentlyUsed] = useState<RecentlyUsedSubtypes>({
    cattle: [],
    goat: [],
    sheep: []
  });

  // Load from localStorage on initial render
  useEffect(() => {
    const saved = localStorage.getItem(RECENTLY_USED_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as RecentlyUsedSubtypes;
        setRecentlyUsed(parsed);
      } catch (e) {
        console.error('Failed to parse recently used subtypes:', e);
      }
    }
  }, []);

  // Save to localStorage whenever recentlyUsed changes
  useEffect(() => {
    localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recentlyUsed));
  }, [recentlyUsed]);

  // Add a subtype to recently used list for its animal type
  const addRecentlyUsed = useCallback((animalType: AnimalType, subtype: string) => {
    setRecentlyUsed(prev => {
      const currentList = prev[animalType] || [];
      
      // Remove if already exists (to move to front)
      const filtered = currentList.filter(s => s !== subtype);
      
      // Add to beginning and limit to MAX_RECENT
      const updated = [subtype, ...filtered].slice(0, MAX_RECENT);
      
      return {
        ...prev,
        [animalType]: updated
      };
    });
  }, []);

  // Get recently used subtypes for an animal type
  const getRecentlyUsed = useCallback((animalType: AnimalType): string[] => {
    return recentlyUsed[animalType] || [];
  }, [recentlyUsed]);

  // Clear recently used for an animal type
  const clearRecentlyUsed = useCallback((animalType: AnimalType) => {
    setRecentlyUsed(prev => ({
      ...prev,
      [animalType]: []
    }));
  }, []);

  return {
    recentlyUsed,
    addRecentlyUsed,
    getRecentlyUsed,
    clearRecentlyUsed
  };
};