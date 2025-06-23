
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ModernAnimalCard } from '@/components/ModernAnimalCard';
import { AnimalTableView } from '@/components/AnimalTableView';
import { AnimalData, Language } from '@/types';

interface AnimalsListViewProps {
  animals: AnimalData[];
  viewMode: 'card' | 'table';
  language: Language;
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
  const translations = {
    am: {
      noAnimalsTitle: 'ምንም እንስሳ አልተመዘገበም',
      noAnimalsSubtitle: 'የመጀመሪያዎን እንስሳ ለመመዝገብ ከዚህ ጀምር',
      noAnimalsFound: 'ምንም እንስሳ አልተገኘም',
      tryDifferentSearch: 'የተለየ ፍለጋ ይሞክሩ'
    },
    en: {
      noAnimalsTitle: 'No animals registered',
      noAnimalsSubtitle: 'Get started by registering your first animal',
      noAnimalsFound: 'No animals found',
      tryDifferentSearch: 'Try a different search'
    },
    or: {
      noAnimalsTitle: 'Horiin tokkollee hin galmaa\'ine',
      noAnimalsSubtitle: 'Horii jalqabaa galmeessuun jalqabi',
      noAnimalsFound: 'Horiin tokkollee hin argamne',
      tryDifferentSearch: 'Barbaacha biraa yaali'
    },
    sw: {
      noAnimalsTitle: 'Hakuna mnyama aliyesajiliwa',
      noAnimalsSubtitle: 'Anza kwa kusajili mnyama wako wa kwanza',
      noAnimalsFound: 'Hakuna mnyama aliyepatikana',
      tryDifferentSearch: 'Jaribu utafutaji mwingine'
    }
  };

  const t = translations[language];

  if (animals.length === 0) {
    return (
      <Card className="text-center py-8 sm:py-12 mx-2 sm:mx-0">
        <CardContent className="px-3 sm:px-6">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🐄</div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
            {t.noAnimalsTitle}
          </h3>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            {t.noAnimalsSubtitle}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'table') {
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
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {animals.map((animal) => (
        <ModernAnimalCard
          key={animal.id}
          animal={animal}
          language={language}
          onEdit={onEdit}
          onDelete={onDelete}
          onVaccinate={onVaccinate}
          onTrack={onTrack}
          onSell={onSell}
        />
      ))}
    </div>
  );
};
