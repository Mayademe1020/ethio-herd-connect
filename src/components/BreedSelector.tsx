import React, { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { Language } from '@/types';
import { AnimalType, BreedRegistryService } from '@/utils/breedRegistry';
import { useTranslations } from '@/hooks/useTranslations';

interface BreedSelectorProps {
  animalType: string; // Form animal type (cow, bull, sheep, etc.)
  selectedBreed: string;
  customBreed?: string;
  onBreedChange: (breed: string, isCustom: boolean) => void;
  onCustomBreedChange?: (customBreed: string) => void;
  language: Language;
  disabled?: boolean;
  required?: boolean;
}

/**
 * BreedSelector Component
 * 
 * Provides dynamic breed selection based on animal type with support for:
 * - Ethiopian livestock breeds
 * - Search/filter functionality
 * - Custom breed descriptions for unknown breeds
 * - Multi-language support (English/Amharic)
 */
export const BreedSelector: React.FC<BreedSelectorProps> = ({
  animalType,
  selectedBreed,
  customBreed = '',
  onBreedChange,
  onCustomBreedChange,
  language,
  disabled = false,
  required = false
}) => {
  const { t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Get breed options for the selected animal type
  const breedOptions = useMemo(() => {
    if (!animalType) return [];
    
    if (searchQuery.trim()) {
      // Use search if query exists
      const breedType = BreedRegistryService.getBreedsByFormAnimalType(animalType, language);
      return breedType;
    }
    
    return BreedRegistryService.getBreedsByFormAnimalType(animalType, language);
  }, [animalType, language, searchQuery]);

  // Check if current selection is custom breed
  const isCustomBreedSelected = useMemo(() => {
    return BreedRegistryService.isCustomBreed(selectedBreed);
  }, [selectedBreed]);

  // Update custom input visibility when breed selection changes
  useEffect(() => {
    setShowCustomInput(isCustomBreedSelected);
  }, [isCustomBreedSelected]);

  // Reset breed selection when animal type changes
  useEffect(() => {
    if (animalType && selectedBreed) {
      // Validate that selected breed is valid for new animal type
      const isValid = BreedRegistryService.isValidBreedForFormType(animalType, selectedBreed);
      if (!isValid && !isCustomBreedSelected) {
        // Reset breed if it's not valid for the new animal type
        onBreedChange('', false);
        setSearchQuery('');
      }
    }
  }, [animalType]); // Only run when animalType changes

  const handleBreedSelect = (breedId: string) => {
    const isCustom = BreedRegistryService.isCustomBreed(breedId);
    onBreedChange(breedId, isCustom);
    setShowCustomInput(isCustom);
    
    // Clear custom breed text if switching to standard breed
    if (!isCustom && onCustomBreedChange) {
      onCustomBreedChange('');
    }
  };

  const handleCustomBreedChange = (value: string) => {
    if (onCustomBreedChange) {
      onCustomBreedChange(value);
    }
  };

  // Get breed characteristics for tooltip
  const selectedBreedInfo = useMemo(() => {
    if (!selectedBreed || isCustomBreedSelected) return null;
    return BreedRegistryService.getBreedCharacteristics(selectedBreed, language);
  }, [selectedBreed, isCustomBreedSelected, language]);

  const isDisabled = disabled || !animalType;

  return (
    <div className="space-y-4">
      {/* Breed Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="breed">
            {t('animals.breed')}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {selectedBreedInfo && (
            <div className="flex items-center text-xs text-gray-500">
              <Info className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">{selectedBreedInfo}</span>
            </div>
          )}
        </div>

        <Select
          value={selectedBreed}
          onValueChange={handleBreedSelect}
          disabled={isDisabled}
        >
          <SelectTrigger 
            id="breed"
            className="border-ethiopia-green-200 focus:border-ethiopia-green-500"
          >
            <SelectValue 
              placeholder={
                isDisabled 
                  ? t('animals.selectAnimalTypeFirst') || 'Select animal type first'
                  : t('animals.selectBreed') || 'Select breed'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {breedOptions.length === 0 ? (
              <div className="p-2 text-sm text-gray-500 text-center">
                {t('animals.noBreeds') || 'No breeds available'}
              </div>
            ) : (
              breedOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {!isDisabled && breedOptions.length === 0 && animalType && (
          <p className="text-xs text-amber-600">
            {t('animals.noBreedsDefined') || 'No breeds defined for this animal type'}
          </p>
        )}
      </div>

      {/* Custom Breed Input */}
      {showCustomInput && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <Label htmlFor="customBreed">
              {t('animals.customBreedDescription') || 'Breed Description'}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Badge variant="outline" className="text-xs">
              {t('animals.custom') || 'Custom'}
            </Badge>
          </div>
          
          <Input
            id="customBreed"
            value={customBreed}
            onChange={(e) => handleCustomBreedChange(e.target.value)}
            placeholder={
              t('animals.customBreedPlaceholder') || 
              "Describe the breed (e.g., 'White with black spots, medium size')"
            }
            className="border-ethiopia-green-200 focus:border-ethiopia-green-500"
            maxLength={200}
            disabled={disabled}
          />
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {t('animals.customBreedHelper') || 
                'Describe color, size, or local name'}
            </span>
            <span>{customBreed.length}/200</span>
          </div>
        </div>
      )}
    </div>
  );
};
