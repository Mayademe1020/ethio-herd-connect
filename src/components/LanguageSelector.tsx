import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslations();

  const languages = [
    { code: 'am' as const, name: 'አማርኛ', nativeName: 'Amharic' },
    { code: 'en' as const, name: 'English', nativeName: 'English' },
    { code: 'or' as const, name: 'Afaan Oromoo', nativeName: 'Oromo' },
    { code: 'sw' as const, name: 'Kiswahili', nativeName: 'Swahili' }
  ];

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLanguage(lang.code)}
          className="text-xs"
        >
          {lang.name}
        </Button>
      ))}
    </div>
  );
};