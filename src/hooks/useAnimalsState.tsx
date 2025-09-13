import { useState } from 'react';
import { AnimalData } from '@/types';

// Mock data for demonstration
const mockAnimals: AnimalData[] = [
  {
    id: '1',
    animal_code: 'COW001',
    name: 'Bessie',
    type: 'cattle',
    breed: 'Holstein',
    birth_date: '2020-05-15',
    weight: 450,
    health_status: 'healthy',
    is_vet_verified: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-15',
    user_id: 'user1',
    gender: 'female',
    color: 'Black and White',
    age: 4,
    last_vaccination: '2024-01-10'
  },
  {
    id: '2',
    animal_code: 'GOAT001',
    name: 'Billy',
    type: 'goat',
    breed: 'Boer',
    birth_date: '2021-03-20',
    weight: 85,
    health_status: 'attention',
    is_vet_verified: false,
    created_at: '2024-01-02',
    updated_at: '2024-01-16',
    user_id: 'user1',
    gender: 'male',
    color: 'Brown',
    age: 3,
    last_vaccination: '2023-12-15'
  }
];

export const useAnimalsState = () => {
  const [animals, setAnimals] = useState<AnimalData[]>(mockAnimals);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalData | null>(null);
  const [animalForAction, setAnimalForAction] = useState<AnimalData | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Modal states
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showIllnessForm, setShowIllnessForm] = useState(false);

  return {
    animals,
    setAnimals,
    selectedAnimal,
    setSelectedAnimal,
    animalForAction,
    setAnimalForAction,
    viewMode,
    setViewMode,
    showRegistrationForm,
    setShowRegistrationForm,
    showVaccinationForm,
    setShowVaccinationForm,
    showWeightForm,
    setShowWeightForm,
    showIllnessForm,
    setShowIllnessForm
  };
};