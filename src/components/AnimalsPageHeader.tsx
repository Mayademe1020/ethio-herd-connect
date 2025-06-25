
import React from 'react';
import { Language } from '@/types';

interface AnimalsPageHeaderProps {
  language: Language;
}

export const AnimalsPageHeader = ({ language }: AnimalsPageHeaderProps) => {
  const translations = {
    am: {
      title: 'እንስሳቶቼ',
      subtitle: 'የእንስሳቶችዎን መዝገብ ያስተዳድሩ'
    },
    en: {
      title: 'My Animals',
      subtitle: 'Manage your livestock records'
    },
    or: {
      title: 'Horii Koo',
      subtitle: 'Galmee horii keessanii bulchaa'
    },
    sw: {
      title: 'Wanyama Wangu',
      subtitle: 'Simamia rekodi za mifugo yako'
    }
  };

  const t = translations[language];

  return (
    <div className="text-center mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
        🐄 {t.title}
      </h1>
      <p className="text-sm sm:text-base text-gray-600">
        {t.subtitle}
      </p>
    </div>
  );
};
