
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Syringe, TrendingUp, ShoppingCart } from 'lucide-react';
import { Language } from '@/types';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';

interface QuickActionsProps {
  language: Language;
  onActionComplete: () => void;
}

export const QuickActions = ({ language, onActionComplete }: QuickActionsProps) => {
  const navigate = useNavigate();
  
  const translations = {
    am: {
      title: 'ፈጣን እርምጃዎች',
      addAnimal: 'እንስሳ ጨምር',
      vaccinate: 'ክትባት',
      recordWeight: 'ክብደት መዝግብ',
      sellAnimal: 'እንስሳ ሽጥ'
    },
    en: {
      title: 'Quick Actions',
      addAnimal: 'Add Animal',
      vaccinate: 'Vaccinate',
      recordWeight: 'Record Weight',
      sellAnimal: 'Sell Animal'
    },
    or: {
      title: 'Gochaalee Saffisaa',
      addAnimal: 'Horii Dabaluu',
      vaccinate: 'Walaloo',
      recordWeight: 'Ulfaatina Galmeessuu',
      sellAnimal: 'Horii Gurguruu'
    },
    sw: {
      title: 'Vitendo vya Haraka',
      addAnimal: 'Ongeza Mnyama',
      vaccinate: 'Chanjo',
      recordWeight: 'Rekodi Uzito',
      sellAnimal: 'Uza Mnyama'
    }
  };

  const t = translations[language];

  const handleAddAnimal = () => {
    logger.debug('Navigating to Animals page');
    navigate('/animals');
    onActionComplete();
  };

  const handleVaccinate = () => {
    logger.debug('Navigating to Health page');
    navigate('/health');
    onActionComplete();
  };

  const handleRecordWeight = () => {
    logger.debug('Navigating to Growth page');
    navigate('/growth');
    onActionComplete();
  };

  const handleSellAnimal = () => {
    logger.debug('Navigating to Market page');
    navigate('/market');
    onActionComplete();
  };

  return (
    <Card className="border-green-100 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-800">
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Button
          className="h-16 sm:h-20 flex flex-col space-y-1 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
          onClick={handleAddAnimal}
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-xs sm:text-sm font-medium text-center leading-tight">{t.addAnimal}</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 sm:h-20 flex flex-col space-y-1 border-blue-200 hover:bg-blue-50 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
          onClick={handleVaccinate}
        >
          <Syringe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <span className="text-xs sm:text-sm font-medium text-center leading-tight">{t.vaccinate}</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 sm:h-20 flex flex-col space-y-1 border-purple-200 hover:bg-purple-50 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
          onClick={handleRecordWeight}
        >
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          <span className="text-xs sm:text-sm font-medium text-center leading-tight">{t.recordWeight}</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 sm:h-20 flex flex-col space-y-1 border-orange-200 hover:bg-orange-50 transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation"
          onClick={handleSellAnimal}
        >
          <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
          <span className="text-xs sm:text-sm font-medium text-center leading-tight">{t.sellAnimal}</span>
        </Button>
      </CardContent>
    </Card>
  );
};
