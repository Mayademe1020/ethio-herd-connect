
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardCardsProps {
  language: 'am' | 'en';
}

export const DashboardCards = ({ language }: DashboardCardsProps) => {
  const stats = [
    {
      icon: '🐄',
      titleAm: 'ከብቶች',
      titleEn: 'Cattle',
      count: 24,
      subtitle: language === 'am' ? 'ጤናማ' : 'Healthy'
    },
    {
      icon: '🐔',
      titleAm: 'ዶሮዎች',
      titleEn: 'Poultry',
      count: 156,
      subtitle: language === 'am' ? 'እንቁላል ተወላጅ' : 'Egg Layers'
    },
    {
      icon: '💉',
      titleAm: 'የቅርብ ክትባቶች',
      titleEn: 'Upcoming Vaccines',
      count: 8,
      subtitle: language === 'am' ? 'በዚህ ሳምንት' : 'This Week'
    },
    {
      icon: '📈',
      titleAm: 'ገቢ',
      titleEn: 'Revenue',
      count: '₹12,450',
      subtitle: language === 'am' ? 'በዚህ ወር' : 'This Month'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {language === 'am' ? stat.titleAm : stat.titleEn}
            </CardTitle>
            <span className="text-2xl">{stat.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.count}
            </div>
            <p className="text-xs text-gray-500">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
