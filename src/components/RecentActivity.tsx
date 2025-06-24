
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, Syringe, TrendingUp, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Language } from '@/types';

interface RecentActivityProps {
  language: Language;
}

export const RecentActivity = ({ language }: RecentActivityProps) => {
  const translations = {
    am: {
      recentActivity: 'የቅርብ ጊዜ እንቅስቃሴዎች',
      today: 'ዛሬ',
      yesterday: 'ትናንት',
      daysAgo: 'ቀናት በፊት',
      vaccinated: 'ክትባት ተደርጓል',
      weightRecorded: 'ክብደት ተመዝግቧል',
      animalAdded: 'እንስሳ ተጨምሯል',
      healthIssue: 'የጤንነት ችግር ተዘግቧል',
      marketListed: 'በገበያ ተዘርዝሯል'
    },
    en: {
      recentActivity: 'Recent Activity',
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: 'days ago',
      vaccinated: 'Vaccinated',
      weightRecorded: 'Weight recorded',
      animalAdded: 'Animal added',
      healthIssue: 'Health issue reported',
      marketListed: 'Listed for sale'
    },
    or: {
      recentActivity: 'Sochiiwwan Dhiyeenyaa',
      today: 'Har\'a',
      yesterday: 'Kaleessa',
      daysAgo: 'guyyoota dura',
      vaccinated: 'Tallaa\'e',
      weightRecorded: 'Ulfaatinni galmeeffame',
      animalAdded: 'Horiin dabalame',
      healthIssue: 'Rakkoon fayyaa gabaafame',
      marketListed: 'Gurgurtaaf tarreeffame'
    },
    sw: {
      recentActivity: 'Shughuli za Hivi Karibuni',
      today: 'Leo',
      yesterday: 'Jana',
      daysAgo: 'siku zilizopita',
      vaccinated: 'Amepata chanjo',
      weightRecorded: 'Uzito umepokelewa',
      animalAdded: 'Mnyama ameongezwa',
      healthIssue: 'Tatizo la afya limeripotiwa',
      marketListed: 'Imeorodheshwa kwa mauzo'
    }
  };

  const t = translations[language];

  const activities = [
    {
      id: 1,
      type: 'vaccination',
      animal: 'ሞላ (Cow-001)',
      action: t.vaccinated,
      time: t.today,
      icon: Syringe,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 2,
      type: 'weight',
      animal: 'አበባ (Goat-002)', 
      action: t.weightRecorded,
      time: t.yesterday,
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 3,
      type: 'registration',
      animal: 'ገብሬ (Sheep-003)',
      action: t.animalAdded,
      time: `2 ${t.daysAgo}`,
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 4,
      type: 'health',
      animal: 'ፋሲል (Cattle-004)',
      action: t.healthIssue,
      time: `3 ${t.daysAgo}`,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100'
    },
    {
      id: 5,
      type: 'market',
      animal: 'ሄለን (Goat-005)',
      action: t.marketListed,
      time: `5 ${t.daysAgo}`,
      icon: ShoppingCart,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card key={activity.id} className="border-gray-100 hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${activity.color}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.animal}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {activity.time}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {activity.action}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
