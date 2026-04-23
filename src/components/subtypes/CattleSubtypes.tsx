// src/components/subtypes/CattleSubtypes.tsx - Lazy loaded cattle subtypes component
import { Card, CardContent } from '@/components/ui/card';

interface SubtypeOption {
  value: string;
  icon: string;
  translationKey: string;
  description?: string;
}

// Import the cattle subtypes data
import { cattleSubtypes } from '@/data/cattleSubtypes';

interface CattleSubtypesProps {
  selectedSubtype: string | null;
  onSelectSubtype: (subtype: string) => void;
}

export default function CattleSubtypes({ selectedSubtype, onSelectSubtype }: CattleSubtypesProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cattleSubtypes.map((option) => {
        const isSelected = selectedSubtype === option.value;
        
        return (
          <Card
            key={option.value}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-95 ${
              isSelected
                ? 'ring-4 ring-primary border-primary shadow-lg bg-green-50'
                : 'border-gray-200 hover:border-primary'
            }`}
            onClick={() => onSelectSubtype(option.value)}
          >
            <CardContent className="p-3 sm:p-4 text-center min-h-[100px] flex flex-col items-center justify-center">
              {/* Icon */}
              <div className="text-3xl sm:text-4xl mb-1">
                {option.icon}
              </div>
              
              {/* Label */}
              <div className="font-bold text-sm sm:text-base text-gray-800">
                {option.value}
              </div>
              
              {/* Description */}
              {option.description && (
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {option.description}
                </div>
              )}
              
              {/* Selection indicator */}
              {isSelected && (
                <div className="mt-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}