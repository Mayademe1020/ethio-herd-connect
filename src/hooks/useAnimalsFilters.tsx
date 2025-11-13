import { useState, useEffect } from 'react';
import { AnimalData } from '@/types';

export const useAnimalsFilters = (animals: AnimalData[]) => {
  const [filteredAnimals, setFilteredAnimals] = useState<AnimalData[]>(animals);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [idFilter, setIdFilter] = useState(''); // New: Filter by animal ID patterns

  // Filter animals based on search and filters
  useEffect(() => {
    let filtered = animals;

    // Apply search filter - Enhanced with animal ID support
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(animal =>
        animal.name.toLowerCase().includes(query) ||
        animal.animal_code?.toLowerCase().includes(query) ||
        animal.animal_id?.toLowerCase().includes(query) || // New: Search by professional animal ID
        animal.type.toLowerCase().includes(query) ||
        (animal.breed && animal.breed.toLowerCase().includes(query)) ||
        // Support partial ID matching (e.g., "ABEBE" finds all Abebe's animals)
        (animal.animal_id && animal.animal_id.toLowerCase().startsWith(query)) ||
        // Support type-based search (e.g., "COW" finds all cows)
        (animal.animal_id && animal.animal_id.toLowerCase().includes(`-${query}`))
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

    // Apply animal ID filter (for advanced filtering)
    if (idFilter) {
      const idQuery = idFilter.toLowerCase();
      filtered = filtered.filter(animal =>
        animal.animal_id?.toLowerCase().includes(idQuery) ||
        animal.animal_id?.toLowerCase().startsWith(idQuery)
      );
    }

    setFilteredAnimals(filtered);
  }, [animals, searchQuery, typeFilter, healthFilter, idFilter]);

  return {
    filteredAnimals,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    healthFilter,
    setHealthFilter,
    idFilter,
    setIdFilter
  };
};