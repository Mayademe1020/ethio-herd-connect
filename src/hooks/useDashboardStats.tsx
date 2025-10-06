import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useDashboardStats = () => {
  const { user } = useAuth();

  // Fetch all animals
  const { data: animals = [] } = useQuery({
    queryKey: ['animals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch health records count
  const { data: healthRecordsCount = 0 } = useQuery({
    queryKey: ['health-records-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('health_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch market listings count
  const { data: marketListingsCount = 0 } = useQuery({
    queryKey: ['market-listings-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('market_listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch growth records for recent activity
  const { data: recentGrowthRecords = [] } = useQuery({
    queryKey: ['recent-growth-records', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('growth_records')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_date', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch milk production records
  const { data: milkRecords = [] } = useQuery({
    queryKey: ['milk-production', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('milk_production')
        .select('*')
        .eq('user_id', user.id)
        .order('production_date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Calculate statistics
  const stats = {
    totalAnimals: animals.length,
    healthyAnimals: animals.filter((a: any) => a.health_status === 'healthy').length,
    needsAttention: animals.filter((a: any) => 
      a.health_status === 'attention' || a.health_status === 'sick'
    ).length,
    healthRecords: healthRecordsCount,
    marketListings: marketListingsCount,
    activeListings: 0, // Would need to filter by status
    
    // Animals by type
    cattle: animals.filter((a: any) => a.type === 'cattle').length,
    goats: animals.filter((a: any) => a.type === 'goat').length,
    sheep: animals.filter((a: any) => a.type === 'sheep').length,
    poultry: animals.filter((a: any) => a.type === 'poultry').length,
    
    // Growth tracking
    trackedAnimals: recentGrowthRecords.length,
    averageWeight: animals.length > 0
      ? Math.round(animals.reduce((sum: number, a: any) => sum + (a.weight || 0), 0) / animals.length)
      : 0,
    
    // Milk production
    totalMilkThisMonth: milkRecords
      .filter((r: any) => {
        const recordDate = new Date(r.production_date);
        const now = new Date();
        return recordDate.getMonth() === now.getMonth() && 
               recordDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum: number, r: any) => sum + (r.total_yield || 0), 0),
    
    // Recent activity
    recentActivities: recentGrowthRecords.length,
  };

  return {
    stats,
    animals,
    isLoading: false, // Since we're using individual queries
  };
};
