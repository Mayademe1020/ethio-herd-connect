import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type CountryCode = 'ET' | 'KE' | 'UG' | 'TZ' | 'RW';

interface CountryContextValue {
  country: CountryCode;
  setCountry: (code: CountryCode) => void;
  getCountryName: (code: CountryCode) => string;
  getCountryFlag: (code: CountryCode) => string;
}

const CountryContext = createContext<CountryContextValue | undefined>(undefined);

const COUNTRY_NAMES: Record<CountryCode, string> = {
  ET: 'Ethiopia',
  KE: 'Kenya',
  UG: 'Uganda',
  TZ: 'Tanzania',
  RW: 'Rwanda',
};

const COUNTRY_FLAGS: Record<CountryCode, string> = {
  ET: '🇪🇹',
  KE: '🇰🇪',
  UG: '🇺🇬',
  TZ: '🇹🇿',
  RW: '🇷🇼',
};

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const [country, setCountry] = useState<CountryCode>('ET');

  const deriveCountryFromPhone = (phone?: string): CountryCode | null => {
    if (!phone) return null;
    const normalized = phone.replace(/\s|\-/g, '');
    if (normalized.startsWith('+251') || normalized.startsWith('251')) return 'ET';
    if (normalized.startsWith('+254') || normalized.startsWith('254')) return 'KE';
    if (normalized.startsWith('+256') || normalized.startsWith('256')) return 'UG';
    if (normalized.startsWith('+255') || normalized.startsWith('255')) return 'TZ';
    if (normalized.startsWith('+250') || normalized.startsWith('250')) return 'RW';
    return null;
  };

  // Initialize from localStorage (manual selection takes precedence)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('country');
      if (stored && ['ET','KE','UG','TZ','RW'].includes(stored)) {
        setCountry(stored as CountryCode);
      }
    } catch {}
  }, []);

  // If no stored country, derive from the user's phone number when available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('country');
      if (stored && ['ET','KE','UG','TZ','RW'].includes(stored)) {
        // Respect manual/previous selection, do not override
        return;
      }
      const derived = deriveCountryFromPhone(userProfile?.mobile_number);
      if (derived) {
        setCountry(derived);
      }
    } catch {}
  }, [userProfile?.mobile_number]);

  // Persist selection
  useEffect(() => {
    try {
      localStorage.setItem('country', country);
    } catch {}
  }, [country]);

  return (
    <CountryContext.Provider
      value={{
        country,
        setCountry,
        getCountryName: (code) => COUNTRY_NAMES[code],
        getCountryFlag: (code) => COUNTRY_FLAGS[code],
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = (): CountryContextValue => {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used within CountryProvider');
  return ctx;
};