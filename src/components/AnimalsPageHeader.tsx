
import React from 'react';
import { Language } from '@/types';

interface AnimalsPageHeaderProps {
  language: Language;
}

export const AnimalsPageHeader = ({ language }: AnimalsPageHeaderProps) => {
  const translations = {
    am: {
      title: 'የእንስሳዎች አስተዳደር',
      subtitle: 'እንስሳዎችዎን ይመዝግቡ እና ያስተዳድሩ'
    },
    en: {
      title: 'Animals Management',
      subtitle: 'Register and manage your animals'
    },
    or: {
      title: 'Bulchiinsa Horii',
      subtitle: 'Horii keessan galmeessaa fi bulchaa'
    },
    sw: {
      title: 'Usimamizi wa Wanyamapori',
      subtitle: 'Sajili na dhibiti wanyamapori wako'
    }
  };

  const t = translations[language];

  return (
    <div className="text-center px-2">
      <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
        🐄 {t.title}
      </h1>
      <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
        {t.subtitle}
      </p>
    </div>
  );
};
