import React from 'react';
import { EnhancedAnimalCard } from '@/components/EnhancedAnimalCard';
import { AnimalTableView } from '@/components/AnimalTableView';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Language, AnimalData } from '@/types';
import { useAnimalPageStore } from '@/stores/animalPageStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { useAnimalStore } from '@/stores/animalStore';

interface AnimalsListViewProps {
  animals: AnimalData[];
  viewMode: 'card' | 'table';
  language: Language;
}

export const AnimalsListView = ({
  animals,
  viewMode,
  language,
}: AnimalsListViewProps) => {
  const { openModal, setSelectedAnimal } = useAnimalPageStore();
  const { user } = useAuth();
  const { removeAnimal: removeAnimalFromStore } = useAnimalStore();

  const translations = {
    am: {
      noAnimals: 'እንስሳት አልተገኙም',
      addFirst: 'የመጀመሪያ እንስሳዎን ያክሉ'
    },
    en: {
      noAnimals: 'No animals found',
      addFirst: 'Add your first animal'
    },
    or: {
      noAnimals: 'Horii hin argamne',
      addFirst: 'Horii jalqabaa kee dabaluu'
    },
    sw: {
      noAnimals: 'Hakuna wanyama waliopatikana',
      addFirst: 'Ongeza mnyama wako wa kwanza'
    }
  };

  const t = translations[language];

  if (animals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">{t.noAnimals}</p>
        <Button onClick={() => openModal('registration')} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          {t.addFirst}
        </Button>
      </div>
    );
  }

  if (viewMode === 'table') {
    return (
      <AnimalTableView
        animals={animals}
        language={language}
      />
    );
  }

  const handleEdit = (animal: AnimalData) => {
    setSelectedAnimal(animal);
    openModal('registration');
  };

  const handleDelete = async (animalId: string) => {
    if (!user) return;
    const originalAnimals = useAnimalStore.getState().animals;
    removeAnimalFromStore(animalId);
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', animalId)
      .eq('user_id', user.id);
    if (error) {
      useAnimalStore.setState({ animals: originalAnimals });
      toast.error("Failed to delete animal.");
      logger.error('Failed to delete animal', error);
    } else {
      toast.success("Animal deleted successfully.");
    }
  };

  const handleVaccinate = (animal: AnimalData) => {
    openModal('vaccination', animal);
  };

  const handleTrack = (animal: AnimalData) => {
    openModal('weight', animal);
  };

  const handleSell = (animal: AnimalData) => {
    logger.debug('Selling animal', { animal });
    // TODO: Implement sell functionality
  };

  const handleMilkRecord = (animal: AnimalData) => {
    openModal('milk', animal);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {animals.map((animal) => (
        <EnhancedAnimalCard
          key={animal.id}
          animal={animal}
          language={language}
          variant="full"
          onEdit={handleEdit}
          onDelete={handleDelete}
          onVaccinate={handleVaccinate}
          onTrack={handleTrack}
          onSell={handleSell}
          onMilkRecord={handleMilkRecord}
        />
      ))}
    </div>
  );
};