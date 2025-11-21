import React from 'react';
import { Droplet, ShoppingBag, AlertCircle, TrendingUp, Beef } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import type { FarmStats } from '@/hooks/useFarmStats';

interface FarmStatsCardProps {
  stats: FarmStats | null | undefined;
  isLoading: boolean;
  isStale?: boolean;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: 'emerald' | 'blue' | 'purple';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, color, trend }) => {
  const colorClasses = {
    emerald: {
      container: 'bg-emerald-50',
      icon: 'text-emerald-600',
      text: 'text-emerald-600'
    },
    blue: {
      container: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-600'
    },
    purple: {
      container: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'text-purple-600'
    }
  };

  const currentColor = colorClasses[color];

  return (
    <div className="flex flex-col items-center text-center">
      {/* Icon with colored background */}
      <div className={`w-12 h-12 rounded-full ${currentColor.container} flex items-center justify-center mb-3`}>
        <div className={currentColor.icon}>
          {icon}
        </div>
      </div>
      
      {/* Number - Large and bold */}
      <div className="text-3xl font-bold text-gray-900 mb-1 leading-tight">
        {value}
      </div>
      
      {/* Label - Small and secondary */}
      <div className="text-sm text-gray-600 mb-2">
        {label}
      </div>
      
      {/* Trend indicator */}
      {trend && (
        <div className="flex items-center text-xs">
          <TrendingUp className={`w-3 h-3 mr-1 ${trend.isPositive ? 'text-emerald-600' : 'text-red-500'}`} />
          <span className={`font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};

const StatsCardSkeleton: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <Skeleton className="h-12 w-12 rounded-full mb-3" />
              <Skeleton className="h-10 w-16 mb-1" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const FarmStatsCard: React.FC<FarmStatsCardProps> = ({ stats, isLoading, isStale = false }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  if (isLoading) {
    return <StatsCardSkeleton />;
  }

  // Handle case where stats is null or undefined
  const displayStats = stats || {
    totalAnimals: 0,
    milkLast30Days: 0,
    activeListings: 0,
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
          <span>{t('profile.farmStatistics')}</span>
          {isStale && (
            <div className="flex items-center gap-1 text-xs font-normal text-amber-600">
              <AlertCircle className="w-3 h-3" />
              <span>
                {language === 'am' ? 'ያረጀ መረጃ' : 'Data may be outdated'}
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-5">
          <StatItem
            icon={<Beef className="w-6 h-6" />}
            value={displayStats.totalAnimals}
            label={t('profile.animals')}
            color="emerald"
            trend={{
              value: '+2 this week',
              isPositive: true
            }}
          />
          <StatItem
            icon={<Droplet className="w-6 h-6" />}
            value={`${displayStats.milkLast30Days}L`}
            label={t('profile.milkLast30Days')}
            color="blue"
            trend={{
              value: '+12% this month',
              isPositive: true
            }}
          />
          <StatItem
            icon={<ShoppingBag className="w-6 h-6" />}
            value={displayStats.activeListings}
            label={t('profile.listings')}
            color="purple"
            trend={{
              value: '-1 this week',
              isPositive: false
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
