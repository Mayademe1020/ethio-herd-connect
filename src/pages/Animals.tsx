import React, { useEffect, useState } from 'react';
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
import { AdvancedSearchFilters } from '@/components/AdvancedSearchFilters';
import { calculateSummaryData } from '@/utils/animalsSummaryData';
import { useAnimalPageStore } from '@/stores/animalPageStore';
import { usePaginatedAnimals } from '@/hooks/usePaginatedAnimals';
import { InfiniteScrollContainer, ListSkeleton, EmptyState } from '@/components/InfiniteScrollContainer';
import { supabase } from '@/integrations/supabase/client';
import { AnimalData } from '@/types';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Animals = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<any>({});
  const [filterCount, setFilterCount] = useState(0);

  // Zustand store for UI state only
  const {
    viewMode,
    setViewMode,
    openModal,
    setSelectedAnimal,
    closeAllModals,
  } = useAnimalPageStore();

  // PAGINATION: Use paginated animals hook with filters
  const {
    animals,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    isOffline,
    isEmpty,
    totalCount,
    refresh
  } = usePaginatedAnimals({
    pageSize: 20, // Load 20 animals per page
    filters: {
      type: typeFilter || undefined,
      healthStatus: healthFilter || undefined,
      searchQuery: searchQuery || undefined,
      // Advanced filters
      location: advancedFilters.location || undefined,
      isVetVerified: advancedFilters.isVetVerified === 'verified' ? true : 
                     advancedFilters.isVetVerified === 'not-verified' ? false : undefined,
      ageMin: advancedFilters.ageRange?.min ? parseInt(advancedFilters.ageRange.min) : undefined,
      ageMax: advancedFilters.ageRange?.max ? parseInt(advancedFilters.ageRange.max) : undefined,
      weightMin: advancedFilters.weightRange?.min ? parseFloat(advancedFilters.weightRange.min) : undefined,
      weightMax: advancedFilters.weightRange?.max ? parseFloat(advancedFilters.weightRange.max) : undefined,
    },
  });

  // Action Handlers
  const handleEdit = (animal: AnimalData) => {
    setSelectedAnimal(animal);
    openModal('registration', animal);
  };

  const handleDelete = async (animalId: string) => {
    if (!user) return;
    const { error } = await supabase.from('animals').delete().eq('id', animalId);
    if (error) {
      toast.error("Failed to delete animal.");
    } else {
      toast.success("Animal deleted successfully.");
      // Refresh pagination to update list
      refresh();
    }
  };

  const handleVaccinate = (animal: AnimalData) => openModal('vaccination', animal);
  const handleTrack = (animal: AnimalData) => openModal('weight', animal);
  const handleReportIllness = (animal: AnimalData) => openModal('illness', animal);
  const handleSell = (animal: AnimalData) => {
    logger.debug('Selling animal', { animal });
  };

  const handleAdvancedFiltersChange = (filters: any) => {
    setAdvancedFilters(filters);
    
    // Count active filters
    let count = 0;
    if (filters.animalType && filters.animalType !== 'all') count++;
    if (filters.healthStatus && filters.healthStatus !== 'all') count++;
    if (filters.location) count++;
    if (filters.isVetVerified && filters.isVetVerified !== 'all') count++;
    if (filters.ageRange?.min || filters.ageRange?.max) count++;
    if (filters.weightRange?.min || filters.weightRange?.max) count++;
    
    setFilterCount(count);
  };

  const handleClearAdvancedFilters = () => {
    setAdvancedFilters({});
    setFilterCount(0);
  };

  const handleAnimalRegistration = async (animalData: any) => {
    if (!user) return;
    const { data, error } = await supabase.from('animals').insert([{ ...animalData, user_id: user.id }]).select().single();
    if (data) {
      closeAllModals();
      toast.success("Animal registered successfully.");
      // Refresh pagination to show new animal
      refresh();
    } else {
      toast.error("Failed to register animal.");
    }
  };

  const handleVaccinationSubmit = async (vaccinationData: any, animal: AnimalData | null) => {
    if (!animal || !user) return;
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
      toast.error("Failed to submit vaccination record.");
    } else {
      toast.success("Vaccination record submitted.");
      // Refresh to update last_vaccination date
      refresh();
    }
  };

  const handleWeightSubmit = async (weightData: any, animal: AnimalData | null) => {
     if (!animal || !user) return;
     closeAllModals();
     const { error } = await supabase.from('growth_records').insert([{ ...weightData, animal_id: animal.id, user_id: user.id }]);
     if(error) {
       toast.error("Failed to submit weight record.");
     } else {
       toast.success("Weight record submitted.");
       // Refresh to update weight
       refresh();
     }
  };

  const handleIllnessSubmit = async (illnessData: any, animal: AnimalData | null) => {
     if (!animal || !user) return;
     closeAllModals();
     const { error } = await supabase.from('health_records').insert([{ ...illnessData, animal_id: animal.id, user_id: user.id }]);
     if (error) {
       toast.error("Failed to submit illness report.");
     } else {
       toast.success("Illness report submitted.");
       // Refresh to update health status
       refresh();
     }
  };

  // Calculate summary data from paginated animals
  const summaryData = calculateSummaryData(animals);

  // Show skeleton loader on initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-16 sm:pb-20 lg:pb-24">
        <EnhancedHeader />
        <OfflineIndicator language={language} />
        <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <AnimalsPageHeader language={language} />
          <ListSkeleton count={5} />
        </main>
        <BottomNavigation language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        <AnimalsPageHeader language={language} />
        <AnimalsQuickActions language={language} onShowRegistrationForm={() => openModal('registration')} />
        <AnimalsSummaryCards language={language} summaryData={summaryData} />

        <div className="space-y-3 sm:space-y-4">
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

          {/* Advanced Search Filters */}
          <AdvancedSearchFilters
            language={language}
            onFiltersChange={handleAdvancedFiltersChange}
            onClearFilters={handleClearAdvancedFilters}
            filterCount={filterCount}
            resultCount={totalCount}
            isLoading={isLoading}
            context="animals"
          />
        </div>

        {/* Show empty state if no animals */}
        {isEmpty ? (
          <EmptyState
            title="No animals yet"
            description="Start by registering your first animal to begin tracking their health and growth"
            icon={<PawPrint className="w-10 h-10 text-gray-400" />}
            action={
              <Button 
                onClick={() => openModal('registration')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Register First Animal
              </Button>
            }
          />
        ) : (
          /* PAGINATION: Infinite scroll container */
          <InfiniteScrollContainer
            onLoadMore={fetchNextPage}
            hasMore={hasNextPage}
            isLoading={isFetchingNextPage}
            isOffline={isOffline}
            loadingMessage="Loading more animals..."
            endMessage={`All ${totalCount} animals loaded`}
            offlineMessage="Offline - showing cached animals"
          >
            <AnimalsListView
              animals={animals}
              viewMode={viewMode}
              language={language}
            />
          </InfiniteScrollContainer>
        )}
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