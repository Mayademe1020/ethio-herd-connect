import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Home, Heart, ShoppingCart, Stethoscope, Calendar, TrendingUp } from 'lucide-react';
import { AnimalData } from '@/types';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useGrowthRecords } from '@/hooks/useGrowthRecords';
import { useDateDisplay } from '@/hooks/useDateDisplay';

export const HomeScreen = () => {
  const { user, userProfile } = useAuth();
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { formatDate } = useDateDisplay();

  // Use aggregated dashboard stats instead of local queries
  const { stats: dashboardStats, animals, isLoading, nextBestActions } = useDashboardStats();

  // Use consolidated growth records hook for growth rate computation
  const { growthRecords } = useGrowthRecords();

  // Fetch market listings (for sales count and total value)
  const { data: myListings = [] } = useQuery({
    queryKey: ['my-market-listings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('market_listings')
        .select('id, status, price, user_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch vaccination schedules (public table)
  const { data: vaccinationSchedules = [] } = useQuery({
    queryKey: ['vaccination-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vaccination_schedules')
        .select('*');
      if (error) throw error;
      return data || [];
    },
    enabled: true
  });

  // Fetch vaccination health records for the user
  const { data: vaccinationRecords = [] } = useQuery({
    queryKey: ['health-records-vaccination', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('health_records')
        .select('animal_id, medicine_name, record_type, administered_date')
        .eq('user_id', user.id)
        .eq('record_type', 'vaccination');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Calculate growth rate from actual data
  const calculateGrowthRate = () => {
    if (growthRecords.length < 2) return 0;
    
    const animalGrowthMap = growthRecords.reduce((acc: Record<string, any[]>, record: any) => {
      const key = record.animal_id || 'unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(record);
      return acc;
    }, {});
    
    let totalGrowthRate = 0;
    let animalCount = 0;
    
    Object.values(animalGrowthMap).forEach((records: any[]) => {
      if (records.length >= 2) {
        records.sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime());
        const firstRecord = records[0];
        const lastRecord = records[records.length - 1];
        const initialWeight = Number(firstRecord.weight) || 0;
        const currentWeight = Number(lastRecord.weight) || 0;
        if (initialWeight > 0) {
          const growthPercent = ((currentWeight - initialWeight) / initialWeight) * 100;
          totalGrowthRate += growthPercent;
          animalCount++;
        }
      }
    });
    return animalCount > 0 ? parseFloat((totalGrowthRate / animalCount).toFixed(1)) : 0;
  };

  // Compute upcoming vaccination appointments from schedules and records
  const computeUpcomingAppointments = (): number => {
    if (!animals || animals.length === 0) return 0;
    const today = new Date();
    const windowDays = 30;
    const windowEnd = new Date(today.getTime() + windowDays * 24 * 60 * 60 * 1000);
    const administered = new Set<string>();
    vaccinationRecords.forEach((rec: any) => {
      const key = `${rec.animal_id}|${(rec.medicine_name || '').toLowerCase()}`;
      administered.add(key);
    });
    let upcomingCount = 0;
    animals.forEach((animal: any) => {
      const type = (animal.type || '').toLowerCase();
      const birthDateStr = animal.birth_date;
      if (!type || !birthDateStr) return;
      const birthDate = new Date(birthDateStr);
      const schedules = (vaccinationSchedules || []).filter((s: any) => (s.animal_type || '').toLowerCase() === type);
      schedules.forEach((s: any) => {
        const dueDate = new Date(birthDate.getTime() + Number(s.age_days) * 24 * 60 * 60 * 1000);
        const vaccineName = (s.vaccine_name || '').toLowerCase();
        const recordKey = `${animal.id}|${vaccineName}`;
        const isAdministered = administered.has(recordKey);
        const isDueSoon = dueDate >= today && dueDate <= windowEnd;
        if (!isAdministered && isDueSoon) {
          upcomingCount += 1;
        }
      });
    });
    return upcomingCount;
  };

  // Calculate stats (mapped to useDashboardStats values)
  const stats = {
    totalAnimals: dashboardStats.totalAnimals,
    favoriteAnimals: 0,
    upcomingAppointments: computeUpcomingAppointments(),
    // Use aggregated count of user's market listings
    salesCount: dashboardStats.marketListings,
    // We don’t have aggregated total value in useDashboardStats yet
    totalValue: 0,
    growthRate: calculateGrowthRate()
  };

  // Navigation handlers
  const handleCardNavigation = (path: string) => {
    navigate(path);
  };

  const handleAddAnimal = () => {
    navigate('/animals?action=add');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/animals?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Filter animals for search
  const filteredAnimals = animals.filter(animal =>
    animal.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    animal.animal_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentDate = formatDate(new Date());

  const userName = userProfile?.full_name || user?.email?.split('@')[0] || 'ተጠቃሚ';

  return (
    <div className="min-h-screen bg-background">
      {/* TopBar */}
      <div className="bg-card border-b border-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🛡️</span>
          <h1 className="text-xl font-bold text-foreground amharic-text">MyLivestock</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-foreground amharic-text font-medium">
            {userName} {t('home.userGreeting')}
            {userProfile?.mobile_number ? `, ${userProfile.mobile_number}!` : '!'}
          </p>
          <p className="text-xs text-muted-foreground amharic-text">{t('home.currentDate')} • {currentDate}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 bg-card border-b border-border">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('home.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-muted/50 border-border rounded-xl amharic-text focus:ring-primary focus:border-primary"
          />
        </form>
      </div>

      <div className="px-4 pb-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Total Animals Card */}
          <Card 
            className="farmer-card cursor-pointer touch-target-large"
            onClick={() => handleCardNavigation('/animals')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-primary">
                <Home className="w-full h-full" />
              </div>
              <h3 className="text-sm font-medium text-foreground amharic-text mb-1">{t('home.totalAnimals')}</h3>
              <p className="text-2xl font-bold text-primary">{stats.totalAnimals}</p>
            </CardContent>
          </Card>

          {/* Favorites Card */}
          <Card 
            className="farmer-card cursor-pointer touch-target-large"
            onClick={() => handleCardNavigation('/animals?filter=favorites')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-destructive">
                <Heart className="w-full h-full" />
              </div>
              <h3 className="text-sm font-medium text-foreground amharic-text mb-1">{t('home.favoriteAnimals')}</h3>
              <p className="text-2xl font-bold text-primary">{stats.favoriteAnimals}</p>
            </CardContent>
          </Card>

          {/* Appointments Card */}
          <Card 
            className="farmer-card cursor-pointer touch-target-large"
            onClick={() => handleCardNavigation('/medical')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-secondary">
                <Calendar className="w-full h-full" />
              </div>
              <h3 className="text-sm font-medium text-foreground amharic-text mb-1">{t('home.upcomingAppointments')}</h3>
              <p className="text-2xl font-bold text-primary">{stats.upcomingAppointments}</p>
            </CardContent>
          </Card>

          {/* Sales Card */}
          <Card 
            className="farmer-card cursor-pointer touch-target-large"
            onClick={() => handleCardNavigation('/marketplace')}
          >
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-accent">
                <ShoppingCart className="w-full h-full" />
              </div>
              <h3 className="text-sm font-medium text-foreground amharic-text mb-1">{t('home.sales')}</h3>
              <p className="text-2xl font-bold text-primary">{stats.salesCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Income Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 mt-6">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-4xl">💸</div>
            <h3 className="text-lg font-bold text-foreground amharic-text mb-2">{t('home.basicIncome')}</h3>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-2xl font-bold text-primary">{stats.totalValue} ETB</span>
              <div className="flex items-center text-secondary">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">+{stats.growthRate}%</span>
              </div>
            </div>
            <div className="text-4xl mb-2">📈</div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-muted-foreground"
              onClick={() => handleCardNavigation('/analytics')}
            >
              {t('home.viewFinancialReport')}
            </Button>
          </CardContent>
        </Card>

        {/* Empty State (shown when no animals) */}
        {stats.totalAnimals === 0 && (
          <Card className="mt-6 border-dashed border-2 border-muted-foreground/30">
            <CardContent className="p-8 text-center space-y-4">
              <div className="text-6xl mb-4">🐮</div>
              <h3 className="text-lg font-bold text-foreground amharic-text">{t('home.noAnimalsTitle')}</h3>
              <p className="text-sm text-muted-foreground amharic-text">{t('home.noAnimalsSubtitle')}</p>
              <Button 
                onClick={handleAddAnimal}
                className="farmer-button w-full"
              >
                {t('home.addFirstAnimal')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2">
        <div className="flex justify-around items-center">
          <button
            onClick={() => handleCardNavigation('/')}
            className="flex flex-col items-center space-y-1 p-2 text-primary touch-target-large"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-bold amharic-text">{t('home.navigation.home')}</span>
          </button>
          
          <button
            onClick={() => handleCardNavigation('/animals?filter=favorites')}
            className="flex flex-col items-center space-y-1 p-2 text-muted-foreground hover:text-primary touch-target-large"
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs amharic-text">{t('home.navigation.favorites')}</span>
          </button>
          
          <button
            onClick={() => handleCardNavigation('/marketplace')}
            className="flex flex-col items-center space-y-1 p-2 text-muted-foreground hover:text-primary touch-target-large"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs amharic-text">{t('home.navigation.sales')}</span>
          </button>
          
          <button
            onClick={() => handleCardNavigation('/medical')}
            className="flex flex-col items-center space-y-1 p-2 text-muted-foreground hover:text-primary touch-target-large"
          >
            <Stethoscope className="w-5 h-5" />
            <span className="text-xs amharic-text">{t('home.navigation.health')}</span>
          </button>
        </div>
      </div>
    </div>

    // Mode Toggle */}
    <div className="px-4 py-2 flex items-center justify-between bg-muted/40 border-b border-border">
      <div className="text-sm font-medium">Display Mode</div>
      <div className="flex gap-2">
        <Button variant={mode === 'simple' ? 'default' : 'outline'} onClick={() => setMode('simple')}>
          Simple
        </Button>
        <Button variant={mode === 'advanced' ? 'default' : 'outline'} onClick={() => setMode('advanced')}>
          Advanced
        </Button>
      </div>
    </div>

    // Onboarding: 3-step visual journey */
    {showOnboarding && (
      <div className="px-4 py-4">
        <Card className="border-primary/50">
          <CardContent className="space-y-4">
            <div className="text-lg font-semibold">Welcome! Let’s get started</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg border">
                <div className="font-medium">1. Register Animal</div>
                <div className="text-sm text-muted-foreground">Add your first livestock</div>
                <Button className="mt-2 w-full" onClick={() => navigate('/animals?action=register')}>Start</Button>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="font-medium">2. Track Health</div>
                <div className="text-sm text-muted-foreground">Record illness/vaccination</div>
                <Button className="mt-2 w-full" onClick={() => navigate('/health-records')}>Open</Button>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="font-medium">3. Explore Marketplace</div>
                <div className="text-sm text-muted-foreground">Find buyers or listings</div>
                <Button className="mt-2 w-full" onClick={() => navigate('/marketplace')}>Explore</Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={completeOnboarding}>Skip</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}

    // Next Best Actions */
    <div className="px-4 py-4">
      <div className="text-lg font-semibold">Next Best Actions</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
        {nextBestActions?.map((a: any) => (
          <Card key={a.action} className="cursor-pointer" onClick={() => navigate(a.route)}>
            <CardContent className="py-3">
              <div className="font-medium">{a.title}</div>
              <div className="text-sm text-muted-foreground">{a.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    // Simple Mode: minimal key metrics */
    {mode === 'simple' && (
      <div className="px-4 py-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Animals</div>
              <div className="text-xl">{dashboardStats.totalAnimals}</div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="font-semibold">Milk (This Month)</div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{dashboardStats.totalMilkThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )}

    // Advanced Mode: detailed metrics with visual progress bars */
    {mode === 'advanced' && (
      <div className="px-4 py-4 space-y-4">
        <Card>
          <CardContent className="py-4">
            <div className="font-semibold mb-2">Health Overview</div>
            <div className="space-y-2">
              <div>
                <div className="text-sm">Healthy</div>
                <div className="h-2 bg-muted rounded">
                  <div
                    className="h-2 bg-green-500 rounded"
                    style={{ width: `${(dashboardStats.healthyAnimals / Math.max(dashboardStats.totalAnimals, 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-sm">Needs Attention</div>
                <div className="h-2 bg-muted rounded">
                  <div
                    className="h-2 bg-orange-500 rounded"
                    style={{ width: `${(dashboardStats.needsAttention / Math.max(dashboardStats.totalAnimals, 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-sm">Critical</div>
                <div className="h-2 bg-muted rounded">
                  <div
                    className="h-2 bg-red-500 rounded"
                    style={{ width: `${(dashboardStats.criticalAnimals / Math.max(dashboardStats.totalAnimals, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
  );
};