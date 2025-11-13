import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

export type AnimalGender = 'male' | 'female';

interface GenderOption {
  value: AnimalGender;
  icon: string;
  translationKey: string;
  descriptionKey: string;
}

const GENDER_OPTIONS: GenderOption[] = [
  {
    value: 'male',
    icon: '♂️',
    translationKey: 'animalGender.male',
    descriptionKey: 'animalGender.maleDesc'
  },
  {
    value: 'female',
    icon: '♀️',
    translationKey: 'animalGender.female',
    descriptionKey: 'animalGender.femaleDesc'
  }
];

interface AnimalGenderSelectorProps {
  selectedGender: AnimalGender | null;
  onSelectGender: (gender: AnimalGender) => void;
}

export const AnimalGenderSelector: React.FC<AnimalGenderSelectorProps> = ({
  selectedGender,
  onSelectGender
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4">
      {GENDER_OPTIONS.map((option) => {
        const isSelected = selectedGender === option.value;

        return (
          <Card
            key={option.value}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-95 ${
              isSelected
                ? 'ring-4 ring-primary border-primary shadow-lg'
                : 'border-gray-200 hover:border-primary'
            }`}
            onClick={() => onSelectGender(option.value)}
          >
            <CardContent className="p-6 text-center min-h-[140px] flex flex-col items-center justify-center">
              {/* Icon */}
              <div className="text-6xl mb-3">
                {option.icon}
              </div>

              {/* Label */}
              <div className="font-bold text-lg text-gray-800 mb-1">
                {t(option.translationKey)}
              </div>

              {/* Description */}
              <div className="text-sm text-gray-600">
                {t(option.descriptionKey)}
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

export default AnimalGenderSelector;