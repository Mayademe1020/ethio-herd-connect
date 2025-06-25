
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, AlertTriangle, Target, Syringe, Plus } from 'lucide-react';
import { Language } from '@/types';

interface AnimalsSummaryCardsProps {
  language: Language;
  summaryData: {
    totalAnimals: number;
    healthyAnimals: number;
    sickAnimals: number;
    needsAttention: number;
    vaccinatedAnimals: number;
    recentlyAdded: number;
  };
}

export const AnimalsSummaryCards = ({ language, summaryData }: AnimalsSummaryCardsProps) => {
  const translations = {
    am: {
      totalAnimals: 'ጠቅላላ እንስሳት',
      healthyAnimals: 'ጤናማ እንስሳት',
      sickAnimals: 'ህሙማን እንስሳት',
      needsAttention: 'ትኩረት የሚፈልጉ',
      vaccinatedAnimals: 'የተከተበ እንስሳት',
      recentlyAdded: 'በቅርቡ የተጨመሩ'
    },
    en: {
      totalAnimals: 'Total Animals',
      healthyAnimals: 'Healthy Animals',
      sickAnimals: 'Sick Animals',
      needsAttention: 'Need Attention',
      vaccinatedAnimals: 'Vaccinated Animals',
      recentlyAdded: 'Recently Added'
    },
    or: {
      totalAnimals: 'Horii Hundaa',
      healthyAnimals: 'Horii Fayyaa',
      sickAnimals: 'Horii Dhukkubsaa',
      needsAttention: 'Xiyyeeffannoo Barbaadan',
      vaccinatedAnimals: 'Horii Tallaan Godhaman',
      recentlyAdded: 'Yeroo Dhiyootti Dabalaman'
    },
    sw: {
      totalAnimals: 'Jumla ya Wanyama',
      healthyAnimals: 'Wanyama Wenye Afya',
      sickAnimals: 'Wanyama Wagonjwa',
      needsAttention: 'Wanahitaji Umakini',
      vaccinatedAnimals: 'Wanyama Waliopewa Chanjo',
      recentlyAdded: 'Walioongezwa Hivi Karibuni'
    }
  };

  const t = translations[language];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <Card className="border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center space-x-1">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{t.totalAnimals}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">
            {summaryData.totalAnimals}
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center space-x-1">
            <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{t.healthyAnimals}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            {summaryData.healthyAnimals}
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{t.sickAnimals}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg sm:text-2xl font-bold text-red-600">
            {summaryData.sickAnimals}
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center space-x-1">
            <Target className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{t.needsAttention}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg sm:text-2xl font-bold text-orange-600">
            {summaryData.needsAttention}
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center space-x-1">
            <Syringe className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{t.vaccinatedAnimals}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">
            {summaryData.vaccinatedAnimals}
          </div>
        </CardContent>
      </Card>

      <Card className="border-teal-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center space-x-1">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{t.recentlyAdded}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg sm:text-2xl font-bold text-teal-600">
            {summaryData.recentlyAdded}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
