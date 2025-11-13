// Animal Search Hook
// Provides search functionality for filtering animals by ID or name

import { useState, useMemo } from 'react';

interface Animal {
  id: string;
  animal_id?: string;
  name: string;
  type: string;
  subtype?: string;
  [key: string]: any;
}

interface UseAnimalSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredAnimals: Animal[];
  isSearching: boolean;
  resultsCount: number;
}

export const useAnimalSearch = (animals: Animal[]): UseAnimalSearchReturn => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAnimals = useMemo(() => {
    if (!searchQuery.trim()) {
      return animals;
    }

    const query = searchQuery.toLowerCase().trim();

    return animals.filter((animal) => {
      // Search by animal ID
      if (animal.animal_id && animal.animal_id.toLowerCase().includes(query)) {
        return true;
      }

      // Search by name
      if (animal.name && animal.name.toLowerCase().includes(query)) {
        return true;
      }

      // Search by type
      if (animal.type && animal.type.toLowerCase().includes(query)) {
        return true;
      }

      // Search by subtype
      if (animal.subtype && animal.subtype.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    });
  }, [animals, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredAnimals,
    isSearching: searchQuery.trim().length > 0,
    resultsCount: filteredAnimals.length
  };
};
