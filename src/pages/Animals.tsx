import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { AnimalsPageHeader } from '@/components/AnimalsPageHeader';
import { AnimalsQuickActions } from '@/components/AnimalsQuickActions';
import { AnimalsSummaryCards } from '@/components/AnimalsSummaryCards';
import { AnimalsFilters } from '@/components/AnimalsFilters';
import { AnimalsListView } from '@/components/AnimalsListView';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { AnimalRegistrationForm } from '@/components/AnimalRegistrationForm';
import { AnimalDetailModal } from '@/components/AnimalDetailModal';
import { VaccinationForm } from '@/components/VaccinationForm';
import { WeightEntryForm } from '@/components/WeightEntryForm';
import { IllnessReportForm } from '@/components/IllnessReportForm';
import { AnimalData, transformAnimalData } from '@/types';

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

const Animals = () => {
  const { language } = useLanguage();
  const [animals, setAnimals] = useState<AnimalData[]>(mockAnimals);
  const [filteredAnimals, setFilteredAnimals] = useState<AnimalData[]>(mockAnimals);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalData | null>(null);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showIllnessForm, setShowIllnessForm] = useState(false);
  const [animalForAction, setAnimalForAction] = useState<AnimalData | null>(null);

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

  const handleEdit = (animal: AnimalData) => {
    setSelectedAnimal(animal);
  };

  const handleDelete = (animalId: string) => {
    setAnimals(prev => prev.filter(animal => animal.id !== animalId));
  };

  const handleVaccinate = (animal: AnimalData) => {
    setAnimalForAction(animal);
    setShowVaccinationForm(true);
  };

  const handleTrack = (animal: AnimalData) => {
    setAnimalForAction(animal);
    setShowWeightForm(true);
  };

  const handleSell = (animal: AnimalData) => {
    // Handle sell logic
    console.log('Selling animal:', animal);
  };

  const handleReportIllness = (animal: AnimalData) => {
    setAnimalForAction(animal);
    setShowIllnessForm(true);
  };

  const handleAnimalRegistration = (animalData: any) => {
    const newAnimal: AnimalData = {
      id: Date.now().toString(),
      animal_code: `${animalData.type.toUpperCase()}${String(animals.length + 1).padStart(3, '0')}`,
      name: animalData.name,
      type: animalData.type,
      breed: animalData.breed,
      birth_date: animalData.birthDate,
      weight: animalData.weight,
      health_status: 'healthy',
      is_vet_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'current-user',
      gender: animalData.gender,
      color: animalData.color,
      age: animalData.age
    };

    setAnimals(prev => [...prev, newAnimal]);
    setShowRegistrationForm(false);
  };

  const handleVaccinationSubmit = (vaccinationData: any) => {
    if (animalForAction) {
      setAnimals(prev => prev.map(animal => 
        animal.id === animalForAction.id 
          ?{ ...animal, last_vaccination: vaccinationData.date, updated_at: new Date().toISOString() }
          : animal
      ));
    }
    setShowVaccinationForm(false);
    setAnimalForAction(null);
  };

  const handleWeightSubmit = (weightData: any) => {
    if (animalForAction) {
      setAnimals(prev => prev.map(animal => 
        animal.id === animalForAction.id 
          ? { ...animal, weight: weightData.weight, updated_at: new Date().toISOString() }
          : animal
      ));
    }
    setShowWeightForm(false);
    setAnimalForAction(null);
  };

  const handleIllnessSubmit = (illnessData: any) => {
    if (animalForAction) {
      setAnimals(prev => prev.map(animal => 
        animal.id === animalForAction.id 
          ? { ...animal, health_status: illnessData.severity, updated_at: new Date().toISOString() }
          : animal
      ));
    }
    setShowIllnessForm(false);
    setAnimalForAction(null);
  };

  const summaryData = {
    totalAnimals: animals.length,
    healthyAnimals: animals.filter(a => a.health_status === 'healthy').length,
    sickAnimals: animals.filter(a => a.health_status === 'sick' || a.health_status === 'critical').length,
    needsAttention: animals.filter(a => a.health_status === 'attention').length,
    vaccinatedAnimals: animals.filter(a => a.last_vaccination).length,
    recentlyAdded: animals.filter(a => {
      const addedDate = new Date(a.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return addedDate > weekAgo;
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        <AnimalsPageHeader language={language} />
        
        <AnimalsQuickActions 
          language={language}
          onShowRegistrationForm={() => setShowRegistrationForm(true)}
        />

        <AnimalsSummaryCards 
          language={language}
          summaryData={summaryData}
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <AnimalsFilters
              language={language}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              healthFilter={healthFilter}
              onHealthFilterChange={setHealthFilter}
            />
          </div>
          
          <ViewModeToggle 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            language={language}
          />
        </div>

        <AnimalsListView
          animals={filteredAnimals}
          viewMode={viewMode}
          language={language}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onVaccinate={handleVaccinate}
          onTrack={handleTrack}
          onSell={handleSell}
          onShowRegistrationForm={() => setShowRegistrationForm(true)}
        />
      </main>

      <BottomNavigation language={language} />

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <AnimalRegistrationForm
          language={language}
          onClose={() => setShowRegistrationForm(false)}
          onSubmit={handleAnimalRegistration}
        />
      )}

      {/* Animal Detail Modal */}
      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          language={language}
          onClose={() => setSelectedAnimal(null)}
          onEdit={handleEdit}
          onVaccinate={handleVaccinate}
          onReportIllness={handleReportIllness}
        />
      )}

      {/* Vaccination Form */}
      {showVaccinationForm && animalForAction && (
        <VaccinationForm
          animal={animalForAction}
          language={language}
          onClose={() => {
            setShowVaccinationForm(false);
            setAnimalForAction(null);
          }}
          onSubmit={handleVaccinationSubmit}
        />
      )}

      {/* Weight Entry Form */}
      {showWeightForm && animalForAction && (
        <WeightEntryForm
          animal={animalForAction}
          language={language}
          onClose={() => {
            setShowWeightForm(false);
            setAnimalForAction(null);
          }}
          onSubmit={handleWeightSubmit}
        />
      )}

      {/* Illness Report Form */}
      {showIllnessForm && animalForAction && (
        <IllnessReportForm
          animal={animalForAction}
          language={language}
          onClose={() => {
            setShowIllnessForm(false);
            setAnimalForAction(null);
          }}
          onSubmit={handleIllnessSubmit}
        />
      )}
    </div>
  );
};

export default Animals;
