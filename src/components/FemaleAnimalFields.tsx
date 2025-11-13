import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from '@/hooks/useTranslations';

export interface FemaleAnimalData {
  pregnancyStatus: 'not_pregnant' | 'pregnant' | 'recently_delivered' | '';
  lactationStatus: 'lactating' | 'dry' | '';
  milkProductionPerDay?: number;
  expectedDeliveryDate?: string;
}

interface FemaleAnimalFieldsProps {
  animalSubtype: string;
  data: FemaleAnimalData;
  onChange: (data: FemaleAnimalData) => void;
}

export const FemaleAnimalFields: React.FC<FemaleAnimalFieldsProps> = ({
  animalSubtype,
  data,
  onChange
}) => {
  const { t } = useTranslations();

  // Determine if animal is female
  const isFemale = ['Cow', 'Female Goat', 'Ewe', 'Female', 'Hen'].includes(animalSubtype);

  if (!isFemale) {
    return null;
  }

  // Get delivery term based on animal type
  const getDeliveryTerm = () => {
    if (animalSubtype === 'Cow') return t('marketplace.calved');
    if (animalSubtype === 'Female Goat') return t('marketplace.kidded');
    if (animalSubtype === 'Ewe') return t('marketplace.lambed');
    return t('marketplace.delivered');
  };

  const handlePregnancyStatusChange = (value: string) => {
    const newData = {
      ...data,
      pregnancyStatus: value as FemaleAnimalData['pregnancyStatus']
    };
    
    // Clear expected delivery date if not pregnant
    if (value !== 'pregnant') {
      newData.expectedDeliveryDate = undefined;
    }
    
    onChange(newData);
  };

  const handleLactationStatusChange = (value: string) => {
    const newData = {
      ...data,
      lactationStatus: value as FemaleAnimalData['lactationStatus']
    };
    
    // Clear milk production if not lactating
    if (value !== 'lactating') {
      newData.milkProductionPerDay = undefined;
    }
    
    onChange(newData);
  };

  const handleMilkProductionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || undefined;
    onChange({
      ...data,
      milkProductionPerDay: value
    });
  };

  const handleExpectedDeliveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...data,
      expectedDeliveryDate: e.target.value || undefined
    });
  };

  return (
    <div className="space-y-4 p-4 bg-pink-50 rounded-lg border-2 border-pink-200">
      <div className="flex items-center space-x-2">
        <span className="text-2xl">♀</span>
        <h3 className="text-lg font-semibold text-pink-900">
          {t('marketplace.femaleAnimalInfo')}
        </h3>
      </div>

      {/* Pregnancy Status */}
      <div className="space-y-2">
        <Label htmlFor="pregnancy-status" className="text-base font-medium">
          {t('marketplace.pregnancyStatus')}
        </Label>
        <Select
          value={data.pregnancyStatus}
          onValueChange={handlePregnancyStatusChange}
        >
          <SelectTrigger id="pregnancy-status" className="h-12">
            <SelectValue placeholder={t('marketplace.selectPregnancyStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_pregnant">
              {t('marketplace.notPregnant')}
            </SelectItem>
            <SelectItem value="pregnant">
              {t('marketplace.pregnant')}
            </SelectItem>
            <SelectItem value="recently_delivered">
              {t('marketplace.recently')} {getDeliveryTerm()}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expected Delivery Date (only if pregnant) */}
      {data.pregnancyStatus === 'pregnant' && (
        <div className="space-y-2">
          <Label htmlFor="expected-delivery" className="text-base font-medium">
            {t('marketplace.expectedDeliveryDate')}
          </Label>
          <Input
            id="expected-delivery"
            type="date"
            value={data.expectedDeliveryDate || ''}
            onChange={handleExpectedDeliveryChange}
            className="h-12"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      )}

      {/* Lactation Status */}
      <div className="space-y-2">
        <Label htmlFor="lactation-status" className="text-base font-medium">
          {t('marketplace.lactationStatus')}
        </Label>
        <Select
          value={data.lactationStatus}
          onValueChange={handleLactationStatusChange}
        >
          <SelectTrigger id="lactation-status" className="h-12">
            <SelectValue placeholder={t('marketplace.selectLactationStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lactating">
              {t('marketplace.lactating')}
            </SelectItem>
            <SelectItem value="dry">
              {t('marketplace.dry')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Milk Production Per Day (only if lactating) */}
      {data.lactationStatus === 'lactating' && (
        <div className="space-y-2">
          <Label htmlFor="milk-production" className="text-base font-medium">
            {t('marketplace.milkProductionPerDay')}
          </Label>
          <div className="relative">
            <Input
              id="milk-production"
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              max="50"
              value={data.milkProductionPerDay || ''}
              onChange={handleMilkProductionChange}
              placeholder="0"
              className="h-12 pr-16"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
              {t('milk.liters')}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {t('marketplace.milkProductionHelper')}
          </p>
        </div>
      )}
    </div>
  );
};
