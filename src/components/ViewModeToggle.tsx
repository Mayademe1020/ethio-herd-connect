
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
      cardView: 'ካርድ እይታ',
      tableView: 'ሠንጠረዥ እይታ'
    },
    en: {
      cardView: 'Card View',
      tableView: 'Table View'
    },
    or: {
      cardView: 'Mul'akkaa Kaardii',
      tableView: 'Mul'akkaa Gabatee'
    },
    sw: {
      cardView: 'Mwongozo wa Kadi',
      tableView: 'Mwongozo wa Jedwali'
    }
  };

  const t = translations[language];

  return (
    <div className="flex space-x-2">
      <Button
        variant={viewMode === 'card' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('card')}
        className="flex items-center space-x-1"
      >
        <Grid3X3 className="w-4 h-4" />
        <span className="hidden sm:inline">{t.cardView}</span>
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className="flex items-center space-x-1"
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">{t.tableView}</span>
      </Button>
    </div>
  );
};
