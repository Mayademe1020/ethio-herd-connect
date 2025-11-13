// src/hooks/useMilkAnalytics.tsx
// Comprehensive milk analytics hook for dashboard and reporting

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { startOfWeek, endOfWeek, subWeeks, format, parseISO } from 'date-fns';

export interface MilkAnalytics {
  // Current week stats
  thisWeekTotal: number;
  thisWeekAverage: number;
  thisWeekRecordings: number;

  // Previous week comparison
  lastWeekTotal: number;
  weekOverWeekChange: number;

  // Daily breakdown for current week
  dailyTotals: { date: string; total: number; recordings: number }[];

  // Animal performance
  topProducers: { animalId: string; animalName: string; totalLiters: number; averageDaily: number }[];

  // Trends
  trendDirection: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export const useMilkAnalytics = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['milk-analytics', user?.id],
    queryFn: async (): Promise<MilkAnalytics> => {
      if (!user) throw new Error('User not authenticated');

      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

      // Fetch milk records for current and last week
      const { data: milkRecords, error } = await supabase
        .from('milk_records' as any)
        .select(`
          id,
          amount,
          recorded_at,
          animal_id
        `)
        .eq('user_id', user.id)
        .gte('recorded_at', lastWeekStart.toISOString())
        .lte('recorded_at', weekEnd.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      // Fetch animal names separately to avoid join issues
      const animalIds = [...new Set((milkRecords as any)?.map((r: any) => r.animal_id) || [])];
      const { data: animals } = await supabase
        .from('animals' as any)
        .select('id, name')
        .in('id', animalIds);

      const animalMap = new Map((animals as any)?.map((a: any) => [a.id, a.name]) || []);

      // Process data
      const thisWeekRecords = (milkRecords as any)?.filter((record: any) =>
        new Date(record.recorded_at) >= weekStart && new Date(record.recorded_at) <= weekEnd
      ) || [];

      const lastWeekRecords = (milkRecords as any)?.filter((record: any) =>
        new Date(record.recorded_at) >= lastWeekStart && new Date(record.recorded_at) <= lastWeekEnd
      ) || [];

      // Calculate weekly totals
      const thisWeekTotal = thisWeekRecords.reduce((sum: number, record: any) => sum + record.amount, 0);
      const lastWeekTotal = lastWeekRecords.reduce((sum: number, record: any) => sum + record.amount, 0);

      // Calculate daily totals for current week
      const dailyTotals = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = format(date, 'yyyy-MM-dd');

        const dayRecords = thisWeekRecords.filter((record: any) =>
          format(parseISO(record.recorded_at), 'yyyy-MM-dd') === dateStr
        );

        dailyTotals.push({
          date: dateStr,
          total: dayRecords.reduce((sum: number, record: any) => sum + record.amount, 0),
          recordings: dayRecords.length
        });
      }

      // Calculate animal performance
      const animalStats = new Map<string, { name: string; total: number; recordings: number }>();

      thisWeekRecords.forEach((record: any) => {
        const animalId = record.animal_id;
        const animalName = animalMap.get(animalId) || 'Unknown';
        const current = animalStats.get(animalId) || {
          name: animalName,
          total: 0,
          recordings: 0
        };

        animalStats.set(animalId, {
          name: current.name as string,
          total: current.total + record.amount,
          recordings: current.recordings + 1
        });
      });

      const topProducers = Array.from(animalStats.entries())
        .map(([animalId, stats]) => ({
          animalId,
          animalName: stats.name,
          totalLiters: stats.total,
          averageDaily: stats.recordings > 0 ? stats.total / stats.recordings : 0
        }))
        .sort((a, b) => b.totalLiters - a.totalLiters)
        .slice(0, 5);

      // Calculate trends
      const weekOverWeekChange = lastWeekTotal > 0
        ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
        : thisWeekTotal > 0 ? 100 : 0;

      let trendDirection: 'up' | 'down' | 'stable' = 'stable';
      if (weekOverWeekChange > 5) trendDirection = 'up';
      else if (weekOverWeekChange < -5) trendDirection = 'down';

      return {
        thisWeekTotal,
        thisWeekAverage: thisWeekRecords.length > 0 ? thisWeekTotal / thisWeekRecords.length : 0,
        thisWeekRecordings: thisWeekRecords.length,
        lastWeekTotal,
        weekOverWeekChange,
        dailyTotals,
        topProducers,
        trendDirection,
        trendPercentage: Math.abs(weekOverWeekChange)
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    analytics,
    isLoading,
    error,
    refetch
  };
};

export default useMilkAnalytics;