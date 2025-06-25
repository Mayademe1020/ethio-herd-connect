
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, AlertTriangle } from 'lucide-react';
import { Language } from '@/types';

interface HealthReminderSystemProps {
  language: Language;
}

export const HealthReminderSystem = ({ language }: HealthReminderSystemProps) => {
  const translations = {
    am: {
      upcomingReminders: 'ቀሪ ማስታወሻዎች',
      vaccinationDue: 'ክትባት ጊዜ',
      checkupDue: 'ምርመራ ጊዜ',
      noReminders: 'ማስታወሻዎች የሉም',
      markDone: 'ተጠናቋል',
      snooze: 'አስተላልፍ'
    },
    en: {
      upcomingReminders: 'Upcoming Reminders',
      vaccinationDue: 'Vaccination Due',
      checkupDue: 'Checkup Due',
      noReminders: 'No reminders',
      markDone: 'Mark Done',
      snooze: 'Snooze'
    },
    or: {
      upcomingReminders: 'Yaadachiisa Dhufuuf Jiran',
      vaccinationDue: 'Tallaan Yeroon Geesse',
      checkupDue: 'Qorannnoon Yeroon Geesse',
      noReminders: 'Yaadachiisuun hin jiru',
      markDone: 'Xumurame Jedhii Mallattoo Godhi',
      snooze: 'Booda Deebisi'
    },
    sw: {
      upcomingReminders: 'Vikumbusho Vinavyokuja',
      vaccinationDue: 'Chanjo Zimekaribia',
      checkupDue: 'Uchunguzi Umekaribia',
      noReminders: 'Hakuna vikumbusho',
      markDone: 'Alama Kumalizika',
      snooze: 'Ahirisha'
    }
  };

  const t = translations[language];

  // Mock reminders data
  const reminders = [
    {
      id: '1',
      type: 'vaccination',
      animalName: 'Bessie',
      message: 'FMD vaccination due',
      dueDate: '2024-12-30'
    },
    {
      id: '2',
      type: 'checkup',
      animalName: 'Billy',
      message: 'Health checkup due',
      dueDate: '2024-12-28'
    }
  ];

  return (
    <Card className="border-blue-100">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <span>{t.upcomingReminders}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{t.noReminders}</p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      {reminder.type === 'vaccination' ? (
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Calendar className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{reminder.animalName}</p>
                      <p className="text-sm text-gray-600">{reminder.message}</p>
                      <p className="text-xs text-orange-600">{reminder.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      {t.snooze}
                    </Button>
                    <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700">
                      {t.markDone}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
