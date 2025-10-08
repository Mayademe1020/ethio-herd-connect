import React from 'react';
import { AnimalRegistrationForm } from '@/components/AnimalRegistrationForm';
import { AnimalDetailModal } from '@/components/AnimalDetailModal';
import { VaccinationForm } from '@/components/VaccinationForm';
import { WeightEntryForm } from '@/components/WeightEntryForm';
import { IllnessReportForm } from '@/components/IllnessReportForm';
import { AnimalData, Language } from '@/types';
import { useAnimalPageStore } from '@/stores/animalPageStore';
import { useAnimalStore } from '@/stores/animalStore';

interface AnimalsModalsProps {
  language: Language;
  onEdit: (animal: AnimalData) => void;
  onVaccinate: (animal: AnimalData) => void;
  onReportIllness: (animal: AnimalData) => void;
  onAnimalRegistration: (animalData: any) => void;
  onVaccinationSubmit: (vaccinationData: any, animal: AnimalData | null) => void;
  onWeightSubmit: (weightData: any, animal: AnimalData | null) => void;
  onIllnessSubmit: (illnessData: any, animal: AnimalData | null) => void;
  onToggleFavorite: (animal: AnimalData) => void;
}

export const AnimalsModals = ({
  language,
  onEdit,
  onVaccinate,
  onReportIllness,
  onAnimalRegistration,
  onVaccinationSubmit,
  onWeightSubmit,
  onIllnessSubmit,
  onToggleFavorite,
}: AnimalsModalsProps) => {
  const {
    selectedAnimal,
    animalForAction,
    showRegistrationForm,
    showVaccinationForm,
    showWeightForm,
    showIllnessForm,
    closeAllModals,
  } = useAnimalPageStore();

  return (
    <>
      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <AnimalRegistrationForm
          language={language}
          onClose={closeAllModals}
          onSubmit={onAnimalRegistration}
          animal={selectedAnimal}
        />
      )}

      {/* Animal Detail Modal */}
      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          language={language}
          onClose={closeAllModals}
          onEdit={onEdit}
          onVaccinate={onVaccinate}
          onReportIllness={onReportIllness}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {/* Vaccination Form */}
      {showVaccinationForm && animalForAction && (
        <VaccinationForm
          animal={animalForAction}
          language={language}
          onClose={closeAllModals}
          onSubmit={(data) => onVaccinationSubmit(data, animalForAction)}
        />
      )}

      {/* Weight Entry Form */}
      {showWeightForm && animalForAction && (
        <WeightEntryForm
          animal={animalForAction}
          language={language}
          onClose={closeAllModals}
          onSubmit={(data) => onWeightSubmit(data, animalForAction)}
        />
      )}

      {/* Illness Report Form */}
      {showIllnessForm && animalForAction && (
        <IllnessReportForm
          animal={animalForAction}
          language={language}
          onClose={closeAllModals}
          onSubmit={(data) => onIllnessSubmit(data, animalForAction)}
        />
      )}
    </>
  );
};