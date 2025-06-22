
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { ModernAnimalCard } from '@/components/ModernAnimalCard';
import { AnimalTableView } from '@/components/AnimalTableView';
import { AnimalDetailModal } from '@/components/AnimalDetailModal';

interface AnimalData {
  id: string;
  name: string;
  animal_code: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  photo_url?: string;
  health_status: 'healthy' | 'attention' | 'sick';
  healthStatus: 'healthy' | 'attention' | 'sick';
  last_vaccination?: string;
  is_vet_verified: boolean;
  created_at: string;
  tracker_id?: string;
  birth_date?: string;
}

interface AnimalsListViewProps {
  animals: AnimalData[];
  viewMode: 'card' | 'table';
  language: 'am' | 'en';
  onEdit: (animal: AnimalData) => void;
  onDelete: (animalId: string) => void;
  onVaccinate: (animal: AnimalData) => void;
  onTrack: (animal: AnimalData) => void;
  onSell: (animal: AnimalData) => void;
  onShowRegistrationForm: () => void;
}

export const AnimalsListView = ({
  animals,
  viewMode,
  language,
  onEdit,
  onDelete,
  onVaccinate,
  onTrack,
  onSell,
  onShowRegistrationForm
}: AnimalsListViewProps) => {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalData | null>(null);

  const handleAnimalClick = (animal: AnimalData) => {
    setSelectedAnimal(animal);
  };

  const handleCloseModal = () => {
    setSelectedAnimal(null);
  };

  if (animals.length === 0) {
    return (
      <Card className="text-center py-8 sm:py-12 mx-2 sm:mx-0">
        <CardContent className="px-3 sm:px-6">
          <div className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">
            {language === 'am' ? 'ምንም እንስሳ አልተገኘም' : 'No animals found'}
          </div>
          <Button
            onClick={onShowRegistrationForm}
            className="bg-green-600 hover:bg-green-700 h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {language === 'am' ? 'የመጀመሪያ እንስሳዎን ይመዝግቡ' : 'Register Your First Animal'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'card') {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-2 sm:px-0">
          {animals.map((animal) => (
            <ModernAnimalCard
              key={animal.id}
              animal={{
                id: animal.id,
                name: animal.name,
                type: animal.type,
                breed: animal.breed,
                age: animal.age?.toString(),
                weight: animal.weight?.toString(),
                photo: animal.photo_url,
                lastVaccination: animal.last_vaccination,
                healthStatus: animal.health_status
              }}
              language={language}
              onClick={() => handleAnimalClick(animal)}
            />
          ))}
        </div>
        
        {/* Animal Detail Modal */}
        {selectedAnimal && (
          <AnimalDetailModal
            animal={selectedAnimal}
            language={language}
            onClose={handleCloseModal}
            onEdit={onEdit}
            onDelete={onDelete}
            onVaccinate={onVaccinate}
            onTrack={onTrack}
            onSell={onSell}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="px-2 sm:px-0">
        <AnimalTableView
          animals={animals}
          language={language}
          onEdit={onEdit}
          onDelete={onDelete}
          onVaccinate={onVaccinate}
          onTrack={onTrack}
          onSell={onSell}
          onAnimalClick={handleAnimalClick}
        />
      </div>
      
      {/* Animal Detail Modal */}
      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          language={language}
          onClose={handleCloseModal}
          onEdit={onEdit}
          onDelete={onDelete}
          onVaccinate={onVaccinate}
          onTrack={onTrack}
          onSell={onSell}
        />
      )}
    </>
  );
};
