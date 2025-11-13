// src/components/AnimalSubtypeSelector.tsx - Dynamic subtype selector based on animal type

import { Card, CardContent } from '@/components/ui/card';
import { AnimalType } from './AnimalTypeSelector';
import { useTranslation } from '@/hooks/useTranslation';

interface SubtypeOption {
  value: string;
  icon: string;
  translationKey: string;
}

// Simple subtype configurations for each animal type (3-click process)
const SUBTYPES: Record<AnimalType, SubtypeOption[]> = {
  cattle: [
    {
      value: 'Cow',
      icon: '🐄',
      translationKey: 'animalTypes.cow'
    },
    {
      value: 'Bull',
      icon: '🐂',
      translationKey: 'animalTypes.bull'
    },
    {
      value: 'Ox',
      icon: '🐃',
      translationKey: 'animalTypes.ox'
    },
    {
      value: 'Calf',
      icon: '🐮',
      translationKey: 'animalTypes.calf'
    }
  ],
  goat: [
    {
      value: 'Male Goat',
      icon: '🐐',
      translationKey: 'animalTypes.maleGoat'
    },
    {
      value: 'Female Goat',
      icon: '🐐',
      translationKey: 'animalTypes.femaleGoat'
    }
  ],
  sheep: [
    {
      value: 'Ram',
      icon: '🐏',
      translationKey: 'animalTypes.ram'
    },
    {
      value: 'Ewe',
      icon: '🐑',
      translationKey: 'animalTypes.ewe'
    }
  ]
};

interface AnimalSubtypeSelectorProps {
  animalType: AnimalType;
  selectedSubtype: string | null;
  onSelectSubtype: (subtype: string) => void;
}

export const AnimalSubtypeSelector = ({
  animalType,
  selectedSubtype,
  onSelectSubtype
}: AnimalSubtypeSelectorProps) => {
  // Get all subtypes for the animal type (simple 3-click process)
  const subtypes = SUBTYPES[animalType];

  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4">
      {subtypes.map((option) => {
        const isSelected = selectedSubtype === option.value;
        
        return (
          <Card
            key={option.value}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-95 ${
              isSelected
                ? 'ring-4 ring-primary border-primary shadow-lg'
                : 'border-gray-200 hover:border-primary'
            }`}
            onClick={() => onSelectSubtype(option.value)}
          >
            <CardContent className="p-6 text-center min-h-[140px] flex flex-col items-center justify-center">
              {/* Icon */}
              <div className="text-5xl sm:text-6xl mb-3">
                {option.icon}
              </div>
              
              {/* Label */}
              <div className="font-bold text-base sm:text-lg text-gray-800">
                {t(option.translationKey)}
              </div>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="mt-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✓</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
