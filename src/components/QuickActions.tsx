
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Syringe, TrendingUp, ShoppingCart } from 'lucide-react';
import { Language } from '@/types';
import { useNavigate } from 'react-router-dom';

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
    navigate('/animals');
    onActionComplete();
  };

  const handleVaccinate = () => {
    navigate('/health');
    onActionComplete();
  };

  const handleRecordWeight = () => {
    navigate('/growth');
    onActionComplete();
  };

  const handleSellAnimal = () => {
    navigate('/market');
    onActionComplete();
  };

  return (
    <Card className="border-green-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Button
          className="h-16 flex flex-col space-y-1 bg-green-600 hover:bg-green-700"
          onClick={handleAddAnimal}
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs font-medium text-center">{t.addAnimal}</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 flex flex-col space-y-1 border-blue-200 hover:bg-blue-50"
          onClick={handleVaccinate}
        >
          <Syringe className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-medium text-center">{t.vaccinate}</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 flex flex-col space-y-1 border-purple-200 hover:bg-purple-50"
          onClick={handleRecordWeight}
        >
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <span className="text-xs font-medium text-center">{t.recordWeight}</span>
        </Button>

        <Button
          variant="outline"
          className="h-16 flex flex-col space-y-1 border-orange-200 hover:bg-orange-50"
          onClick={handleSellAnimal}
        >
          <ShoppingCart className="w-5 h-5 text-orange-600" />
          <span className="text-xs font-medium text-center">{t.sellAnimal}</span>
        </Button>
      </CardContent>
    </Card>
  );
};
