// src/hooks/useAnimalFormDefaults.ts - Remember last used values for faster entry

import { useState, useEffect, useCallback } from 'react';

interface AnimalFormDefaults {
  lastAnimalType: string | null;
  lastSubtype: string | null;
  lastNamePrefix: string;
}

const STORAGE_KEY = 'animalFormDefaults';
const MAX_STORED_ITEMS = 5;

const DEFAULT_DEFAULTS: AnimalFormDefaults = {
  lastAnimalType: null,
  lastSubtype: null,
  lastNamePrefix: '',
};

export function useAnimalFormDefaults() {
  const [defaults, setDefaults] = useState<AnimalFormDefaults>(() => {
    if (typeof window === 'undefined') return DEFAULT_DEFAULTS;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_DEFAULTS;
    } catch {
      return DEFAULT_DEFAULTS;
    }
  });

  // Save to localStorage whenever defaults change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    }
  }, [defaults]);

  // Update defaults after registration
  const saveDefaults = useCallback((data: Partial<AnimalFormDefaults>) => {
    setDefaults(prev => ({
      ...prev,
      ...data,
    }));
  }, []);

  // Quick reset
  const clearDefaults = useCallback(() => {
    setDefaults(DEFAULT_DEFAULTS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Get suggested name based on prefix
  const getSuggestedName = useCallback((type: string | null) => {
    if (!type) return '';
    const prefix = defaults.lastNamePrefix || type;
    return prefix;
  }, [defaults.lastNamePrefix]);

  return {
    defaults,
    saveDefaults,
    clearDefaults,
    getSuggestedName,
  };
}
