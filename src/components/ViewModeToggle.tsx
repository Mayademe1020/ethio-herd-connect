
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';
import { Language } from '@/types';

interface ViewModeToggleProps {
  viewMode: 'card' | 'table';
  onViewModeChange: (mode: 'card' | 'table') => void;
  language: Language;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  language
}) => {
  const translations = {
    am: { card: 'ካርድ', table: 'ሰንጠረዥ' },
    en: { card: 'Card', table: 'Table' },
    or: { card: 'Kaardii', table: 'Gabatee' },
    sw: { card: 'Kadi', table: 'Jedwali' }
  };

  const t = translations[language];

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <Button
        variant={viewMode === 'card' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('card')}
        className="h-7 sm:h-8 lg:h-9 px-2 sm:px-3 text-xs sm:text-sm transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
      >
        <Grid className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        <span className="hidden sm:inline">{t.card}</span>
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className="h-7 sm:h-8 lg:h-9 px-2 sm:px-3 text-xs sm:text-sm transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
      >
        <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        <span className="hidden sm:inline">{t.table}</span>
      </Button>
    </div>
  );
};
