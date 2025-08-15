
import React from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { Home, Heart, TrendingUp, ShoppingCart, AlertTriangle, Calendar, Users, Milk } from 'lucide-react';
import { Language } from '@/types';

interface EnhancedDashboardCardsProps {
  language: Language;
  stats: {
    totalAnimals: number;
    healthyAnimals: number;
    upcomingVaccinations: number;
    marketListings: number;
    totalValue: number;
    sickAnimals: number;
  };
  loading?: boolean;
  onCardClick?: (type: string) => void;
}

export const EnhancedDashboardCards: React.FC<EnhancedDashboardCardsProps> = ({ 
  language, 
  stats, 
  loading = false,
  onCardClick 
}) => {
  const translations = {
    am: {
      totalAnimals: 'ጠቅላላ እንስሳት',
      healthyAnimals: 'ጤናማ እንስሳት',
      upcomingVaccinations: 'ክትባት ይጠብቃል',
      marketListings: 'የገበያ ዝርዝር',
      totalValue: 'ጠቅላላ ዋጋ',
      sickAnimals: 'ትኩረት ያስፈልጋቸው',
      allAnimals: 'ሁሉም እንስሳት',
      goodHealth: 'ጤናማ ሁኔታ',
      dueSoon: 'በቅርቡ ክትባት',
      activeListings: 'ንቁ ዝርዝሮች',
      estimatedValue: 'የእንስሳት ዋጋ',
      needCare: 'ህክምና ይፈልጋሉ'
    },
    en: {
      totalAnimals: 'Total Animals',
      healthyAnimals: 'Healthy Animals',
      upcomingVaccinations: 'Upcoming Vaccines',
      marketListings: 'Market Listings',
      totalValue: 'Total Value',
      sickAnimals: 'Need Attention',
      allAnimals: 'All registered animals',
      goodHealth: 'In good health',
      dueSoon: 'Due soon',
      activeListings: 'Active listings',
      estimatedValue: 'Estimated livestock value',
      needCare: 'Require medical care'
    },
    or: {
      totalAnimals: 'Horii Hundumaa',
      healthyAnimals: 'Horii Fayyaa',
      upcomingVaccinations: 'Kintaba Dhufaa',
      marketListings: 'Tarreewwan Gabaa',
      totalValue: 'Gatii Waliigalaa',
      sickAnimals: 'Xiyyeeffannoo Barbaadan',
      allAnimals: 'Horii hundumaa galmeefaman',
      goodHealth: 'Fayyaa gaarii keessa',
      dueSoon: 'Yeroo dhiyoo',
      activeListings: 'Tarreewwan hojii irra jiran',
      estimatedValue: 'Gatii horii tilmaamame',
      needCare: 'Kunuunsa yaalaa barbaadu'
    },
    sw: {
      totalAnimals: 'Wanyama Wote',
      healthyAnimals: 'Wanyama wenye Afya',
      upcomingVaccinations: 'Chanjo Zinazokuja',
      marketListings: 'Orodha za Soko',
      totalValue: 'Thamani Jumla',
      sickAnimals: 'Wanahitaji Uangalifu',
      allAnimals: 'Wanyama wote waliosajiliwa',
      goodHealth: 'Katika hali nzuri ya afya',
      dueSoon: 'Zinazostahili hivi karibuni',
      activeListings: 'Orodha zinazofanya kazi',
      estimatedValue: 'Thamani ya mifugo iliyokadiriwa',
      needCare: 'Wanahitaji huduma za matibabu'
    }
  };

  const t = translations[language];

  const cardData = [
    {
      title: t.totalAnimals,
      value: stats.totalAnimals,
      icon: Home,
      subtitle: t.allAnimals,
      color: 'primary' as const,
      type: 'animals',
      trend: stats.totalAnimals > 0 ? 'up' as const : 'neutral' as const,
      trendValue: '+2 this month'
    },
    {
      title: t.healthyAnimals,
      value: stats.healthyAnimals,
      icon: Heart,
      subtitle: t.goodHealth,
      color: 'success' as const,
      type: 'health',
      trend: 'up' as const,
      trendValue: '95% healthy'
    },
    {
      title: t.upcomingVaccinations,
      value: stats.upcomingVaccinations,
      icon: Calendar,
      subtitle: t.dueSoon,
      color: 'warning' as const,
      type: 'vaccines',
      trend: stats.upcomingVaccinations > 0 ? 'neutral' as const : 'up' as const,
      trendValue: 'Next 7 days'
    },
    {
      title: t.marketListings,
      value: stats.marketListings,
      icon: ShoppingCart,
      subtitle: t.activeListings,
      color: 'info' as const,
      type: 'market',
      trend: 'up' as const,
      trendValue: '+1 this week'
    },
    {
      title: t.totalValue,
      value: `${stats.totalValue.toLocaleString()} ETB`,
      icon: TrendingUp,
      subtitle: t.estimatedValue,
      color: 'success' as const,
      type: 'value',
      trend: 'up' as const,
      trendValue: '+5.2%'
    }
  ];

  // Add sick animals card if there are any
  if (stats.sickAnimals > 0) {
    cardData.push({
      title: t.sickAnimals,
      value: stats.sickAnimals,
      icon: AlertTriangle,
      subtitle: t.needCare,
      color: 'error' as const,
      type: 'sick',
      trend: 'down' as const,
      trendValue: 'Needs attention'
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
      {cardData.map((card, index) => (
        <div
          key={card.type}
          className="animate-slideInUp"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <StatCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            subtitle={card.subtitle}
            color={card.color}
            trend={card.trend}
            trendValue={card.trendValue}
            loading={loading}
            onClick={() => onCardClick?.(card.type)}
          />
        </div>
      ))}
    </div>
  );
};
