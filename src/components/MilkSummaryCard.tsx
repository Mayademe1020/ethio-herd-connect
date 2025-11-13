// Milk Summary Card Component
// Displays weekly or monthly milk production summaries with trends

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/useTranslations';
import { MilkSummary, getTrendIcon, getTrendColor } from '@/services/milkSummaryService';
import { Calendar, TrendingUp, Droplet } from 'lucide-react';

interface MilkSummaryCardProps {
  summary: MilkSummary;
  period: 'week' | 'month';
  onPeriodChange: (period: 'week' | 'month') => void;
}

export function MilkSummaryCard({ summary, period, onPeriodChange }: MilkSummaryCardProps) {
  const { t } = useTranslations();

  const trendIcon = getTrendIcon(summary.trend);
  const trendColor = getTrendColor(summary.trend);

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      {/* Period Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {t('Milk Production Summary')} / የወተት ምርት ማጠቃለያ
        </h3>
        <div className="flex gap-2">
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange('week')}
            className="text-xs"
          >
            {t('Week')} / ሳምንት
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPeriodChange('month')}
            className="text-xs"
          >
            {t('Month')} / ወር
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Total Liters */}
        <div className="bg-white rounded-lg p-4 text-center">
          <Droplet className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {summary.totalLiters}L
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {t('Total')} / ጠቅላላ
          </div>
        </div>

        {/* Record Count */}
        <div className="bg-white rounded-lg p-4 text-center">
          <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {summary.recordCount}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {t('Records')} / መዝገቦች
          </div>
        </div>

        {/* Average Per Day */}
        <div className="bg-white rounded-lg p-4 text-center">
          <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {summary.averagePerDay}L
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {t('Avg/Day')} / አማካይ/ቀን
          </div>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">
              {t('Trend')} / አዝማሚያ
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-3xl ${trendColor}`}>
                {trendIcon}
              </span>
              <span className={`text-xl font-bold ${trendColor}`}>
                {summary.trendPercentage}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 capitalize">
              {t(summary.trend)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t('vs previous')} {period === 'week' ? t('week') : t('month')}
            </div>
          </div>
        </div>
      </div>

      {/* Period Info */}
      <div className="mt-4 text-xs text-gray-600 text-center">
        {period === 'week' ? t('Last 7 days') : t('Last 30 days')}
      </div>
    </Card>
  );
}
