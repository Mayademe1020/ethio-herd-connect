// src/components/AnimalTypeSelector.tsx - Visual animal type selection component

import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

export type AnimalType = 'cattle' | 'goat' | 'sheep';

interface AnimalTypeOption {
  type: AnimalType;
  icon: string;
  translationKey: string;
}

const ANIMAL_TYPES: AnimalTypeOption[] = [
  {
    type: 'cattle',
    icon: '🐄',
    translationKey: 'animalTypes.cattle'
  },
  {
    type: 'goat',
    icon: '🐐',
    translationKey: 'animalTypes.goat'
  },
  {
    type: 'sheep',
    icon: '🐑',
    translationKey: 'animalTypes.sheep'
  }
];

interface AnimalTypeSelectorProps {
  selectedType: AnimalType | null;
  onSelectType: (type: AnimalType) => void;
}

export const AnimalTypeSelector = ({ selectedType, onSelectType }: AnimalTypeSelectorProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {ANIMAL_TYPES.map((option) => {
        const isSelected = selectedType === option.type;
        
        return (
          <Card
            key={option.type}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-95 ${
              isSelected
                ? 'ring-4 ring-primary border-primary shadow-lg'
                : 'border-gray-200 hover:border-primary'
            }`}
            onClick={() => onSelectType(option.type)}
          >
            <CardContent className="p-6 sm:p-8 text-center min-h-[160px] flex flex-col items-center justify-center">
              {/* Icon */}
              <div className="text-6xl sm:text-7xl mb-4">
                {option.icon}
              </div>
              
              {/* Label */}
              <div className="font-bold text-lg sm:text-xl text-gray-800">
                {t(option.translationKey)}
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="mt-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✓</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
