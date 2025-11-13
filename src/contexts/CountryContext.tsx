// src/contexts/CountryContext.tsx - Simplified Ethiopia-only context

import React, { createContext, useContext } from 'react';
import { ETHIOPIA_CONSTANTS } from '@/constants/ethiopia';

export interface CountryContextValue {
  country: string;
  countryName: string;
  countryNameAmharic: string;
  phonePrefix: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
}

const CountryContext = createContext<CountryContextValue | undefined>(undefined);

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always Ethiopia - no state needed for single country
  const value: CountryContextValue = {
    country: ETHIOPIA_CONSTANTS.COUNTRY_CODE,
    countryName: ETHIOPIA_CONSTANTS.COUNTRY_NAME,
    countryNameAmharic: ETHIOPIA_CONSTANTS.COUNTRY_NAME_AMHARIC,
    phonePrefix: ETHIOPIA_CONSTANTS.PHONE_COUNTRY_CODE,
    currency: ETHIOPIA_CONSTANTS.CURRENCY_CODE,
    currencySymbol: ETHIOPIA_CONSTANTS.CURRENCY_SYMBOL,
    timezone: ETHIOPIA_CONSTANTS.TIMEZONE,
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = (): CountryContextValue => {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used within CountryProvider');
  return ctx;
};