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
import { Button } from '@/components/ui/button';
import { Cloud, Sun, CloudRain, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimalData } from '@/types';
const Index = () => {
  const {
    user
  } = useAuth();
  const {
    language
  } = useLanguage();
  const navigate = useNavigate();

  // Fetch animals data
  const {
    data: animals = [],
    isLoading: animalsLoading
  } = useQuery({
    queryKey: ['animals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const {
        data,
        error
      } = await supabase.from('animals').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      }).limit(8);
      if (error) throw error;
      return data as AnimalData[];
    },
    enabled: !!user
  });

  // Fetch market listings count
  const {
    data: marketCount = 0
  } = useQuery({
    queryKey: ['market-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const {
        count,
        error
      } = await supabase.from('market_listings').select('*', {
        count: 'exact',
        head: true
      }).eq('user_id', user.id);
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

  // Show public marketplace option for non-authenticated users
  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
        <div className="container-narrow text-center space-y-responsive py-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">EthioHerd Connect</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Professional livestock marketplace and management platform designed for Ethiopian farmers
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
            <Button onClick={() => navigate('/market')} size="lg" className="bg-primary hover:bg-primary/90 py-3 px-6">
              Browse Marketplace
            </Button>
            <Button onClick={() => navigate('/auth')} variant="outline" size="lg" className="py-3 px-6">
              Login / Sign Up
            </Button>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <EnhancedHeader />
      
      <main className="container-responsive py-responsive space-y-responsive">
        {/* Welcome Section */}
        <div className="text-center space-y-responsive">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            {t.welcome}, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
          </h1>
          <p className="md:text-base text-muted-foreground text-lg">
            {t.dashboard} • {new Date().toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US')}
          </p>
        </div>

        {/* Weather Widget */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-white border-0">
          
          
        </Card>

        {/* Dashboard Cards */}
        <section>
          <EnhancedDashboardCards language={language} stats={stats} loading={animalsLoading} onCardClick={handleCardClick} />
        </section>

        {/* My Livestock Section */}
        <section className="space-y-responsive">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">{t.myLivestock}</h2>
            {animals.length > 8 && <button onClick={() => navigate('/animals')} className="text-primary hover:text-primary/80 text-sm md:text-base font-medium transition-colors">
                {t.viewAll}
              </button>}
          </div>
          
          <EnhancedAnimalGrid animals={animals.slice(0, 8)} language={language} loading={animalsLoading} onAnimalClick={handleAnimalClick} onAddAnimal={handleAddAnimal} />
        </section>

        {/* Recent Activity */}
        <section className="space-y-responsive">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">{t.recentActivity}</h2>
          <Card>
            <CardContent className="p-responsive text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Cloud className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
              </div>
              <p className="text-sm md:text-base text-muted-foreground">{t.noRecentActivity}</p>
            </CardContent>
          </Card>
        </section>
      </main>

      <BottomNavigation language={language} />
    </div>;
};
export default Index;