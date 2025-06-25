
import React from 'react';
import { Language } from '@/types';

interface AnimalsPageHeaderProps {
  language: Language;
}

export const AnimalsPageHeader = ({ language }: AnimalsPageHeaderProps) => {
  const translations = {
    am: {
      title: 'እንስሳቶቼ',
      subtitle: 'የእርስዎን እንስሳቶች ያስተዳድሩ እና ይከታተሉ'
    },
    en: {
      title: 'My Animals',
      subtitle: 'Manage and monitor your livestock'
    },
    or: {
      title: 'Horii Koo',
      subtitle: 'Horii keessan bulchuu fi hordofuu'
    },
    sw: {
      title: 'Wanyama Wangu',
      subtitle: 'Simamia na ufuatilie mifugo wako'
    }
  };

  const t = translations[language];

  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        🐄 {t.title}
      </h1>
      <p className="text-gray-600">
        {t.subtitle}
      </p>
    </div>
  );
};
