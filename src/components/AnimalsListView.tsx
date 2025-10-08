import React from 'react';
import { ModernAnimalCard } from '@/components/ModernAnimalCard';
import { AnimalTableView } from '@/components/AnimalTableView';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Language, AnimalData } from '@/types';
import { useAnimalPageStore } from '@/stores/animalPageStore';

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
  const { openModal } = useAnimalPageStore();

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {animals.map((animal) => (
        <ModernAnimalCard
          key={animal.id}
          animal={animal}
          language={language}
        />
      ))}
    </div>
  );
};