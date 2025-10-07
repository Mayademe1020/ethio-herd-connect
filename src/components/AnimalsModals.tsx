import React from 'react';
import { AnimalRegistrationForm } from '@/components/AnimalRegistrationForm';
import { AnimalDetailModal } from '@/components/AnimalDetailModal';
import { VaccinationForm } from '@/components/VaccinationForm';
import { WeightEntryForm } from '@/components/WeightEntryForm';
import { IllnessReportForm } from '@/components/IllnessReportForm';
import { AnimalData, Language } from '@/types';

interface AnimalsModalsProps {
  language: Language;
  selectedAnimal: AnimalData | null;
  animalForAction: AnimalData | null;
  showRegistrationForm: boolean;
  showVaccinationForm: boolean;
  showWeightForm: boolean;
  showIllnessForm: boolean;
  onCloseRegistration: () => void;
  onCloseDetail: () => void;
  onCloseVaccination: () => void;
  onCloseWeight: () => void;
  onCloseIllness: () => void;
  onEdit: (animal: AnimalData) => void;
  onVaccinate: (animal: AnimalData) => void;
  onReportIllness: (animal: AnimalData) => void;
  onToggleFavorite: (animal: AnimalData) => void;
  onAnimalRegistration: (animalData: any) => void;
  onVaccinationSubmit: (vaccinationData: any) => void;
  onWeightSubmit: (weightData: any) => void;
  onIllnessSubmit: (illnessData: any) => void;
}

export const AnimalsModals = ({
  language,
  selectedAnimal,
  animalForAction,
  showRegistrationForm,
  showVaccinationForm,
  showWeightForm,
  showIllnessForm,
  onCloseRegistration,
  onCloseDetail,
  onCloseVaccination,
  onCloseWeight,
  onCloseIllness,
  onEdit,
  onVaccinate,
  onReportIllness,
  onToggleFavorite,
  onAnimalRegistration,
  onVaccinationSubmit,
  onWeightSubmit,
  onIllnessSubmit
}: AnimalsModalsProps) => {
  return (
    <>
      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <AnimalRegistrationForm
          language={language}
          onClose={onCloseRegistration}
          onSubmit={onAnimalRegistration}
        />
      )}

      {/* Animal Detail Modal */}
      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          language={language}
          onClose={onCloseDetail}
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
          onClose={onCloseVaccination}
          onSubmit={onVaccinationSubmit}
        />
      )}

      {/* Weight Entry Form */}
      {showWeightForm && animalForAction && (
        <WeightEntryForm
          animal={animalForAction}
          language={language}
          onClose={onCloseWeight}
          onSubmit={onWeightSubmit}
        />
      )}

      {/* Illness Report Form */}
      {showIllnessForm && animalForAction && (
        <IllnessReportForm
          animal={animalForAction}
          language={language}
          onClose={onCloseIllness}
          onSubmit={onIllnessSubmit}
        />
      )}
    </>
  );
};