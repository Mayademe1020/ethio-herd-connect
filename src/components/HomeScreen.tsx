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

export const HomeScreen = () => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch animals data
  const { data: animals = [], isLoading } = useQuery({
    queryKey: ['animals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
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

  // Calculate stats
  const stats = {
    totalAnimals: animals.length,
    favoriteAnimals: 0, // Favorites functionality not implemented yet
    upcomingAppointments: animals.filter(a => a.vaccination_due_date && new Date(a.vaccination_due_date) > new Date()).length,
    salesCount: marketCount,
    totalValue: animals.reduce((sum, animal) => sum + (animal.estimated_value || 0), 0),
    growthRate: 5.2 // Mock data for now
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

  const currentDate = new Date().toLocaleDateString('am-ET', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'ተጠቃሚ';

  return (
    <div className="min-h-screen bg-background">
      {/* TopBar */}
      <div className="bg-card border-b border-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🛡️</span>
          <h1 className="text-xl font-bold text-foreground amharic-text">MyLivestock</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-foreground amharic-text font-medium">{userName} {t('home.userGreeting')}, 0913623785!</p>
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
  );
};