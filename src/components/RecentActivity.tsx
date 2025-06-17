
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RecentActivityProps {
  language: 'am' | 'en';
}

export const RecentActivity = ({ language }: RecentActivityProps) => {
  const activities = [
    {
      icon: '💉',
      titleAm: 'ቤሳ - ክትባት ተሰጥቷል',
      titleEn: 'Livestock - Vaccinated',
      timeAm: '2 ሰዓት በፊት',
      timeEn: '2 hours ago',
      status: 'completed'
    },
    {
      icon: '📊',
      titleAm: 'የዶሮ እንቁላል ምርት - 45 እንቁላሎች',
      titleEn: 'Egg Production - 45 eggs',
      timeAm: '5 ሰዓት በፊት',
      timeEn: '5 hours ago',
      status: 'recorded'
    },
    {
      icon: '🐄',
      titleAm: 'አዲስ ላም ተመዝግቧል - ሞላ',
      titleEn: 'New Cow Registered - Mola',
      timeAm: '1 ቀን በፊት',
      timeEn: '1 day ago',
      status: 'new'
    },
    {
      icon: '🛒',
      titleAm: 'ላም ለሽያጭ ተለጥፏል',
      titleEn: 'Cow Posted for Sale',
      timeAm: '2 ቀን በፊት',
      timeEn: '2 days ago',
      status: 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'recorded': return 'bg-blue-100 text-blue-800';
      case 'new': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800">
          {language === 'am' ? 'የቅርብ ጊዜ እንቅስቃሴዎች' : 'Recent Activity'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-lg">{activity.icon}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {language === 'am' ? activity.titleAm : activity.titleEn}
                </p>
                <p className="text-sm text-gray-500">
                  {language === 'am' ? activity.timeAm : activity.timeEn}
                </p>
              </div>
              <Badge className={getStatusColor(activity.status)}>
                {activity.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
