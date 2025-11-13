import React, { useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';
import {
  calculateDeliveryDate,
  calculateDaysRemaining,
  isValidBreedingDate,
  getAnimalTypeForPregnancy,
  type AnimalTypeForPregnancy,
} from '@/utils/pregnancyCalculations';

interface PregnancyTrackerProps {
  animalId: string;
  animalSubtype: string;
  onRecordPregnancy: (breedingDate: string, expectedDelivery: string) => void;
  onCancel?: () => void;
}

export const PregnancyTracker: React.FC<PregnancyTrackerProps> = ({
  animalId,
  animalSubtype,
  onRecordPregnancy,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [breedingDate, setBreedingDate] = useState('');
  const [error, setError] = useState('');

  const animalType = getAnimalTypeForPregnancy(animalSubtype);

  if (!animalType) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{t('pregnancy.invalidAnimalType')}</p>
      </div>
    );
  }

  const handleBreedingDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setBreedingDate(date);
    setError('');

    if (date && !isValidBreedingDate(date)) {
      setError(t('pregnancy.futureDate'));
    }
  };

  const calculateExpectedDelivery = (): Date | null => {
    if (!breedingDate || !isValidBreedingDate(breedingDate)) {
      return null;
    }
    return calculateDeliveryDate(breedingDate, animalType);
  };

  const expectedDelivery = calculateExpectedDelivery();
  const daysUntilDelivery = expectedDelivery ? calculateDaysRemaining(expectedDelivery) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!breedingDate) {
      setError(t('pregnancy.breedingDateRequired'));
      return;
    }

    if (!isValidBreedingDate(breedingDate)) {
      setError(t('pregnancy.futureDate'));
      return;
    }

    if (!expectedDelivery) {
      setError(t('pregnancy.calculationError'));
      return;
    }

    onRecordPregnancy(breedingDate, expectedDelivery.toISOString());
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">{t('pregnancy.record')}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Breeding Date Input */}
        <div>
          <label htmlFor="breedingDate" className="block text-sm font-medium text-gray-700 mb-1">
            {t('pregnancy.breedingDate')}
          </label>
          <input
            type="date"
            id="breedingDate"
            value={breedingDate}
            onChange={handleBreedingDateChange}
            max={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('pregnancy.breedingDateHelp')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Expected Delivery Display */}
        {expectedDelivery && !error && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {t('pregnancy.expectedDelivery')}:
              </span>
              <span className="text-sm font-semibold text-blue-700">
                {format(expectedDelivery, 'MMM dd, yyyy')}
              </span>
            </div>
            {daysUntilDelivery !== null && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {t('pregnancy.daysRemaining')}:
                </span>
                <span className="text-sm font-semibold text-blue-700">
                  {daysUntilDelivery} {t('common.days')}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-600 mt-2">
              {t('pregnancy.gestationInfo', {
                type: animalType,
                days: animalType === 'cattle' ? 283 : animalType === 'goat' ? 150 : 147,
              })}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!breedingDate || !!error}
            className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {t('pregnancy.recordButton')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
