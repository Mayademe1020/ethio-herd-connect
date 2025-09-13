import { AnimalData } from '@/types';

interface UseAnimalsActionsProps {
  animals: AnimalData[];
  setAnimals: React.Dispatch<React.SetStateAction<AnimalData[]>>;
  setSelectedAnimal: React.Dispatch<React.SetStateAction<AnimalData | null>>;
  setAnimalForAction: React.Dispatch<React.SetStateAction<AnimalData | null>>;
  setShowVaccinationForm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowWeightForm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowIllnessForm: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRegistrationForm: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useAnimalsActions = ({
  animals,
  setAnimals,
  setSelectedAnimal,
  setAnimalForAction,
  setShowVaccinationForm,
  setShowWeightForm,
  setShowIllnessForm,
  setShowRegistrationForm
}: UseAnimalsActionsProps) => {

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

  const handleVaccinationSubmit = (vaccinationData: any, animalForAction: AnimalData | null) => {
    if (animalForAction) {
      setAnimals(prev => prev.map(animal => 
        animal.id === animalForAction.id 
          ? { ...animal, last_vaccination: vaccinationData.date, updated_at: new Date().toISOString() }
          : animal
      ));
    }
    setShowVaccinationForm(false);
    setAnimalForAction(null);
  };

  const handleWeightSubmit = (weightData: any, animalForAction: AnimalData | null) => {
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

  const handleIllnessSubmit = (illnessData: any, animalForAction: AnimalData | null) => {
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

  return {
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
  };
};