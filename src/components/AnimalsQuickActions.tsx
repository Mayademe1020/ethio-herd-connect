
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Filter, Download } from 'lucide-react';
import { Language } from '@/types';

interface AnimalsQuickActionsProps {
  language: Language;
  onAddAnimal: () => void;
  onBulkImport: () => void;
  onToggleFilters: () => void;
  onExport: () => void;
}

export const AnimalsQuickActions = ({
  language,
  onAddAnimal,
  onBulkImport,
  onToggleFilters,
  onExport
}: AnimalsQuickActionsProps) => {
  const translations = {
    am: {
      addAnimal: 'እንስሳ ይጨምሩ',
      bulkImport: 'ጅምላ አስመጣ',
      filter: 'ማጣሪያ',
      export: 'ወደ ውጭ አውጣ'
    },
    en: {
      addAnimal: 'Add Animal',
      bulkImport: 'Bulk Import',
      filter: 'Filter',
      export: 'Export'
    },
    or: {
      addAnimal: 'Horii Dabaluu',
      bulkImport: 'Baay\'ee Galchuu',
      filter: 'Calaqqisiisu',
      export: 'Gadi Baasuu'
    },
    sw: {
      addAnimal: 'Ongeza Mnyama',
      bulkImport: 'Ingiza Wingi',
      filter: 'Chuja',
      export: 'Hamisha'
    }
  };

  const t = translations[language];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
      <Button 
        onClick={onAddAnimal}
        className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        <span className="font-medium text-center leading-tight">{t.addAnimal}</span>
      </Button>

      <Button 
        variant="outline" 
        onClick={onBulkImport}
        className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
      >
        <Upload className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-500" />
        <span className="font-medium text-center leading-tight">{t.bulkImport}</span>
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onToggleFilters}
        className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 border-purple-200 hover:bg-purple-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
      >
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-500" />
        <span className="font-medium text-center leading-tight">{t.filter}</span>
      </Button>

      <Button 
        variant="outline" 
        onClick={onExport}
        className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 border-green-200 hover:bg-green-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
      >
        <Download className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-500" />
        <span className="font-medium text-center leading-tight">{t.export}</span>
      </Button>
    </div>
  );
};
