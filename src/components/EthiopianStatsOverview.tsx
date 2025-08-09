
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Language } from '@/types';

interface EthiopianStatsOverviewProps {
  language: Language;
  stats: {
    totalAnimals: number;
    healthyAnimals: number;
    weeklyRevenue: number;
    pendingTasks: number;
    growthRate: number;
    vaccinationRate: number;
    sickAnimals: number;
    upcomingVaccinations: number;
    cattleCount: number;
    goatCount: number;
    sheepCount: number;
    marketPrice: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  color: 'green' | 'blue' | 'amber' | 'red' | 'purple';
  subtitle?: string;
}

const StatCard = ({ title, value, change, changeType = 'neutral', icon, color, subtitle }: StatCardProps) => {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-indigo-600', 
    amber: 'from-amber-500 to-orange-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-violet-600'
  };

  const getTrendIcon = () => {
    if (changeType === 'positive') return <TrendingUp className="w-3 h-3" />;
    if (changeType === 'negative') return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (changeType === 'positive') return 'text-green-600 bg-green-100';
    if (changeType === 'negative') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-0 shadow-md">
      <div className={`h-1 bg-gradient-to-r ${colorClasses[color]}`}></div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              {icon && <span className="text-lg">{icon}</span>}
              <p className="text-sm font-medium text-gray-600">{title}</p>
            </div>
            <div className="flex items-end space-x-2">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {change !== undefined && (
                <Badge className={`${getTrendColor()} text-xs px-2 py-0.5 flex items-center space-x-1`}>
                  {getTrendIcon()}
                  <span>{Math.abs(change)}%</span>
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const EthiopianStatsOverview = ({ language, stats }: EthiopianStatsOverviewProps) => {
  const translations = {
    am: {
      totalAnimals: 'ጠቅላላ እንስሳት',
      healthyAnimals: 'ጤናማ እንስሳት',
      revenue: 'ሳምንታዊ ገቢ',
      vaccination: 'የክትባት መጠን',
      cattle: 'ከብቶች',
      goats: 'ፍየሎች',
      sheep: 'በጎች',
      marketPrice: 'የገበያ ዋጋ',
      allHealthy: 'ሁሉም ጤናማ',
      thisWeek: 'በዚህ ሳምንት',
      coverage: 'ሽፋን',
      perKg: 'በኪ.ግ',
      head: 'ራስ',
      excellent: 'በጣም ጥሩ',
      good: 'ጥሩ'
    },
    en: {
      totalAnimals: 'Total Animals',
      healthyAnimals: 'Healthy Animals', 
      revenue: 'Weekly Revenue',
      vaccination: 'Vaccination Rate',
      cattle: 'Cattle',
      goats: 'Goats',
      sheep: 'Sheep',
      marketPrice: 'Market Price',
      allHealthy: 'All healthy',
      thisWeek: 'This week',
      coverage: 'Coverage',
      perKg: 'per kg',
      head: 'head',
      excellent: 'Excellent',
      good: 'Good'
    },
    or: {
      totalAnimals: 'Horii Hundaa',
      healthyAnimals: 'Horii Fayyaa',
      revenue: 'Galii Torban',
      vaccination: 'Sadarkaa Talallii',
      cattle: 'Loon',
      goats: 'Re\'ee',
      sheep: 'Hoolaa',
      marketPrice: 'Gatii Gabaa',
      allHealthy: 'Hunduu fayyaa',
      thisWeek: 'Torban kana',
      coverage: 'Dhugaa',
      perKg: 'Kiiloo tokkotti',
      head: 'mataa',
      excellent: 'Baay\'ee gaarii',
      good: 'Gaarii'
    },
    sw: {
      totalAnimals: 'Jumla ya Wanyama',
      healthyAnimals: 'Wanyama Wenye Afya',
      revenue: 'Mapato ya Wiki',
      vaccination: 'Kiwango cha Chanjo',
      cattle: 'Ng\'ombe',
      goats: 'Mbuzi',
      sheep: 'Kondoo',
      marketPrice: 'Bei ya Soko',
      allHealthy: 'Wote wana afya',
      thisWeek: 'Wiki hii',
      coverage: 'Ufikaji',
      perKg: 'kwa kg',
      head: 'kichwa',
      excellent: 'Bora sana',
      good: 'Nzuri'
    }
  };

  const t = translations[language];
  const healthPercentage = Math.round((stats.healthyAnimals / stats.totalAnimals) * 100);

  return (
    <div className="space-y-4">
      {/* Main Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title={t.totalAnimals}
          value={stats.totalAnimals}
          change={8}
          changeType="positive"
          icon="🐄"
          color="blue"
          subtitle={`${t.thisWeek}`}
        />
        
        <StatCard
          title={t.healthyAnimals}
          value={`${healthPercentage}%`}
          change={2}
          changeType="positive"
          icon="💚"
          color="green"
          subtitle={`${stats.healthyAnimals}/${stats.totalAnimals} ${t.allHealthy}`}
        />
        
        <StatCard
          title={t.revenue}
          value={`${stats.weeklyRevenue} ETB`}
          change={12}
          changeType="positive"
          icon="💰"
          color="amber"
          subtitle={t.thisWeek}
        />
        
        <StatCard
          title={t.vaccination}
          value={`${stats.vaccinationRate}%`}
          change={0}
          changeType="neutral"
          icon="💉"
          color="purple"
          subtitle={`${t.coverage} - ${t.excellent}`}
        />
      </div>

      {/* Animal Types Row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title={t.cattle}
          value={stats.cattleCount}
          icon="🐄"
          color="green"
          subtitle={`${t.head}`}
        />
        
        <StatCard
          title={t.goats}
          value={stats.goatCount}
          icon="🐐"
          color="blue"
          subtitle={`${t.head}`}
        />
        
        <StatCard
          title={t.sheep}
          value={stats.sheepCount}
          icon="🐑"
          color="purple"
          subtitle={`${t.head}`}
        />
      </div>

      {/* Market Price Alert */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📈</div>
              <div>
                <p className="font-semibold text-amber-800">{t.marketPrice}</p>
                <p className="text-sm text-amber-600">{stats.marketPrice} ETB {t.perKg}</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <TrendingUp className="w-3 h-3 mr-1" />
              +5% {t.thisWeek}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
