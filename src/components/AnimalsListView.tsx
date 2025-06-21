
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { ModernAnimalCard } from '@/components/ModernAnimalCard';
import { AnimalTableView } from '@/components/AnimalTableView';

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
  if (animals.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-gray-500 mb-4">
            {language === 'am' ? 'ምንም እንስሳ አልተገኘም' : 'No animals found'}
          </div>
          <Button
            onClick={onShowRegistrationForm}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === 'am' ? 'የመጀመሪያ እንስሳዎን ይመዝግቡ' : 'Register Your First Animal'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            onClick={() => onEdit(animal)}
          />
        ))}
      </div>
    );
  }

  return (
    <AnimalTableView
      animals={animals}
      language={language}
      onEdit={onEdit}
      onDelete={onDelete}
      onVaccinate={onVaccinate}
      onTrack={onTrack}
      onSell={onSell}
    />
  );
};
