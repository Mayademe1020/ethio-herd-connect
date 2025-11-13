// Type definitions for milk production data
// Created to fix table name and column name mismatches

export interface MilkProduction {
  id: string;
  user_id: string;
  animal_id: string;
  liters: number;
  session: 'morning' | 'evening';
  recorded_at: string;
  created_at: string;
}

export interface DailyMilkStats {
  today_liters: number;
  yesterday_liters: number;
}

export interface MilkSummaryRecord {
  date: string;
  animal_name: string;
  liters: number;
  session: 'morning' | 'evening';
}

export interface MilkSummaryStats {
  totalLiters: number;
  totalRecords: number;
  uniqueAnimals: number;
}

export interface WeeklyMilkStats {
  weeklyTotal: number;
  dailyAverage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}
