
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Droplets, DollarSign, BarChart3, Filter } from 'lucide-react';
import { Language } from '@/types';

interface QuickActionButtonsProps {
  language: Language;
  onAddAnimal: () => void;
  onRecordMilk: () => void;
  onAddFinancial: () => void;
  onViewAnalytics: () => void;
  onToggleFilters: () => void;
}

export const QuickActionButtons = ({
  language,
  onAddAnimal,
  onRecordMilk,
  onAddFinancial,
  onViewAnalytics,
  onToggleFilters
}: QuickActionButtonsProps) => {
  const translations = {
    am: {
      addAnimal: 'እንስሳ ጨምር',
      recordMilk: 'ወተት መዝግብ',
      addTransaction: 'ገንዘብ ጨምር',
      analytics: 'ትንተና',
      filters: 'ማጣሪያ'
    },
    en: {
      addAnimal: 'Add Animal',
      recordMilk: 'Record Milk',
      addTransaction: 'Add Transaction',
      analytics: 'Analytics',
      filters: 'Filters'
    },
    or: {
      addAnimal: 'Horii Dabali',
      recordMilk: 'Aannan Galmeessi',
      addTransaction: 'Maallaqaa Dabali',
      analytics: 'Xiinxala',
      filters: 'Calaluu'
    },
    sw: {
      addAnimal: 'Ongeza Mnyama',
      recordMilk: 'Rekodi Maziwa',
      addTransaction: 'Ongeza Muamala',
      analytics: 'Uchambuzi',
      filters: 'Vichuja'
    }
  };

  const t = translations[language];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        onClick={onAddAnimal}
        className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t.addAnimal}
      </Button>

      <Button
        onClick={onRecordMilk}
        variant="outline"
        className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 hover:scale-105"
      >
        <Droplets className="w-4 h-4 mr-2" />
        {t.recordMilk}
      </Button>

      <Button
        onClick={onAddFinancial}
        variant="outline"
        className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 hover:scale-105"
      >
        <DollarSign className="w-4 h-4 mr-2" />
        {t.addTransaction}
      </Button>

      <Button
        onClick={onViewAnalytics}
        variant="outline"
        className="border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200 hover:scale-105"
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        {t.analytics}
      </Button>

      <Button
        onClick={onToggleFilters}
        variant="outline"
        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-105"
      >
        <Filter className="w-4 h-4 mr-2" />
        {t.filters}
      </Button>
    </div>
  );
};
