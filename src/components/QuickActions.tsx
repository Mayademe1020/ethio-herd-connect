
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Syringe, TrendingUp, ShoppingCart, AlertTriangle, Users } from 'lucide-react';
import { AnimalRegistrationForm } from './AnimalRegistrationForm';
import { VaccinationForm } from './VaccinationForm';
import { WeightEntryForm } from './WeightEntryForm';
import { IllnessReportForm } from './IllnessReportForm';
import { MarketListingForm } from './MarketListingForm';
import { Language } from '@/types';

interface QuickActionsProps {
  language: Language;
  onActionComplete?: () => void;
}

export const QuickActions = ({ language, onActionComplete }: QuickActionsProps) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showIllnessForm, setShowIllnessForm] = useState(false);
  const [showMarketForm, setShowMarketForm] = useState(false);

  const translations = {
    am: {
      quickActions: 'ፈጣን እርምጃዎች',
      addAnimal: 'እንስሳ ጨምር',
      recordVaccination: 'ክትባት መዝግብ',
      trackGrowth: 'እድገት ክትትል',
      reportIllness: 'ጤንነት ችግር ሪፖርት',
      sellAnimal: 'በገበያ አስመዝግብ'
    },
    en: {
      quickActions: 'Quick Actions',
      addAnimal: 'Add Animal',
      recordVaccination: 'Record Vaccination',
      trackGrowth: 'Track Growth',
      reportIllness: 'Report Illness',
      sellAnimal: 'List for Sale'
    },
    or: {
      quickActions: 'Tarkaanfii Saffisaa',
      addAnimal: 'Horii Dabaluu',
      recordVaccination: 'Tallaa Galmeessuu',
      trackGrowth: 'Guddina Hordofuu',
      reportIllness: 'Dhukkuba Gabaasuu',
      sellAnimal: 'Gurgurtaaf Tarreessuu'
    },
    sw: {
      quickActions: 'Vitendo vya Haraka',
      addAnimal: 'Ongeza Mnyama',
      recordVaccination: 'Rekodi Chanjo',
      trackGrowth: 'Fuatilia Ukuaji',
      reportIllness: 'Ripoti Ugonjwa',
      sellAnimal: 'Orodhesha kwa Mauzo'
    }
  };

  const t = translations[language];

  const handleFormClose = () => {
    setShowRegistrationForm(false);
    setShowVaccinationForm(false);
    setShowWeightForm(false);
    setShowIllnessForm(false);
    setShowMarketForm(false);
    onActionComplete?.();
  };

  return (
    <>
      <Card className="border-green-100">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
            ⚡ {t.quickActions}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <Button
              onClick={() => setShowRegistrationForm(true)}
              className="bg-green-600 hover:bg-green-700 h-10 sm:h-12 text-xs sm:text-sm justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.addAnimal}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowVaccinationForm(true)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 h-10 sm:h-12 text-xs sm:text-sm justify-start"
            >
              <Syringe className="w-4 h-4 mr-2" />
              {t.recordVaccination}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowWeightForm(true)}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 h-10 sm:h-12 text-xs sm:text-sm justify-start"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {t.trackGrowth}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowIllnessForm(true)}
              className="border-red-200 text-red-700 hover:bg-red-50 h-10 sm:h-12 text-xs sm:text-sm justify-start"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t.reportIllness}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowMarketForm(true)}
              className="border-orange-200 text-orange-700 hover:bg-orange-50 h-10 sm:h-12 text-xs sm:text-sm justify-start"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {t.sellAnimal}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Forms */}
      {showRegistrationForm && (
        <AnimalRegistrationForm
          language={language}
          onClose={handleFormClose}
          onSubmit={handleFormClose}
        />
      )}

      {showVaccinationForm && (
        <VaccinationForm
          language={language}
          onClose={handleFormClose}
        />
      )}

      {showWeightForm && (
        <WeightEntryForm
          language={language}
          onClose={handleFormClose}
          onWeightAdded={handleFormClose}
        />
      )}

      {showIllnessForm && (
        <IllnessReportForm
          language={language}
          onClose={handleFormClose}
          onSubmit={handleFormClose}
        />
      )}

      {showMarketForm && (
        <MarketListingForm
          language={language}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}
    </>
  );
};
