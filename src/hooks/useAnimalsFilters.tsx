import { useState, useEffect } from 'react';
import { AnimalData } from '@/types';

export const useAnimalsFilters = (animals: AnimalData[]) => {
  const [filteredAnimals, setFilteredAnimals] = useState<AnimalData[]>(animals);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');

  // Filter animals based on search and filters
  useEffect(() => {
    let filtered = animals;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(animal =>
        animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.animal_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        animal.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (animal.breed && animal.breed.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(animal => animal.type === typeFilter);
    }

    // Apply health filter
    if (healthFilter !== 'all') {
      filtered = filtered.filter(animal => animal.health_status === healthFilter);
    }

    setFilteredAnimals(filtered);
  }, [animals, searchQuery, typeFilter, healthFilter]);

  return {
    filteredAnimals,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    healthFilter,
    setHealthFilter
  };
};