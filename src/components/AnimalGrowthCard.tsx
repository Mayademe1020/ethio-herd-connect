
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Plus, BarChart3, Scale } from 'lucide-react';
import { Language } from '@/types';

interface AnimalGrowthCardProps {
  language: Language;
  animal: {
    id: string;
    name: string;
    type: string;
    breed: string;
    currentWeight: number;
    lastWeighed: string;
    growthTrend: 'up' | 'down' | 'stable';
    targetWeight: number;
    weeklyGain: number;
  };
  onAddWeight: (animalId: string) => void;
  onViewChart: (animalId: string) => void;
}

export const AnimalGrowthCard = ({
  language,
  animal,
  onAddWeight,
  onViewChart
}: AnimalGrowthCardProps) => {
  const translations = {
    am: {
      currentWeight: 'የአሁኑ ክብደት',
      lastWeighed: 'የመጨረሻ ምዘና',
      targetWeight: 'ዒላማ ክብደት',
      weeklyGain: 'ሳምንታዊ ጭማሪ',
      addWeight: 'ክብደት ጨምር',
      viewChart: 'ቻርት ይመልከቱ',
      trending: 'አዝማሚያ',
      up: 'እየጨመረ',
      down: 'እየቀነሰ',
      stable: 'ቋሚ'
    },
    en: {
      currentWeight: 'Current Weight',
      lastWeighed: 'Last Weighed',
      targetWeight: 'Target Weight',
      weeklyGain: 'Weekly Gain',
      addWeight: 'Add Weight',
      viewChart: 'View Chart',
      trending: 'Trending',
      up: 'Up',
      down: 'Down',
      stable: 'Stable'
    },
    or: {
      currentWeight: 'Ulfaatina Ammaa',
      lastWeighed: 'Ulfaatina Dhumaa',
      targetWeight: 'Ulfaatina Galma',
      weeklyGain: 'Dabalata Torbanaa',
      addWeight: 'Ulfaatina Dabaluu',
      viewChart: 'Chaartii Ilaaluu',
      trending: 'Adeemsa',
      up: 'Ol',
      down: 'Gadi',
      stable: 'Tasgabbaa'
    },
    sw: {
      currentWeight: 'Uzito wa Sasa',
      lastWeighed: 'Alipimwa Mwisho',
      targetWeight: 'Uzito wa Lengo',
      weeklyGain: 'Ongezeko la Kila Wiki',
      addWeight: 'Ongeza Uzito',
      viewChart: 'Ona Chati',
      trending: 'Mwelekeo',
      up: 'Juu',
      down: 'Chini',
      stable: 'Thabiti'
    }
  };

  const t = translations[language];

  const getTrendIcon = () => {
    switch (animal.growthTrend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendColor = () => {
    switch (animal.growthTrend) {
      case 'up': return 'bg-green-100 text-green-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'stable': return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getProgressPercentage = () => {
    return Math.min((animal.currentWeight / animal.targetWeight) * 100, 100);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{animal.name}</CardTitle>
          <Badge className={getTrendColor()}>
            {getTrendIcon()}
            <span className="ml-1">{t[animal.growthTrend as keyof typeof t]}</span>
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{animal.type} • {animal.breed}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Weight */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">{t.currentWeight}</span>
          </div>
          <span className="text-lg font-bold text-green-600">{animal.currentWeight}kg</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{t.targetWeight}: {animal.targetWeight}kg</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t.lastWeighed}</p>
            <p className="font-medium">{animal.lastWeighed}</p>
          </div>
          <div>
            <p className="text-gray-500">{t.weeklyGain}</p>
            <p className="font-medium text-blue-600">+{animal.weeklyGain}kg</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddWeight(animal.id)}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-1" />
            {t.addWeight}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewChart(animal.id)}
            className="flex-1"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            {t.viewChart}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
