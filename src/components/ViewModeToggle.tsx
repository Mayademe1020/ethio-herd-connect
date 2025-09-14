
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';
import { Language } from '@/types';

interface ViewModeToggleProps {
  viewMode: 'card' | 'table';
  onViewModeChange: (mode: 'card' | 'table') => void;
  language: Language;
}

export const ViewModeToggle = ({
  viewMode,
  onViewModeChange,
  language
}: ViewModeToggleProps) => {
  const translations = {
    am: {
      cardView: 'ሳጥን እይታ',
      tableView: 'ዝርዝር እይታ'
    },
    en: {
      cardView: 'Box View',
      tableView: 'List View'
    },
    or: {
      cardView: "Mul'akkaa Saanduqaa",
      tableView: "Mul'akkaa Tarree"
    },
    sw: {
      cardView: 'Mwongozo wa Sanduku',
      tableView: 'Mwongozo wa Orodha'
    }
  };

  const t = translations[language];

  return (
    <div className="flex space-x-3">
      <Button
        variant={viewMode === 'card' ? 'default' : 'outline'}
        size="lg"
        onClick={() => onViewModeChange('card')}
        className="farmer-button flex items-center space-x-3 view-transition-enter"
      >
        <Grid3X3 className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">{t.cardView}</span>
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'outline'}
        size="lg"
        onClick={() => onViewModeChange('table')}
        className="farmer-button flex items-center space-x-3 view-transition-enter"
      >
        <List className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">{t.tableView}</span>
      </Button>
    </div>
  );
};
