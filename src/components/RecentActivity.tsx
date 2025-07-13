
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Syringe, Scale, Heart, Plus, TrendingUp } from 'lucide-react';
import { Language } from '@/types';

interface RecentActivityProps {
  language: Language;
}

interface ActivityItem {
  id: string;
  type: 'vaccination' | 'weight' | 'health' | 'registration' | 'growth';
  animal: string;
  action: string;
  time: string;
  icon: any;
  color: string;
}

export const RecentActivity = ({ language }: RecentActivityProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const translations = {
    am: {
      vaccinationRecorded: 'ክትባት ተመዝግቧል',
      weightRecorded: 'ክብደት ተመዝግቧል',
      healthCheckCompleted: 'የጤንነት ምርመራ ተጠናቅቋል',
      animalRegistered: 'እንስሳ ተመዝግቧል',
      growthRecorded: 'እድገት ተመዝግቧል',
      noActivity: 'የቅርብ ጊዜ እንቅስቃሴ የለም',
      loading: 'እየጫን...'
    },
    en: {
      vaccinationRecorded: 'Vaccination recorded',
      weightRecorded: 'Weight recorded',
      healthCheckCompleted: 'Health check completed',
      animalRegistered: 'Animal registered',
      growthRecorded: 'Growth recorded',
      noActivity: 'No recent activity',
      loading: 'Loading...'
    },
    or: {
      vaccinationRecorded: 'Walaloo galmeeffame',
      weightRecorded: 'Ulfaatina galmeeffame',
      healthCheckCompleted: 'Qorannoo fayyaa xumurame',
      animalRegistered: 'Horii galmeeffame',
      growthRecorded: 'Guddina galmeeffame',
      noActivity: 'Sochiiwwan yeroo dhiyootii hin jiran',
      loading: 'Fe\'ama jira...'
    },
    sw: {
      vaccinationRecorded: 'Chanjo imeandikwa',
      weightRecorded: 'Uzito umeandikwa',
      healthCheckCompleted: 'Uchunguzi wa afya umekamilika',
      animalRegistered: 'Mnyama ameandikwa',
      growthRecorded: 'Ukuaji umeandikwa',
      noActivity: 'Hakuna shughuli za hivi karibuni',
      loading: 'Inapakia...'
    }
  };

  const t = translations[language];

  // Simulate loading recent activities
  useEffect(() => {
    const loadActivities = () => {
      // Mock data - in production this would come from Supabase
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'vaccination',
          animal: 'Bessie',
          action: t.vaccinationRecorded,
          time: '2 hours ago',
          icon: Syringe,
          color: 'blue'
        },
        {
          id: '2',
          type: 'weight',
          animal: 'Billy',
          action: t.weightRecorded,
          time: '4 hours ago',
          icon: Scale,
          color: 'green'
        },
        {
          id: '3',
          type: 'health',
          animal: 'Molly',
          action: t.healthCheckCompleted,
          time: '1 day ago',
          icon: Heart,
          color: 'red'
        },
        {
          id: '4',
          type: 'registration',
          animal: 'Lucky',
          action: t.animalRegistered,
          time: '2 days ago',
          icon: Plus,
          color: 'purple'
        },
        {
          id: '5',
          type: 'growth',
          animal: 'Daisy',
          action: t.growthRecorded,
          time: '3 days ago',
          icon: TrendingUp,
          color: 'orange'
        }
      ];

      setActivities(mockActivities);
    };

    // Simulate loading delay
    const timer = setTimeout(loadActivities, 500);
    return () => clearTimeout(timer);
  }, [language, t]);

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
          <Clock className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-500">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div 
            key={activity.id} 
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className={`p-2 rounded-full bg-${activity.color}-100 flex-shrink-0`}>
              <Icon className={`w-4 h-4 text-${activity.color}-600`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-gray-900 truncate">{activity.animal}</span>
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  {activity.action}
                </Badge>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{activity.time}</span>
              </div>
            </div>
          </div>
        );
      })}
      
      {activities.length === 0 && (
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">{t.noActivity}</p>
        </div>
      )}
    </div>
  );
};
