import React, { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { AnimalsPageHeader } from '@/components/AnimalsPageHeader';
import { AnimalsQuickActions } from '@/components/AnimalsQuickActions';
import { AnimalsSummaryCards } from '@/components/AnimalsSummaryCards';
import { AnimalsFilters } from '@/components/AnimalsFilters';
import { AnimalsListView } from '@/components/AnimalsListView';
import { ViewModeToggle } from '@/components/ViewModeToggle';
import { AnimalsModals } from '@/components/AnimalsModals';
import { useAnimalsFilters } from '@/hooks/useAnimalsFilters';
import { calculateSummaryData } from '@/utils/animalsSummaryData';
import { useAnimalStore } from '@/stores/animalStore';
import { useAnimalPageStore } from '@/stores/animalPageStore';
import { supabase } from '@/integrations/supabase/client';
import { AnimalData } from '@/types';
import { toast } from 'sonner';

const Animals = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  // Zustand stores for state management
  const { animals, isLoading, fetchAnimals, addAnimal, updateAnimal, removeAnimal } = useAnimalStore();
  const {
    viewMode,
    setViewMode,
    openModal,
    setSelectedAnimal,
    closeAllModals,
  } = useAnimalPageStore();

  // Fetch initial data
  useEffect(() => {
    if (user?.id) {
      fetchAnimals(user.id);
    }
  }, [user, fetchAnimals]);

  // Filtering logic
  const {
    filteredAnimals,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    healthFilter,
    setHealthFilter
  } = useAnimalsFilters(animals);

  // Action Handlers
  const handleEdit = (animal: AnimalData) => {
    setSelectedAnimal(animal);
    openModal('registration', animal);
  };

  const handleDelete = async (animalId: string) => {
    if (!user) return;
    const originalAnimals = animals;
    removeAnimal(animalId);
    const { error } = await supabase.from('animals').delete().eq('id', animalId);
    if (error) {
      useAnimalStore.setState({ animals: originalAnimals });
      toast.error("Failed to delete animal.");
    } else {
      toast.success("Animal deleted successfully.");
    }
  };

  const handleVaccinate = (animal: AnimalData) => openModal('vaccination', animal);
  const handleTrack = (animal: AnimalData) => openModal('weight', animal);
  const handleReportIllness = (animal: AnimalData) => openModal('illness', animal);
  const handleSell = (animal: AnimalData) => {
    console.log('Selling animal:', animal);
  };

  const handleAnimalRegistration = async (animalData: any) => {
    if (!user) return;
    const { data, error } = await supabase.from('animals').insert([{ ...animalData, user_id: user.id }]).select().single();
    if (data) {
      const validHealthStatus: 'healthy' | 'sick' | 'attention' | 'critical' = 
        ['healthy', 'sick', 'attention', 'critical'].includes(data.health_status) 
          ? data.health_status as 'healthy' | 'sick' | 'attention' | 'critical'
          : 'healthy';
      addAnimal({ ...data, health_status: validHealthStatus });
      closeAllModals();
      toast.success("Animal registered successfully.");
    } else {
      toast.error("Failed to register animal.");
    }
  };

  const handleVaccinationSubmit = async (vaccinationData: any, animal: AnimalData | null) => {
    if (!animal || !user) return;
    const originalAnimal = { ...animal };
    const updatedAnimal = { ...animal, last_vaccination: vaccinationData.date };
    updateAnimal(updatedAnimal);
    closeAllModals();
    const { error } = await supabase.from('health_records').insert([{ 
      animal_id: animal.id, 
      user_id: user.id,
      record_type: 'vaccination',
      medicine_name: vaccinationData.vaccine_name,
      administered_date: vaccinationData.date,
      notes: vaccinationData.notes
    }]);
    if (error) {
      updateAnimal(originalAnimal);
      toast.error("Failed to submit vaccination record.");
    } else {
      toast.success("Vaccination record submitted.");
    }
  };

  const handleWeightSubmit = async (weightData: any, animal: AnimalData | null) => {
     if (!animal || !user) return;
     const originalAnimal = { ...animal };
     const updatedAnimal = { ...animal, weight: weightData.weight };
     updateAnimal(updatedAnimal);
     closeAllModals();
     const { error } = await supabase.from('growth_records').insert([{ ...weightData, animal_id: animal.id, user_id: user.id }]);
     if(error) {
       updateAnimal(originalAnimal);
       toast.error("Failed to submit weight record.");
     } else {
       toast.success("Weight record submitted.");
     }
  };

  const handleIllnessSubmit = async (illnessData: any, animal: AnimalData | null) => {
     if (!animal || !user) return;
     const originalAnimal = { ...animal };
     const updatedAnimal = { ...animal, health_status: illnessData.severity };
     updateAnimal(updatedAnimal);
     closeAllModals();
     const { error } = await supabase.from('health_records').insert([{ ...illnessData, animal_id: animal.id, user_id: user.id }]);
     if (error) {
       updateAnimal(originalAnimal);
       toast.error("Failed to submit illness report.");
     } else {
       toast.success("Illness report submitted.");
     }
  };

  // Favorite functionality removed - not part of AnimalData schema

  const summaryData = calculateSummaryData(animals);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading animals...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        <AnimalsPageHeader language={language} />
        <AnimalsQuickActions language={language} onShowRegistrationForm={() => openModal('registration')} />
        <AnimalsSummaryCards language={language} summaryData={summaryData} />

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
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} language={language} />
        </div>

        <AnimalsListView
          animals={filteredAnimals}
          viewMode={viewMode}
          language={language}
        />
      </main>

      <BottomNavigation language={language} />

      <AnimalsModals
        language={language}
        onEdit={handleEdit}
        onVaccinate={handleVaccinate}
        onReportIllness={handleReportIllness}
        onAnimalRegistration={handleAnimalRegistration}
        onVaccinationSubmit={(data) => handleVaccinationSubmit(data, useAnimalPageStore.getState().animalForAction)}
        onWeightSubmit={(data) => handleWeightSubmit(data, useAnimalPageStore.getState().animalForAction)}
        onIllnessSubmit={(data) => handleIllnessSubmit(data, useAnimalPageStore.getState().animalForAction)}
      />
    </div>
  );
};

export default Animals;