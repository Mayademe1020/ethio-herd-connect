import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'am' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isAmharic: boolean;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'ethio-herd-language';

// Default to Amharic for Ethiopian users
const getDefaultLanguage = (): Language => {
  // Check localStorage first
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'am' || stored === 'en') {
    return stored as Language;
  }
  
  // Default to Amharic for Ethiopian context
  return 'am';
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getDefaultLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lang === 'am' ? 'am' : 'en';
  };

  useEffect(() => {
    // Set initial HTML lang attribute
    document.documentElement.lang = language === 'am' ? 'am' : 'en';
  }, []);

  const value: LanguageContextType = {
    language,
    setLanguage,
    isAmharic: language === 'am',
    isEnglish: language === 'en',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
