
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Heart, AlertTriangle, Shield, Calendar, Plus } from 'lucide-react';
import { Language } from '@/types';

interface SummaryData {
  totalAnimals: number;
  healthyAnimals: number;
  sickAnimals: number;
  needsAttention: number;
  vaccinatedAnimals: number;
  recentlyAdded: number;
}

interface AnimalsSummaryCardsProps {
  language: Language;
  summaryData: SummaryData;
}

export const AnimalsSummaryCards = ({ 
  language, 
  summaryData 
}: AnimalsSummaryCardsProps) => {
  const translations = {
    am: {
      totalAnimals: 'ጠቅላላ እንስሳት',
      healthyAnimals: 'ጤናማ እንስሳት',
      sickAnimals: 'ህሙማን እንስሳት',
      needsAttention: 'ትኩረት የሚያስፈልጋቸው',
      vaccinatedAnimals: 'የተከተቡ እንስሳት',
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
      totalAnimals: 'Horii Guutuu',
      healthyAnimals: 'Horii Fayyaa',
      sickAnimals: 'Horii Dhukkubsaa',
      needsAttention: 'Xiyyeeffannaa Barbaadan',
      vaccinatedAnimals: 'Horii Tallaa\'an',
      recentlyAdded: 'Yeroo Dhiyoo Dabalaman'
    },
    sw: {
      totalAnimals: 'Jumla ya Wanyamapori',
      healthyAnimals: 'Wanyamapori Wenye Afya',
      sickAnimals: 'Wanyamapori Wagonjwa',
      needsAttention: 'Wanahitaji Uangalifu',
      vaccinatedAnimals: 'Wanyamapori Waliopata Chanjo',
      recentlyAdded: 'Walioongezwa Hivi Karibuni'
    }
  };

  const t = translations[language];

  const cards = [
    {
      title: t.totalAnimals,
      value: summaryData.totalAnimals,
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: t.healthyAnimals,
      value: summaryData.healthyAnimals,
      icon: Heart,
      color: 'bg-green-50 text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: t.sickAnimals,
      value: summaryData.sickAnimals,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: t.needsAttention,
      value: summaryData.needsAttention,
      icon: AlertTriangle,
      color: 'bg-yellow-50 text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: t.vaccinatedAnimals,
      value: summaryData.vaccinatedAnimals,
      icon: Shield,
      color: 'bg-purple-50 text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: t.recentlyAdded,
      value: summaryData.recentlyAdded,
      icon: Plus,
      color: 'bg-indigo-50 text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="border-gray-100 hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 sm:p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${card.color.split(' ')[1]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {card.title}
                </p>
                <div className="flex items-center space-x-1">
                  <p className="text-lg sm:text-xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  {card.value > 0 && (
                    <Badge variant="secondary" className="text-xs px-1">
                      +
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
