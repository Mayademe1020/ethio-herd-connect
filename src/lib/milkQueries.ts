// Centralized milk production queries
// Fixes: Uses correct table name 'milk_production' and column name 'liters'

import { supabase } from '@/integrations/supabase/client';
import { MilkProduction, DailyMilkStats, MilkSummaryRecord } from '@/types/milk';

export const milkQueries = {
  /**
   * Get daily milk stats (today and yesterday totals)
   * @param userId - The user's ID
   * @returns Promise with today and yesterday liter totals
   */
  async getDailyStats(userId: string): Promise<DailyMilkStats> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get today's milk - FIXED: using milk_production table and liters column
    const { data: todayData, error: todayError } = await supabase
      .from('milk_production')
      .select('liters')
      .eq('user_id', userId)
      .gte('recorded_at', `${todayStr}T00:00:00.000Z`)
      .lt('recorded_at', `${todayStr}T23:59:59.999Z`);

    if (todayError) {
      console.error('Error fetching today\'s milk:', todayError);
      throw todayError;
    }

    // Get yesterday's milk - FIXED: using milk_production table and liters column
    const { data: yesterdayData, error: yesterdayError } = await supabase
      .from('milk_production')
      .select('liters')
      .eq('user_id', userId)
      .gte('recorded_at', `${yesterdayStr}T00:00:00.000Z`)
      .lt('recorded_at', `${yesterdayStr}T23:59:59.999Z`);

    if (yesterdayError) {
      console.error('Error fetching yesterday\'s milk:', yesterdayError);
      throw yesterdayError;
    }

    const todayTotal = (todayData || []).reduce((sum, record: any) => sum + (record.liters || 0), 0);
    const yesterdayTotal = (yesterdayData || []).reduce((sum, record: any) => sum + (record.liters || 0), 0);

    return {
      today_liters: todayTotal,
      yesterday_liters: yesterdayTotal
    };
  },

  /**
   * Get monthly milk summary
   * @param userId - The user's ID
   * @param monthStart - Start of month date
   * @param monthEnd - End of month date
   * @returns Promise with array of milk summary records
   */
  async getMonthlySummary(
    userId: string,
    monthStart: Date,
    monthEnd: Date
  ): Promise<MilkSummaryRecord[]> {
    // FIXED: using milk_production table and liters column
    const { data, error } = await supabase
      .from('milk_production')
      .select(`
        recorded_at,
        liters,
        session,
        animals!inner(name)
      `)
      .eq('user_id', userId)
      .gte('recorded_at', monthStart.toISOString())
      .lte('recorded_at', monthEnd.toISOString())
      .order('recorded_at', { ascending: false });

    if (error) {
      console.error('Error fetching monthly milk summary:', error);
      throw error;
    }

    return (data || []).map((record: any) => ({
      date: new Date(record.recorded_at).toISOString().split('T')[0],
      animal_name: record.animals?.name || 'Unknown Animal',
      liters: record.liters || 0,
      session: (record.session || 'morning') as 'morning' | 'evening'
    }));
  },

  /**
   * Get animal milk records for the last 7 days
   * @param animalId - The animal's ID
   * @returns Promise with array of milk production records
   */
  async getAnimalMilkRecords(animalId: string): Promise<MilkProduction[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // FIXED: using milk_production table and liters column
    const { data, error } = await supabase
      .from('milk_production')
      .select('id, liters, recorded_at, session, created_at, user_id, animal_id')
      .eq('animal_id', animalId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching animal milk records:', error);
      throw error;
    }

    return (data || []).map((record: any) => ({
      ...record,
      session: (record.session || 'morning') as 'morning' | 'evening'
    }));
  },

  /**
   * Get weekly milk total for a user
   * @param userId - The user's ID
   * @returns Promise with weekly total in liters
   */
  async getWeeklyTotal(userId: string): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('milk_production')
      .select('liters')
      .eq('user_id', userId)
      .gte('recorded_at', sevenDaysAgo.toISOString());

    if (error) {
      console.error('Error fetching weekly milk total:', error);
      throw error;
    }

    return (data || []).reduce((sum, record: any) => sum + (record.liters || 0), 0);
  }
};
