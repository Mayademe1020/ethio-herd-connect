import React from 'react';
import { Droplet, ShoppingBag, AlertCircle } from 'lucide-react';
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
  color: 'green' | 'blue' | 'purple';
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, color }) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className={`p-3 rounded-full ${colorClasses[color]} mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
};

const StatsCardSkeleton: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <Skeleton className="h-12 w-12 rounded-full mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-20" />
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
        <CardTitle className="flex items-center justify-between">
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
        <div className="grid grid-cols-3 gap-4">
          <StatItem
            icon={<span className="text-2xl">🐄</span>}
            value={displayStats.totalAnimals}
            label={t('profile.animals')}
            color="green"
          />
          <StatItem
            icon={<Droplet className="w-6 h-6" />}
            value={`${displayStats.milkLast30Days} L`}
            label={t('profile.milkLast30Days')}
            color="blue"
          />
          <StatItem
            icon={<ShoppingBag className="w-6 h-6" />}
            value={displayStats.activeListings}
            label={t('profile.listings')}
            color="purple"
          />
        </div>
      </CardContent>
    </Card>
  );
};
