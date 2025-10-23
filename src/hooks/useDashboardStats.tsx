import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { buildCountQuery, ANIMAL_FIELDS, GROWTH_RECORD_FIELDS, MILK_PRODUCTION_FIELDS } from '@/lib/queryBuilders';
import { logger } from '@/utils/logger';

export const useDashboardStats = () => {
  const { user } = useAuth();

  // OPTIMIZED: Fetch only minimal animal data for stats calculation
  // Instead of SELECT *, we only get the fields needed for dashboard
  const { data: animals = [], isLoading: animalsLoading } = useQuery({
    queryKey: ['dashboard-animals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const startTime = performance.now();
      
      // Only fetch fields needed for dashboard stats
      const { data, error } = await supabase
        .from('animals')
        .select('id, type, health_status, weight')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const duration = performance.now() - startTime;
      logger.debug(`Query Performance: Dashboard animals: ${duration.toFixed(2)}ms`);
      
      return data || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes (dashboard data can be slightly stale)
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  // OPTIMIZED: Use COUNT query instead of fetching all records
  const { data: healthRecordsCount = 0 } = useQuery({
    queryKey: ['health-records-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const startTime = performance.now();
      
      // Use optimized COUNT query
      const { count, error } = await buildCountQuery(supabase, 'health_records', user.id);
      
      if (error) throw error;
      
      const duration = performance.now() - startTime;
      logger.debug(`Query Performance: Health records count: ${duration.toFixed(2)}ms`);
      
      return count || 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // OPTIMIZED: Use COUNT query for market listings
  const { data: marketListingsCount = 0 } = useQuery({
    queryKey: ['market-listings-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const startTime = performance.now();
      
      const { count, error } = await buildCountQuery(supabase, 'market_listings', user.id);
      
      if (error) throw error;
      
      const duration = performance.now() - startTime;
      logger.debug(`Query Performance: Market listings count: ${duration.toFixed(2)}ms`);
      
      return count || 0;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // OPTIMIZED: Fetch only needed fields for recent growth records
  const { data: recentGrowthRecords = [] } = useQuery({
    queryKey: ['recent-growth-records', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const startTime = performance.now();
      
      const { data, error } = await supabase
        .from('growth_records')
        .select(GROWTH_RECORD_FIELDS.list)
        .eq('user_id', user.id)
        .order('recorded_date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      const duration = performance.now() - startTime;
      logger.debug(`Query Performance: Recent growth records: ${duration.toFixed(2)}ms`);
      
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // OPTIMIZED: Fetch only needed fields for milk production
  const { data: milkRecords = [] } = useQuery({
    queryKey: ['milk-production-dashboard', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const startTime = performance.now();
      
      const { data, error } = await supabase
        .from('milk_production')
        .select(MILK_PRODUCTION_FIELDS.list)
        .eq('user_id', user.id)
        .order('production_date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      
      const duration = performance.now() - startTime;
      logger.debug(`Query Performance: Milk production: ${duration.toFixed(2)}ms`);
      
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // OPTIMIZED: Calculate statistics efficiently
  // All calculations are done on minimal data sets
  const stats = {
    // Total counts
    totalAnimals: animals.length,
    
    // Health status breakdown (efficient filtering on minimal data)
    healthyAnimals: animals.filter((a: any) => a.health_status === 'healthy').length,
    needsAttention: animals.filter((a: any) => 
      a.health_status === 'attention' || a.health_status === 'sick'
    ).length,
    criticalAnimals: animals.filter((a: any) => a.health_status === 'critical').length,
    
    // Record counts (from optimized COUNT queries)
    healthRecords: healthRecordsCount,
    marketListings: marketListingsCount,
    activeListings: 0, // TODO: Add separate query for active listings count
    
    // Animals by type (efficient filtering on minimal data)
    cattle: animals.filter((a: any) => a.type === 'cattle').length,
    goats: animals.filter((a: any) => a.type === 'goat').length,
    sheep: animals.filter((a: any) => a.type === 'sheep').length,
    poultry: animals.filter((a: any) => a.type === 'poultry').length,
    
    // Growth tracking
    trackedAnimals: recentGrowthRecords.length,
    
    // Average weight (calculated on minimal data)
    averageWeight: animals.length > 0
      ? Math.round(
          animals.reduce((sum: number, a: any) => sum + (a.weight || 0), 0) / animals.length
        )
      : 0,
    
    // Milk production (efficient calculation on limited records)
    totalMilkThisMonth: milkRecords
      .filter((r: any) => {
        const recordDate = new Date(r.production_date);
        const now = new Date();
        return recordDate.getMonth() === now.getMonth() && 
               recordDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum: number, r: any) => sum + (r.amount || 0), 0),
    
    // Recent activity
    recentActivities: recentGrowthRecords.length,
  };

  // PRIORITY SYSTEM: Calculate "Next Best Action"
  const getNextBestAction = () => {
    const actions = [];

    if (stats.criticalAnimals > 0) {
      actions.push({
        priority: 1,
        urgency: 'critical',
        action: 'check_critical_animals',
        title: `${stats.criticalAnimals} animal${stats.criticalAnimals > 1 ? 's' : ''} need immediate care`,
        description: 'Critical health issues require veterinary attention',
        icon: 'AlertTriangle',
        color: 'red',
        route: '/health-records?filter=critical',
        impact: 'high',
      });
    }

    if (stats.needsAttention > 0) {
      actions.push({
        priority: 2,
        urgency: 'high',
        action: 'check_attention_animals',
        title: `${stats.needsAttention} animal${stats.needsAttention > 1 ? 's' : ''} need attention`,
        description: 'Monitor health and consider treatment',
        icon: 'Stethoscope',
        color: 'orange',
        route: '/health-records?filter=attention',
        impact: 'high',
      });
    }

    if (stats.totalAnimals === 0) {
      actions.push({
        priority: 3,
        urgency: 'medium',
        action: 'register_first_animal',
        title: 'Register your first animal',
        description: 'Start tracking your livestock',
        icon: 'Plus',
        color: 'blue',
        route: '/animals?action=register',
        impact: 'high',
      });
    }

    if (stats.totalAnimals > 0 && stats.trackedAnimals === 0) {
      actions.push({
        priority: 4,
        urgency: 'medium',
        action: 'track_growth',
        title: 'Track animal growth',
        description: 'Record weights to monitor development',
        icon: 'TrendingUp',
        color: 'green',
        route: '/growth',
        impact: 'medium',
      });
    }

    if (stats.totalAnimals > 0 && stats.marketListings === 0) {
      actions.push({
        priority: 5,
        urgency: 'low',
        action: 'explore_marketplace',
        title: 'Explore marketplace',
        description: 'Find buyers or market prices',
        icon: 'ShoppingCart',
        color: 'purple',
        route: '/marketplace',
        impact: 'medium',
      });
    }

    if (stats.cattle > 0 && stats.totalMilkThisMonth === 0) {
      actions.push({
        priority: 6,
        urgency: 'low',
        action: 'track_milk_production',
        title: 'Track milk production',
        description: 'Monitor daily yields',
        icon: 'Droplets',
        color: 'blue',
        route: '/milk-production',
        impact: 'medium',
      });
    }

    return actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
  };

  return {
    stats,
    animals,
    isLoading: animalsLoading,
    nextBestActions: getNextBestAction(),
  };
}
