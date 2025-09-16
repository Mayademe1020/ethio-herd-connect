import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages } from 'lucide-react';

export const LanguageSelector = () => {
  const { language, setLanguage, getLanguageName, getLanguageFlag } = useLanguage();

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-auto min-w-[140px] h-12 border-2 border-emerald-200 focus:border-emerald-500 bg-white/90 backdrop-blur-sm">
        <SelectValue>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getLanguageFlag(language)}</span>
            <span className="font-medium text-gray-700">{getLanguageName(language)}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {(['am', 'en', 'or'] as const).map((lang) => (
          <SelectItem key={lang} value={lang}>
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getLanguageFlag(lang)}</span>
              <span className="font-medium">{getLanguageName(lang)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};