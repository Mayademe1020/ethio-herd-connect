
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';
import { Language } from '@/types';

interface ViewModeToggleProps {
  viewMode: 'card' | 'table';
  onViewModeChange: (mode: 'card' | 'table') => void;
  language: Language;
}

export const ViewModeToggle = ({ viewMode, onViewModeChange, language }: ViewModeToggleProps) => {
  const translations = {
    am: {
      cardView: 'ካርድ እይታ',
      tableView: 'ሰንጠረዥ እይታ'
    },
    en: {
      cardView: 'Card View',
      tableView: 'Table View'
    },
    or: {
      cardView: 'Mul\'ata Kaardii',
      tableView: 'Mul\'ata Gabatee'
    },
    sw: {
      cardView: 'Mwongozo wa Kadi',
      tableView: 'Mwongozo wa Jedwali'
    }
  };

  const t = translations[language];

  return (
    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant={viewMode === 'card' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('card')}
        className="h-8 px-3 text-xs"
        title={t.cardView}
      >
        <Grid className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className="h-8 px-3 text-xs"
        title={t.tableView}
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
};
