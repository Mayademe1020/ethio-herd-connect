
import { useState, useCallback } from 'react';
import { AnimalData } from '@/types';

export const useAnimalSelection = () => {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalData | null>(null);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

  const selectAnimal = useCallback((animal: AnimalData) => {
    setSelectedAnimal(animal);
    setIsSelectionModalOpen(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAnimal(null);
  }, []);

  const openSelection = useCallback(() => {
    setIsSelectionModalOpen(true);
  }, []);

  const closeSelection = useCallback(() => {
    setIsSelectionModalOpen(false);
  }, []);

  return {
    selectedAnimal,
    isSelectionModalOpen,
    selectAnimal,
    clearSelection,
    openSelection,
    closeSelection
  };
};
