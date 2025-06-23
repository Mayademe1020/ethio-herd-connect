
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Language } from '@/types';

interface AnimalsQuickActionsProps {
  language: Language;
  onShowRegistrationForm: () => void;
}

export const AnimalsQuickActions = ({ 
  language, 
  onShowRegistrationForm 
}: AnimalsQuickActionsProps) => {
  const translations = {
    am: {
      quickActions: 'ፈጣን ተግባራት',
      addAnimal: 'እንስሳ ጨምር',
      bulkImport: 'በብዛት አስመጣ',
      exportData: 'መረጃ ላክ',
      advancedSearch: 'የላቀ ፍለጋ'
    },
    en: {
      quickActions: 'Quick Actions',
      addAnimal: 'Add Animal',
      bulkImport: 'Bulk Import',
      exportData: 'Export Data',
      advancedSearch: 'Advanced Search'
    },
    or: {
      quickActions: 'Hojiiwwan Saffisaa',
      addAnimal: 'Horii Dabaluu',
      bulkImport: 'Baay\'ee Galchuu',
      exportData: 'Deetaa Erguu',
      advancedSearch: 'Barbaacha Olaanaa'
    },
    sw: {
      quickActions: 'Vitendo vya Haraka',
      addAnimal: 'Ongeza Mnyama',
      bulkImport: 'Ingiza Wingi',
      exportData: 'Hamisha Data',
      advancedSearch: 'Utafutaji wa Hali ya Juu'
    }
  };

  const t = translations[language];

  return (
    <Card className="border-green-100">
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base mb-3 text-gray-800">
          {t.quickActions}
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Button
            onClick={onShowRegistrationForm}
            className="bg-green-600 hover:bg-green-700 h-8 sm:h-9 text-xs sm:text-sm"
            size="sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {t.addAnimal}
          </Button>
          
          <Button
            variant="outline"
            className="border-green-200 text-green-700 hover:bg-green-50 h-8 sm:h-9 text-xs sm:text-sm"
            size="sm"
          >
            <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {t.advancedSearch}
          </Button>
          
          <Button
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 h-8 sm:h-9 text-xs sm:text-sm"
            size="sm"
          >
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {t.bulkImport}
          </Button>
          
          <Button
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 h-8 sm:h-9 text-xs sm:text-sm"
            size="sm"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {t.exportData}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
