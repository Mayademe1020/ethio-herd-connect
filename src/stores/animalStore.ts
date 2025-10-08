import { create } from 'zustand';
import { AnimalData } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AnimalState {
  animals: AnimalData[];
  isLoading: boolean;
  error: Error | null;
  fetchAnimals: (userId: string) => Promise<void>;
  addAnimal: (animal: AnimalData) => void;
  updateAnimal: (updatedAnimal: AnimalData) => void;
  removeAnimal: (animalId: string) => void;
}

export const useAnimalStore = create<AnimalState>((set) => ({
  animals: [],
  isLoading: false,
  error: null,
  fetchAnimals: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*, growth_records(*), vaccination_records(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map((animal: any) => ({
        ...animal,
        health_status: ['healthy', 'sick', 'attention', 'critical'].includes(animal.health_status) 
          ? animal.health_status 
          : 'healthy'
      })) as AnimalData[];

      set({ animals: transformedData, isLoading: false });
    } catch (error: any) {
      set({ error, isLoading: false });
      console.error('Error fetching animals:', error);
    }
  },
  addAnimal: (animal) =>
    set((state) => ({
      animals: [animal, ...state.animals],
    })),
  updateAnimal: (updatedAnimal) =>
    set((state) => ({
      animals: state.animals.map((animal) =>
        animal.id === updatedAnimal.id ? updatedAnimal : animal
      ),
    })),
  removeAnimal: (animalId) =>
    set((state) => ({
      animals: state.animals.filter((animal) => animal.id !== animalId),
    })),
}));