
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, Download, Filter } from 'lucide-react';
import { Language } from '@/types';

interface AnimalsQuickActionsProps {
  language: Language;
  onShowRegistrationForm: () => void;
}

export const AnimalsQuickActions = ({ language, onShowRegistrationForm }: AnimalsQuickActionsProps) => {
  const translations = {
    am: {
      quickActions: 'ፈጣን እርምጃዎች',
      addAnimal: 'እንስሳ ጨምር',
      importData: 'መረጃ አምጣ',
      exportData: 'መረጃ ላክ',
      advancedFilter: 'የላቀ ማጣሪያ'
    },
    en: {
      quickActions: 'Quick Actions',
      addAnimal: 'Add Animal',
      importData: 'Import Data',
      exportData: 'Export Data',
      advancedFilter: 'Advanced Filter'
    },
    or: {
      quickActions: 'Gochaalee Saffisaa',
      addAnimal: 'Horii Dabaluu',
      importData: 'Daataa Galchuu',
      exportData: 'Daataa Baasuu',
      advancedFilter: 'Calaqqisiisa Olaanaa'
    },
    sw: {
      quickActions: 'Vitendo vya Haraka',
      addAnimal: 'Ongeza Mnyama',
      importData: 'Leta Data',
      exportData: 'Hamisha Data',
      advancedFilter: 'Kichuja cha Hali ya Juu'
    }
  };

  const t = translations[language];

  return (
    <Card className="border-green-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-800">
          {t.quickActions}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Button
            onClick={onShowRegistrationForm}
            className="h-12 sm:h-16 flex flex-col space-y-1 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium text-center leading-tight">
              {t.addAnimal}
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-12 sm:h-16 flex flex-col space-y-1 border-blue-200 hover:bg-blue-50"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            <span className="text-xs sm:text-sm font-medium text-center leading-tight">
              {t.importData}
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-12 sm:h-16 flex flex-col space-y-1 border-purple-200 hover:bg-purple-50"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            <span className="text-xs sm:text-sm font-medium text-center leading-tight">
              {t.exportData}
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-12 sm:h-16 flex flex-col space-y-1 border-orange-200 hover:bg-orange-50"
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            <span className="text-xs sm:text-sm font-medium text-center leading-tight">
              {t.advancedFilter}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
