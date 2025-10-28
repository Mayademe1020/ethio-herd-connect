// src/components/LanguageToggle.tsx - Language toggle button

import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'am' ? 'en' : 'am');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
      style={{ minHeight: '44px', minWidth: '44px' }}
    >
      <Globe className="w-5 h-5 text-gray-700" />
      <span className="font-medium text-gray-700 text-sm">
        {language === 'am' ? 'English' : 'አማርኛ'}
      </span>
    </button>
  );
};
