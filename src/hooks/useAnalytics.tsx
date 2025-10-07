import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAnalytics = () => {
  const { user } = useAuth();

  // Fetch all animals
  const { data: animals = [] } = useQuery({
    queryKey: ['analytics-animals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch milk production records
  const { data: milkRecords = [] } = useQuery({
    queryKey: ['analytics-milk', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('milk_production')
        .select('*')
        .eq('user_id', user.id)
        .order('production_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch growth records
  const { data: growthRecords = [] } = useQuery({
    queryKey: ['analytics-growth', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('growth_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch financial records
  const { data: financialRecords = [] } = useQuery({
    queryKey: ['analytics-financial', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch market listings
  const { data: marketListings = [] } = useQuery({
    queryKey: ['analytics-market', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('market_listings')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch health records
  const { data: healthRecords = [] } = useQuery({
    queryKey: ['analytics-health', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user.id)
        .order('administered_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Calculate analytics
  const analytics = {
    // Animal distribution
    animalDistribution: animals.reduce((acc, animal) => {
      const type = animal.type.toLowerCase();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),

    // Health status
    healthStatus: animals.reduce((acc, animal) => {
      const status = animal.health_status || 'healthy';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),

    // Total animals
    totalAnimals: animals.length,

    // Milk production stats
    milkProduction: {
      totalRecords: milkRecords.length,
      today: milkRecords
        .filter(r => r.production_date === new Date().toISOString().split('T')[0])
        .reduce((sum, r) => sum + (r.total_yield || 0), 0),
      weeklyAverage: (() => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const weekRecords = milkRecords.filter(r => r.production_date >= weekAgo);
        return weekRecords.length > 0 
          ? weekRecords.reduce((sum, r) => sum + (r.total_yield || 0), 0) / 7
          : 0;
      })(),
      monthlyTotal: (() => {
        const thisMonth = new Date().toISOString().substring(0, 7);
        return milkRecords
          .filter(r => r.production_date.startsWith(thisMonth))
          .reduce((sum, r) => sum + (r.total_yield || 0), 0);
      })()
    },

    // Financial stats
    financial: {
      totalIncome: financialRecords
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + Number(r.amount), 0),
      totalExpense: financialRecords
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + Number(r.amount), 0),
      netRevenue: (() => {
        const income = financialRecords
          .filter(r => r.type === 'income')
          .reduce((sum, r) => sum + Number(r.amount), 0);
        const expense = financialRecords
          .filter(r => r.type === 'expense')
          .reduce((sum, r) => sum + Number(r.amount), 0);
        return income - expense;
      })(),
      recentTransactions: financialRecords.slice(0, 5)
    },

    // Growth stats
    growth: {
      totalRecords: growthRecords.length,
      averageWeight: growthRecords.length > 0
        ? growthRecords.reduce((sum, r) => sum + Number(r.weight), 0) / growthRecords.length
        : 0,
      recentGrowth: growthRecords.slice(0, 10)
    },

    // Market stats
    market: {
      activeListings: marketListings.filter(l => l.status === 'active').length,
      soldListings: marketListings.filter(l => l.status === 'sold').length,
      totalValue: marketListings
        .filter(l => l.status === 'active')
        .reduce((sum, l) => sum + Number(l.price), 0)
    },

    // Health stats
    health: {
      totalRecords: healthRecords.length,
      vaccinations: healthRecords.filter(r => r.record_type === 'vaccination').length,
      illnesses: healthRecords.filter(r => r.record_type === 'illness').length,
      recentHealth: healthRecords.slice(0, 5)
    }
  };

  return analytics;
};
