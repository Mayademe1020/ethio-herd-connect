import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { EnhancedDashboardCards } from '@/components/EnhancedDashboardCards';
import { EnhancedAnimalGrid } from '@/components/EnhancedAnimalGrid';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimalData } from '@/types';

const Index = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Fetch animals data
  const { data: animals = [], isLoading: animalsLoading } = useQuery({
    queryKey: ['animals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data as AnimalData[];
    },
    enabled: !!user
  });

  // Fetch market listings count
  const { data: marketCount = 0 } = useQuery({
    queryKey: ['market-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('market_listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user
  });

  const translations = {
    am: {
      welcome: 'እንኳን ደህና መጡ',
      dashboard: 'ዳሽቦርድ',
      todayWeather: 'የዛሬ የአየር ሁኔታ',
      addisAbaba: 'አዲስ አበባ',
      myLivestock: 'የእኔ እንስሳት',
      recentActivity: 'የቅርብ ጊዜ እንቅስቃሴ',
      noRecentActivity: 'ምንም የቅርብ ጊዜ እንቅስቃሴ የለም',
      viewAll: 'ሁሉንም ይመልከቱ'
    },
    en: {
      welcome: 'Welcome',
      dashboard: 'Dashboard',
      todayWeather: 'Today\'s Weather',
      addisAbaba: 'Addis Ababa',
      myLivestock: 'My Livestock',
      recentActivity: 'Recent Activity',
      noRecentActivity: 'No recent activity',
      viewAll: 'View All'
    },
    or: {
      welcome: 'Baga Nagaan Dhuftan',
      dashboard: 'Gabatee Hojii',
      todayWeather: 'Haala Qilleensaa Har\'aa',
      addisAbaba: 'Finfinnee',
      myLivestock: 'Horii Koo',
      recentActivity: 'Sochii Dhihoo',
      noRecentActivity: 'Sochiin dhihoo hin jiru',
      viewAll: 'Hundumaa Ilaali'
    },
    sw: {
      welcome: 'Karibu',
      dashboard: 'Dashibodi',
      todayWeather: 'Hali ya Hewa ya Leo',
      addisAbaba: 'Addis Ababa',
      myLivestock: 'Mifugo Yangu',
      recentActivity: 'Shughuli za Hivi Karibuni',
      noRecentActivity: 'Hakuna shughuli za hivi karibuni',
      viewAll: 'Ona Zote'
    }
  };

  const t = translations[language];

  // Calculate stats
  const stats = {
    totalAnimals: animals.length,
    healthyAnimals: animals.filter(a => a.health_status === 'healthy').length,
    upcomingVaccinations: animals.filter(a => a.vaccination_due_date && new Date(a.vaccination_due_date) > new Date()).length,
    marketListings: marketCount,
    totalValue: animals.reduce((sum, animal) => sum + (animal.estimated_value || 0), 0),
    sickAnimals: animals.filter(a => a.health_status === 'sick' || a.health_status === 'critical').length
  };

  const handleCardClick = (type: string) => {
    switch (type) {
      case 'animals':
        navigate('/animals');
        break;
      case 'health':
        navigate('/medical');
        break;
      case 'vaccines':
        navigate('/medical');
        break;
      case 'market':
        navigate('/marketplace');
        break;
      case 'value':
        navigate('/analytics');
        break;
      case 'sick':
        navigate('/medical');
        break;
    }
  };

  const handleAnimalClick = (animal: AnimalData) => {
    navigate(`/animals?id=${animal.id}`);
  };

  const handleAddAnimal = () => {
    navigate('/animals?action=add');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <EnhancedHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {t.welcome}, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            {t.dashboard} • {new Date().toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US')}
          </p>
        </div>

        {/* Weather Widget */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                <Sun className="w-5 h-5 mr-2" />
                {t.todayWeather}
              </CardTitle>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {t.addisAbaba}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-3xl font-bold">24°C</div>
                <div className="text-blue-100 text-sm">Partly Cloudy</div>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Wind className="w-4 h-4 mr-1" />
                  <span>12 km/h</span>
                </div>
                <div className="flex items-center">
                  <CloudRain className="w-4 h-4 mr-1" />
                  <span>20%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Cards */}
        <section>
          <EnhancedDashboardCards
            language={language}
            stats={stats}
            loading={animalsLoading}
            onCardClick={handleCardClick}
          />
        </section>

        {/* My Livestock Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">{t.myLivestock}</h2>
            {animals.length > 8 && (
              <button 
                onClick={() => navigate('/animals')}
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                {t.viewAll}
              </button>
            )}
          </div>
          
          <EnhancedAnimalGrid
            animals={animals.slice(0, 8)}
            language={language}
            loading={animalsLoading}
            onAnimalClick={handleAnimalClick}
            onAddAnimal={handleAddAnimal}
          />
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{t.recentActivity}</h2>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Cloud className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t.noRecentActivity}</p>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Index;
