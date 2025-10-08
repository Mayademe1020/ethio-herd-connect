import { create } from 'zustand';
import { AnimalData } from '@/types';

interface AnimalPageState {
  selectedAnimal: AnimalData | null;
  animalForAction: AnimalData | null;
  viewMode: 'card' | 'table';
  showRegistrationForm: boolean;
  showVaccinationForm: boolean;
  showWeightForm: boolean;
  showIllnessForm: boolean;

  setSelectedAnimal: (animal: AnimalData | null) => void;
  setAnimalForAction: (animal: AnimalData | null) => void;
  setViewMode: (mode: 'card' | 'table') => void;
  openModal: (modal: 'registration' | 'vaccination' | 'weight' | 'illness', animal?: AnimalData) => void;
  closeAllModals: () => void;
}

export const useAnimalPageStore = create<AnimalPageState>((set) => ({
  selectedAnimal: null,
  animalForAction: null,
  viewMode: 'card',
  showRegistrationForm: false,
  showVaccinationForm: false,
  showWeightForm: false,
  showIllnessForm: false,

  setSelectedAnimal: (animal) => set({ selectedAnimal: animal }),
  setAnimalForAction: (animal) => set({ animalForAction: animal }),
  setViewMode: (mode) => set({ viewMode: mode }),

  openModal: (modal, animal) => {
    switch (modal) {
      case 'registration':
        set({ showRegistrationForm: true });
        break;
      case 'vaccination':
        set({ showVaccinationForm: true, animalForAction: animal });
        break;
      case 'weight':
        set({ showWeightForm: true, animalForAction: animal });
        break;
      case 'illness':
        set({ showIllnessForm: true, animalForAction: animal });
        break;
    }
  },

  closeAllModals: () => set({
    showRegistrationForm: false,
    showVaccinationForm: false,
    showWeightForm: false,
    showIllnessForm: false,
    selectedAnimal: null,
    animalForAction: null,
  }),
}));