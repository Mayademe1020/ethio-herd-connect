import React from 'react';
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
import { AnimalsModals } from '@/components/AnimalsModals';
import { useAnimalsState } from '@/hooks/useAnimalsState';
import { useAnimalsFilters } from '@/hooks/useAnimalsFilters';
import { useAnimalsActions } from '@/hooks/useAnimalsActions';
import { calculateSummaryData } from '@/utils/animalsSummaryData';

const Animals = () => {
  const { language } = useLanguage();
  
  // State management
  const {
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
  } = useAnimalsState();

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

  // Action handlers
  const {
    handleEdit,
    handleDelete,
    handleVaccinate,
    handleTrack,
    handleSell,
    handleReportIllness,
    handleAnimalRegistration,
    handleVaccinationSubmit,
    handleWeightSubmit,
    handleIllnessSubmit
  } = useAnimalsActions({
    animals,
    setAnimals,
    setSelectedAnimal,
    setAnimalForAction,
    setShowVaccinationForm,
    setShowWeightForm,
    setShowIllnessForm,
    setShowRegistrationForm
  });

  // Calculate summary data
  const summaryData = calculateSummaryData(animals);

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

      <AnimalsModals
        language={language}
        selectedAnimal={selectedAnimal}
        animalForAction={animalForAction}
        showRegistrationForm={showRegistrationForm}
        showVaccinationForm={showVaccinationForm}
        showWeightForm={showWeightForm}
        showIllnessForm={showIllnessForm}
        onCloseRegistration={() => setShowRegistrationForm(false)}
        onCloseDetail={() => setSelectedAnimal(null)}
        onCloseVaccination={() => {
          setShowVaccinationForm(false);
          setAnimalForAction(null);
        }}
        onCloseWeight={() => {
          setShowWeightForm(false);
          setAnimalForAction(null);
        }}
        onCloseIllness={() => {
          setShowIllnessForm(false);
          setAnimalForAction(null);
        }}
        onEdit={handleEdit}
        onVaccinate={handleVaccinate}
        onReportIllness={handleReportIllness}
        onAnimalRegistration={handleAnimalRegistration}
        onVaccinationSubmit={(data) => handleVaccinationSubmit(data, animalForAction)}
        onWeightSubmit={(data) => handleWeightSubmit(data, animalForAction)}
        onIllnessSubmit={(data) => handleIllnessSubmit(data, animalForAction)}
      />
    </div>
  );
};

export default Animals;
