// src/pages/MilkAnalytics.tsx
// Comprehensive milk analytics and reporting page

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMilkAnalytics } from '@/hooks/useMilkAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, Droplets } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const MilkAnalytics = () => {
  const navigate = useNavigate();
  const { analytics, isLoading } = useMilkAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">የወተት ውሂብ በማውጣት ላይ... / Loading milk data...</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'down': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">የወተት ሪፖርት / Milk Report</h1>
            <p className="text-sm opacity-90">የምርት እና ስታትስትክስ / Production & Statistics</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* This Week Total */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                በዚህ ሳምንት / This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics?.thisWeekTotal || 0} L
              </div>
              <p className="text-sm text-gray-500">
                {analytics?.thisWeekRecordings || 0} recordings
              </p>
            </CardContent>
          </Card>

          {/* Average per Recording */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                አማካኝ በመዝግብ / Avg per Recording
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics?.thisWeekAverage?.toFixed(1) || 0} L
              </div>
              <p className="text-sm text-gray-500">
                per milking session
              </p>
            </CardContent>
          </Card>

          {/* Week over Week Change */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                ለያዩ ሳምንት ለያዩ / Week over Week
                {analytics?.trendDirection && getTrendIcon(analytics.trendDirection)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTrendColor(analytics?.trendDirection || 'stable')}`}>
                {analytics?.weekOverWeekChange > 0 && '+'}
                {analytics?.weekOverWeekChange?.toFixed(1) || 0}%
              </div>
              <p className="text-sm text-gray-500">
                vs last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              የቀን በቀን ምርት / Daily Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.dailyTotals?.map((day, index) => (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-600">
                    {format(parseISO(day.date), 'EEE, MMM d')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((day.total / Math.max(...(analytics?.dailyTotals?.map(d => d.total) || [1]))) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-sm font-medium text-gray-700 min-w-[60px] text-right">
                        {day.total} L
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 min-w-[40px]">
                    {day.recordings}×</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Producers */}
        {analytics?.topProducers && analytics.topProducers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                ከፍተኛ ምርቃች እንስሳት / Top Producers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topProducers.map((producer, index) => (
                  <div key={producer.animalId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{producer.animalName}</div>
                        <div className="text-sm text-gray-500">
                          {producer.averageDaily.toFixed(1)} L/day average
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{producer.totalLiters} L</div>
                      <div className="text-sm text-gray-500">this week</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">💡 ምክሮች / Insights</h3>
            <div className="space-y-2 text-sm text-gray-700">
              {analytics?.trendDirection === 'up' && (
                <p>✅ የወተት ምርት እየጨመረ ነው! እንስሳትዎ በጥሩ ሁኔታ ላይ ናቸው።</p>
              )}
              {analytics?.trendDirection === 'down' && (
                <p>⚠️ የወተት ምርት እየቀነሰ ነው። እንስሳትዎን ያርክቡ እና የምግብ አቅርቦት ያረጋግጡ።</p>
              )}
              {analytics?.thisWeekRecordings && analytics.thisWeekRecordings < 7 && (
                <p>📝 በየቀኑ መዝገብ አለብዎት። የተሻለ ውሂብ ለምርት መከታተል ያስችላል።</p>
              )}
              {analytics?.topProducers && analytics.topProducers.length > 1 && (
                <p>🏆 ከፍተኛ ምርቃች እንስሳት አሉዎት። የምርት ምክንያቶችን ያጥኑ።</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MilkAnalytics;