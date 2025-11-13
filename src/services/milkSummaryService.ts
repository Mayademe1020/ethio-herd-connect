// Milk Summary Calculation Service
// Provides functions to calculate weekly/monthly summaries and trends

interface MilkRecord {
  id: string;
  liters: number;
  recorded_at: string;
  session: 'morning' | 'afternoon';
}

export interface MilkSummary {
  totalLiters: number;
  recordCount: number;
  averagePerDay: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Calculate weekly milk summary for an animal
 */
export function calculateWeeklySummary(records: MilkRecord[]): MilkSummary {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  
  const weekEnd = now;
  
  // Filter records for this week
  const weekRecords = records.filter(record => {
    const recordDate = new Date(record.recorded_at);
    return recordDate >= weekStart && recordDate <= weekEnd;
  });
  
  // Calculate totals
  const totalLiters = weekRecords.reduce((sum, record) => sum + Number(record.liters), 0);
  const recordCount = weekRecords.length;
  const averagePerDay = recordCount > 0 ? totalLiters / 7 : 0;
  
  // Calculate trend (compare with previous week)
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(weekStart.getDate() - 7);
  
  const prevWeekRecords = records.filter(record => {
    const recordDate = new Date(record.recorded_at);
    return recordDate >= prevWeekStart && recordDate < weekStart;
  });
  
  const prevWeekTotal = prevWeekRecords.reduce((sum, record) => sum + Number(record.liters), 0);
  
  const { trend, trendPercentage } = calculateTrend(totalLiters, prevWeekTotal);
  
  return {
    totalLiters: Math.round(totalLiters * 10) / 10, // Round to 1 decimal
    recordCount,
    averagePerDay: Math.round(averagePerDay * 10) / 10,
    trend,
    trendPercentage,
    periodStart: weekStart,
    periodEnd: weekEnd
  };
}

/**
 * Calculate monthly milk summary for an animal
 */
export function calculateMonthlySummary(records: MilkRecord[]): MilkSummary {
  const now = new Date();
  const monthStart = new Date(now);
  monthStart.setDate(now.getDate() - 30);
  
  const monthEnd = now;
  
  // Filter records for this month
  const monthRecords = records.filter(record => {
    const recordDate = new Date(record.recorded_at);
    return recordDate >= monthStart && recordDate <= monthEnd;
  });
  
  // Calculate totals
  const totalLiters = monthRecords.reduce((sum, record) => sum + Number(record.liters), 0);
  const recordCount = monthRecords.length;
  const averagePerDay = recordCount > 0 ? totalLiters / 30 : 0;
  
  // Calculate trend (compare with previous month)
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setDate(monthStart.getDate() - 30);
  
  const prevMonthRecords = records.filter(record => {
    const recordDate = new Date(record.recorded_at);
    return recordDate >= prevMonthStart && recordDate < monthStart;
  });
  
  const prevMonthTotal = prevMonthRecords.reduce((sum, record) => sum + Number(record.liters), 0);
  
  const { trend, trendPercentage } = calculateTrend(totalLiters, prevMonthTotal);
  
  return {
    totalLiters: Math.round(totalLiters * 10) / 10,
    recordCount,
    averagePerDay: Math.round(averagePerDay * 10) / 10,
    trend,
    trendPercentage,
    periodStart: monthStart,
    periodEnd: monthEnd
  };
}

/**
 * Calculate trend by comparing current period with previous period
 */
export function calculateTrend(
  currentTotal: number,
  previousTotal: number
): { trend: 'increasing' | 'decreasing' | 'stable'; trendPercentage: number } {
  // If no previous data, consider stable
  if (previousTotal === 0) {
    return { trend: 'stable', trendPercentage: 0 };
  }
  
  const difference = currentTotal - previousTotal;
  const percentageChange = (difference / previousTotal) * 100;
  
  // Consider stable if change is less than 5%
  if (Math.abs(percentageChange) < 5) {
    return { trend: 'stable', trendPercentage: Math.round(percentageChange * 10) / 10 };
  }
  
  const trend = percentageChange > 0 ? 'increasing' : 'decreasing';
  
  return {
    trend,
    trendPercentage: Math.round(Math.abs(percentageChange) * 10) / 10
  };
}

/**
 * Get trend icon for display
 */
export function getTrendIcon(trend: 'increasing' | 'decreasing' | 'stable'): string {
  switch (trend) {
    case 'increasing':
      return '↑';
    case 'decreasing':
      return '↓';
    case 'stable':
      return '→';
  }
}

/**
 * Get trend color for display
 */
export function getTrendColor(trend: 'increasing' | 'decreasing' | 'stable'): string {
  switch (trend) {
    case 'increasing':
      return 'text-green-600';
    case 'decreasing':
      return 'text-red-600';
    case 'stable':
      return 'text-gray-600';
  }
}
