import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from '@/hooks/useTranslations';

interface PriceInputProps {
  value: number;
  isNegotiable: boolean;
  onPriceChange: (price: number) => void;
  onNegotiableChange: (negotiable: boolean) => void;
  error?: string;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  isNegotiable,
  onPriceChange,
  onNegotiableChange,
  error
}) => {
  const { t } = useTranslations();
  const [displayValue, setDisplayValue] = useState<string>('');

  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  // Parse formatted string back to number
  const parseNumber = (str: string): number => {
    return parseInt(str.replace(/,/g, ''), 10) || 0;
  };

  // Initialize display value
  useEffect(() => {
    if (value > 0) {
      setDisplayValue(formatNumber(value));
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Remove non-numeric characters except commas
    const cleaned = input.replace(/[^\d,]/g, '');
    
    // Parse to number
    const numericValue = parseNumber(cleaned);
    
    // Validate range
    if (numericValue <= 1000000) {
      setDisplayValue(cleaned);
      onPriceChange(numericValue);
    }
  };

  const handleBlur = () => {
    // Reformat on blur
    const numericValue = parseNumber(displayValue);
    if (numericValue > 0) {
      setDisplayValue(formatNumber(numericValue));
    }
  };

  const handleFocus = () => {
    // Remove formatting on focus for easier editing
    const numericValue = parseNumber(displayValue);
    if (numericValue > 0) {
      setDisplayValue(numericValue.toString());
    }
  };

  // Validation
  const getValidationError = (): string | null => {
    const numericValue = parseNumber(displayValue);
    
    if (numericValue === 0) {
      return null; // No error if empty
    }
    
    if (numericValue < 100) {
      return t('marketplace.priceMinError');
    }
    
    if (numericValue > 1000000) {
      return t('marketplace.priceMaxError');
    }
    
    return null;
  };

  const validationError = error || getValidationError();

  return (
    <div className="space-y-4">
      {/* Price Input */}
      <div className="space-y-2">
        <Label htmlFor="price" className="text-base font-semibold">
          {t('marketplace.price')}
        </Label>
        <div className="relative">
          <Input
            id="price"
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="0"
            className={`text-lg h-14 pr-16 ${
              validationError ? 'border-red-500 focus:ring-red-500' : ''
            }`}
            aria-invalid={!!validationError}
            aria-describedby={validationError ? 'price-error' : undefined}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
            ETB
          </div>
        </div>
        
        {/* Validation Error */}
        {validationError && (
          <p id="price-error" className="text-sm text-red-600 flex items-center space-x-1">
            <span>⚠️</span>
            <span>{validationError}</span>
          </p>
        )}
        
        {/* Helper Text */}
        {!validationError && (
          <p className="text-sm text-gray-500">
            {t('marketplace.priceHelper')}
          </p>
        )}
      </div>

      {/* Negotiable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <Label htmlFor="negotiable" className="text-base font-medium cursor-pointer">
            {t('marketplace.negotiable')}
          </Label>
          <p className="text-sm text-gray-600 mt-1">
            {t('marketplace.negotiableHelper')}
          </p>
        </div>
        <Switch
          id="negotiable"
          checked={isNegotiable}
          onCheckedChange={onNegotiableChange}
          className="ml-4"
          aria-label={t('marketplace.negotiable')}
        />
      </div>
    </div>
  );
};
