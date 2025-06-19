
import React from 'react';
import { ClickableDashboardCard } from './ClickableDashboardCard';
import { Home, Heart, TrendingUp, ShoppingCart, AlertTriangle, Calendar } from 'lucide-react';

interface DashboardCardsProps {
  language: 'am' | 'en';
  stats: {
    totalAnimals: number;
    healthyAnimals: number;
    upcomingVaccinations: number;
    marketListings: number;
    totalValue: number;
    sickAnimals: number;
  };
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ language, stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
      <ClickableDashboardCard
        title={language === 'am' ? 'ጠቅላላ እንስሳት' : 'Total Animals'}
        value={stats.totalAnimals}
        icon={<Home className="w-5 h-5" />}
        navigateTo="/animals"
        subtitle={language === 'am' ? 'ሁሉም እንስሳት' : 'All registered animals'}
        className="animate-slideInLeft"
      />

      <ClickableDashboardCard
        title={language === 'am' ? 'ጤናማ እንስሳት' : 'Healthy Animals'}
        value={stats.healthyAnimals}
        icon={<Heart className="w-5 h-5" />}
        navigateTo="/health"
        subtitle={language === 'am' ? 'ጤናማ ሁኔታ' : 'In good health'}
        className="animate-slideInUp animation-delay-100"
      />

      <ClickableDashboardCard
        title={language === 'am' ? 'ክትባት ይጠብቃል' : 'Upcoming Vaccines'}
        value={stats.upcomingVaccinations}
        icon={<Calendar className="w-5 h-5" />}
        navigateTo="/health"
        subtitle={language === 'am' ? 'በቅርቡ ክትባት' : 'Due soon'}
        className="animate-slideInRight animation-delay-200"
      />

      <ClickableDashboardCard
        title={language === 'am' ? 'የገበያ ዝርዝር' : 'Market Listings'}
        value={stats.marketListings}
        icon={<ShoppingCart className="w-5 h-5" />}
        navigateTo="/market"
        subtitle={language === 'am' ? 'ንቁ ዝርዝሮች' : 'Active listings'}
        className="animate-slideInLeft animation-delay-300"
      />

      <ClickableDashboardCard
        title={language === 'am' ? 'ጠቅላላ ዋጋ' : 'Total Value'}
        value={stats.totalValue}
        icon={<TrendingUp className="w-5 h-5" />}
        navigateTo="/market"
        currency={true}
        subtitle={language === 'am' ? 'የእንስሳት ዋጋ' : 'Estimated livestock value'}
        className="animate-slideInUp animation-delay-400"
      />

      {stats.sickAnimals > 0 && (
        <ClickableDashboardCard
          title={language === 'am' ? 'ትኩረት ያስፈልጋቸው' : 'Need Attention'}
          value={stats.sickAnimals}
          icon={<AlertTriangle className="w-5 h-5" />}
          navigateTo="/health"
          subtitle={language === 'am' ? 'ህክምና ይፈልጋሉ' : 'Require medical care'}
          className="animate-slideInRight animation-delay-500 border-orange-200 hover:border-orange-300"
        />
      )}
    </div>
  );
};
