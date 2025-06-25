
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Syringe, TrendingUp, ShoppingCart, FileText, Users } from 'lucide-react';
import { Language } from '@/types';

interface QuickActionsProps {
  language: Language;
  onActionComplete: () => void;
}

export const QuickActions = ({ language, onActionComplete }: QuickActionsProps) => {
  const translations = {
    am: {
      title: 'ፈጣን እርምጃዎች',
      addAnimal: 'እንስሳ ጨምር',
      vaccinate: 'ክትባት',
      recordWeight: 'ክብደት መዝግብ',
      sellAnimal: 'እንስሳ ሽጥ',
      generateReport: 'ሪፖርት ፍጠር',
      manageStaff: 'ሰራተኞች'
    },
    en: {
      title: 'Quick Actions',
      addAnimal: 'Add Animal',
      vaccinate: 'Vaccinate',
      recordWeight: 'Record Weight',
      sellAnimal: 'Sell Animal',
      generateReport: 'Generate Report',
      manageStaff: 'Manage Staff'
    },
    or: {
      title: 'Gocha Saffisaa',
      addAnimal: 'Horii Dabaluu',
      vaccinate: 'Tallaa Kennuu',
      recordWeight: 'Ulfaatina Galmeessuu',
      sellAnimal: 'Horii Gurguruu',
      generateReport: 'Gabaasa Uumuu',
      manageStaff: 'Hojjettota Bulchuu'
    },
    sw: {
      title: 'Vitendo vya Haraka',
      addAnimal: 'Ongeza Mnyama',
      vaccinate: 'Chanjo',
      recordWeight: 'Rekodi Uzito',
      sellAnimal: 'Uza Mnyama',
      generateReport: 'Tengeneza Ripoti',
      manageStaff: 'Simamia Wafanyakazi'
    }
  };

  const t = translations[language];

  const handleAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    onActionComplete();
  };

  return (
    <Card className="border-green-100">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
          ⚡ {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          <Button
            onClick={() => handleAction('add-animal')}
            className="h-16 sm:h-20 flex flex-col space-y-1 sm:space-y-2 bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-center leading-tight">
              {t.addAnimal}
            </span>
          </Button>

          <Button
            onClick={() => handleAction('vaccinate')}
            variant="outline"
            className="h-16 sm:h-20 flex flex-col space-y-1 sm:space-y-2 border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Syringe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            <span className="font-medium text-center leading-tight">
              {t.vaccinate}
            </span>
          </Button>

          <Button
            onClick={() => handleAction('record-weight')}
            variant="outline"
            className="h-16 sm:h-20 flex flex-col space-y-1 sm:space-y-2 border-purple-200 hover:bg-purple-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            <span className="font-medium text-center leading-tight">
              {t.recordWeight}
            </span>
          </Button>

          <Button
            onClick={() => handleAction('sell-animal')}
            variant="outline"
            className="h-16 sm:h-20 flex flex-col space-y-1 sm:space-y-2 border-orange-200 hover:bg-orange-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            <span className="font-medium text-center leading-tight">
              {t.sellAnimal}
            </span>
          </Button>

          <Button
            onClick={() => handleAction('generate-report')}
            variant="outline"
            className="h-16 sm:h-20 flex flex-col space-y-1 sm:space-y-2 border-indigo-200 hover:bg-indigo-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
            <span className="font-medium text-center leading-tight">
              {t.generateReport}
            </span>
          </Button>

          <Button
            onClick={() => handleAction('manage-staff')}
            variant="outline"
            className="h-16 sm:h-20 flex flex-col space-y-1 sm:space-y-2 border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            <span className="font-medium text-center leading-tight">
              {t.manageStaff}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
