import React from 'react';
import { Bell, CheckCircle, AlertCircle, Clock, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BottomNavigation from '@/components/BottomNavigation';
import { useLanguage } from '@/contexts/LanguageContext';

const Notifications = () => {
  const { language } = useLanguage();

  const notificationsData = [
    {
      id: 1,
      type: 'success',
      message: language === 'am' ? 'እንስሳ በተሳካ ሁኔታ ተመዝግቧል' : language === 'or' ? 'Beeyinni sirriitti galmaa’eera' : language === 'sw' ? 'Mnyama amesajiliwa kikamilifu' : 'Animal registered successfully',
      time: '5 minutes ago'
    },
    {
      id: 2,
      type: 'warning',
      message: language === 'am' ? 'ክትባት ሊጠናቀቅ 1 ሳምንት ቀረው' : language === 'or' ? 'Talaalliin xumuramuu ji’a 1 qofaatu hafa' : language === 'sw' ? 'Chanjo inakaribia kuisha wiki 1' : 'Vaccination expiring in 1 week',
      time: '1 hour ago'
    },
    {
      id: 3,
      type: 'error',
      message: language === 'am' ? 'ዝቅተኛ የእንስሳት መኖ አቅርቦት' : language === 'or' ? 'Dhiyeessiin nyaata beeyladaa gahaa miti' : language === 'sw' ? 'Usambazaji mdogo wa chakula cha wanyama' : 'Low animal feed supply',
      time: '3 hours ago'
    },
    {
      id: 4,
      type: 'info',
      message: language === 'am' ? 'አዲስ የገበያ ትዕዛዝ' : language === 'or' ? 'Ajaja gabaa haaraa' : language === 'sw' ? 'Agizo jipya la soko' : 'New market order',
      time: '1 day ago'
    },
    {
      id: 5,
      type: 'success',
      message: language === 'am' ? 'የወተት ምርት ሪፖርት ተዘጋጅቷል።' : language === 'or' ? 'Gabaasni oomisha aannanii qophaa’eera.' : language === 'sw' ? 'Ripoti ya uzalishaji wa maziwa imetayarishwa.' : 'Milk production report generated.',
      time: '3 days ago'
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Notification content */}
      <div className="container mx-auto py-6">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">{language === 'am' ? 'ማሳወቂያዎች' : language === 'or' ? 'Beeksisa' : language === 'sw' ? 'Arifa' : 'Notifications'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {notificationsData.map((notification) => (
                <li key={notification.id} className="border rounded-md p-4 bg-white">
                  <div className="flex items-center space-x-3">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                    {notification.type === 'warning' && (
                      <Badge variant="outline">
                        {language === 'am' ? 'እርምጃ ውሰድ' : language === 'or' ? 'Tarkaanffii Fudhadhu' : language === 'sw' ? 'Chukua hatua' : 'Take action'}
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Bottom navigation */}
      <BottomNavigation language={language} />
    </div>
  );
};

export default Notifications;
