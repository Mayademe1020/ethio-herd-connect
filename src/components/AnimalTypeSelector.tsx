// src/components/AnimalTypeSelector.tsx - Visual animal type selection component

import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

export type AnimalType = 'cattle' | 'goat' | 'sheep';

interface AnimalTypeOption {
  type: AnimalType;
  icon: string;
  name: string;
  description: string;
  gradient: string;
  hoverColor: string;
}

const ANIMAL_TYPES: AnimalTypeOption[] = [
  {
    type: 'cattle',
    icon: '🐄',
    name: 'Cattle',
    description: 'Cows, Bulls & Oxen',
    gradient: 'from-blue-50 to-blue-100',
    hoverColor: 'hover:border-blue-400'
  },
  {
    type: 'goat',
    icon: '🐐',
    name: 'Goats',
    description: 'Adult & Young Goats',
    gradient: 'from-orange-50 to-orange-100',
    hoverColor: 'hover:border-orange-400'
  },
  {
    type: 'sheep',
    icon: '🐑',
    name: 'Sheep',
    description: 'Adult & Lambs',
    gradient: 'from-purple-50 to-purple-100',
    hoverColor: 'hover:border-purple-400'
  }
];

interface AnimalTypeSelectorProps {
  selectedType: AnimalType | null;
  onSelectType: (type: AnimalType) => void;
}

export const AnimalTypeSelector = ({ selectedType, onSelectType }: AnimalTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {ANIMAL_TYPES.map((option) => {
        const isSelected = selectedType === option.type;
        
        return (
          <Card
            key={option.type}
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-95 relative overflow-hidden ${
              isSelected
                ? 'ring-2 ring-emerald-500 border-emerald-400 shadow-lg'
                : `border-gray-200 ${option.hoverColor} hover:shadow-md`
            }`}
            onClick={() => onSelectType(option.type)}
          >
            <CardContent className={`p-6 sm:p-8 text-center min-h-[180px] flex flex-col items-center justify-center relative z-10 bg-gradient-to-br ${option.gradient}`}>
              {/* Background decoration */}
              <div className={`absolute inset-0 bg-gradient-to-br opacity-5 ${option.gradient} transition-opacity duration-300`}></div>
              
              {/* Icon with animation */}
              <div className={`text-5xl sm:text-6xl mb-4 transform transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                {option.icon}
              </div>
              
              {/* Name */}
              <h3 className={`font-bold text-lg sm:text-xl mb-2 transition-colors duration-200 ${
                isSelected ? 'text-emerald-700' : 'text-gray-800'
              }`}>
                {option.name}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {option.description}
              </p>
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-white text-lg">✓</span>
                </div>
              )}
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
