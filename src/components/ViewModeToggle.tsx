
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';

interface ViewModeToggleProps {
  viewMode: 'card' | 'table';
  onViewModeChange: (mode: 'card' | 'table') => void;
}

export const ViewModeToggle = ({ viewMode, onViewModeChange }: ViewModeToggleProps) => {
  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <Button
        size="sm"
        variant={viewMode === 'card' ? 'default' : 'ghost'}
        onClick={() => onViewModeChange('card')}
        className="h-8 px-3"
      >
        <Grid className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        onClick={() => onViewModeChange('table')}
        className="h-8 px-3"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
};
