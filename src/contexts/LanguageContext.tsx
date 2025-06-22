
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'am' | 'en' | 'or' | 'sw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  getLanguageName: (lang: Language) => string;
  getLanguageFlag: (lang: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('am');

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && ['am', 'en', 'or', 'sw'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const getLanguageName = (lang: Language): string => {
    const names = {
      am: 'አማርኛ',
      en: 'English',
      or: 'Afaan Oromoo',
      sw: 'Kiswahili'
    };
    return names[lang];
  };

  const getLanguageFlag = (lang: Language): string => {
    const flags = {
      am: '🇪🇹',
      en: '🇺🇸',
      or: '🇪🇹',
      sw: '🇹🇿'
    };
    return flags[lang];
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      getLanguageName, 
      getLanguageFlag 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
