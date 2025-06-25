
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Syringe, Scale, Heart } from 'lucide-react';
import { Language } from '@/types';

interface RecentActivityProps {
  language: Language;
}

export const RecentActivity = ({ language }: RecentActivityProps) => {
  const translations = {
    am: {
      vaccinationRecorded: 'ክትባት ተመዝግቧል',
      weightRecorded: 'ክብደት ተመዝግቧል',
      healthCheckCompleted: 'የጤንነት ምርመራ ተጠናቅቋል'
    },
    en: {
      vaccinationRecorded: 'Vaccination recorded',
      weightRecorded: 'Weight recorded',
      healthCheckCompleted: 'Health check completed'
    },
    or: {
      vaccinationRecorded: 'Walaloo galmeeffame',
      weightRecorded: 'Ulfaatina galmeeffame',
      healthCheckCompleted: 'Qorannoo fayyaa xumurame'
    },
    sw: {
      vaccinationRecorded: 'Chanjo imeandikwa',
      weightRecorded: 'Uzito umeandikwa',
      healthCheckCompleted: 'Uchunguzi wa afya umekamilika'
    }
  };

  const t = translations[language];

  const activities = [
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
    }
  ];

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-full bg-${activity.color}-100`}>
              <Icon className={`w-4 h-4 text-${activity.color}-600`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">{activity.animal}</span>
                <Badge variant="outline" className="text-xs">
                  {activity.action}
                </Badge>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>{activity.time}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
