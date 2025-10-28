// src/pages/SimpleHome.tsx - MVP Home Dashboard

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { useTranslation } from '@/hooks/useTranslation';

// Helper functions to avoid type issues
const fetchAnimalsCount = async (userId: string): Promise<number> => {
  // @ts-ignore - Supabase type instantiation issue
  const result: any = await supabase
    .from('animals')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);
  
  if (result.error) {
    console.error('Error fetching animals count:', result.error);
    return 0;
  }
  return result.data?.length || 0;
};

const SimpleHome = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { t } = useTranslation();

  // Initialize background sync
  useBackgroundSync();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch animals count
  const { data: animalsCount = 0 } = useQuery<number>({
    queryKey: ['animals-count', user?.id],
    queryFn: () => user ? fetchAnimalsCount(user.id) : Promise.resolve(0),
    enabled: !!user && isOnline,
    staleTime: 30000, // 30 seconds
  });

  // Fetch milk records for this week
  const { data: weeklyMilk = 0 } = useQuery<number>({
    queryKey: ['weekly-milk', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user) return 0;
      
      // Get date 7 days ago
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('milk_production')
        .select('total_yield')
        .eq('user_id', user.id)
        .gte('production_date', weekAgo.toISOString());
      
      if (error) {
        console.error('Error fetching weekly milk:', error);
        return 0;
      }
      
      // Sum up all liters
      const total = data?.reduce((sum: number, record: any) => sum + (record.total_yield || 0), 0) || 0;
      return Math.round(total * 10) / 10; // Round to 1 decimal
    },
    enabled: !!user && isOnline,
    staleTime: 30000, // 30 seconds
  });

  // Fetch today's tasks (cows without milk records today)
  interface Task {
    id: string;
    title: string;
    titleAm: string;
    icon: string;
    action: () => void;
  }

  const { data: todaysTasks = [] } = useQuery<Task[]>({
    queryKey: ['todays-tasks', user?.id],
    queryFn: async (): Promise<Task[]> => {
      if (!user) return [];
      
      try {
        // Get start of today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get all cows - using type='cattle' and checking for cow in name/subtype
        const { data: cows, error: cowsError } = await supabase
          .from('animals')
          .select('id, name, type')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('type', 'cattle');
        
        if (cowsError) {
          console.error('Error fetching cows:', cowsError);
          return [];
        }
        if (!cows || cows.length === 0) return [];
        
        // Get today's milk records
        const { data: todaysMilk, error: milkError } = await supabase
          .from('milk_production')
          .select('animal_id')
          .eq('user_id', user.id)
          .gte('production_date', today.toISOString());
        
        if (milkError) {
          console.error('Error fetching today\'s milk:', milkError);
          return [];
        }
        
        // Find cows without milk records today
        const recordedAnimalIds = new Set(todaysMilk?.map(r => r.animal_id) || []);
        const cowsNeedingMilk = cows.filter(cow => !recordedAnimalIds.has(cow.id));
        
        // Return max 3 tasks
        return cowsNeedingMilk.slice(0, 3).map(cow => ({
          id: cow.id,
          title: `${cow.name} - Record milk`,
          titleAm: `${cow.name} - ወተት መዝግብ`,
          icon: '🥛',
          action: () => navigate('/record-milk')
        }));
      } catch (error) {
        console.error('Error in todaysTasks query:', error);
        return [];
      }
    },
    enabled: !!user && isOnline,
    staleTime: 60000, // 1 minute
  });

  // Get user's first name from phone or email
  const getUserGreeting = () => {
    if (user?.phone) {
      return user.phone.slice(-4); // Last 4 digits
    }
    return 'Farmer';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Sync Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {t('home.welcome')}
              </h1>
              <p className="text-gray-600">{getUserGreeting()}</p>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              {t('auth.logout')}
            </button>
          </div>

          {/* Sync Status Indicator */}
          <SyncStatusIndicator />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/record-milk')}
            className="bg-blue-500 text-white p-6 sm:p-8 rounded-lg shadow-md hover:bg-blue-600 transition-colors active:scale-95 min-h-[120px] sm:min-h-[140px]"
          >
            <div className="text-4xl sm:text-5xl mb-2">🥛</div>
            <div className="font-bold text-base sm:text-lg">{t('home.recordMilk')}</div>
          </button>

          <button
            onClick={() => navigate('/register-animal')}
            className="bg-green-500 text-white p-6 sm:p-8 rounded-lg shadow-md hover:bg-green-600 transition-colors active:scale-95 min-h-[120px] sm:min-h-[140px]"
          >
            <div className="text-4xl sm:text-5xl mb-2">➕</div>
            <div className="font-bold text-base sm:text-lg">{t('home.addAnimal')}</div>
          </button>

          <button
            onClick={() => navigate('/my-animals')}
            className="bg-purple-500 text-white p-6 sm:p-8 rounded-lg shadow-md hover:bg-purple-600 transition-colors active:scale-95 min-h-[120px] sm:min-h-[140px]"
          >
            <div className="text-4xl sm:text-5xl mb-2">🐄</div>
            <div className="font-bold text-base sm:text-lg">{t('home.myAnimals')}</div>
          </button>

          <button
            onClick={() => navigate('/marketplace')}
            className="bg-orange-500 text-white p-6 sm:p-8 rounded-lg shadow-md hover:bg-orange-600 transition-colors active:scale-95 min-h-[120px] sm:min-h-[140px]"
          >
            <div className="text-4xl sm:text-5xl mb-2">🛒</div>
            <div className="font-bold text-base sm:text-lg">{t('home.marketplace')}</div>
          </button>
        </div>

        {/* Today's Tasks Widget */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            {t('home.todaysTasks')}
          </h2>
          {todaysTasks.length > 0 ? (
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={task.action}
                  className="w-full flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left border border-yellow-200"
                >
                  <div className="text-2xl">{task.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.titleAm}</p>
                  </div>
                  <div className="text-yellow-600">→</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">✓</div>
              <p className="text-sm">{t('home.noTasks')}</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            {t('home.quickStats')}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:border-green-300 transition-colors">
              <div className="text-3xl mb-2">🐄</div>
              <div className="text-5xl sm:text-6xl font-bold text-green-600 mb-2">
                {animalsCount}
              </div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">
                {t('home.totalAnimals')}
              </div>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <div className="text-3xl mb-2">🥛</div>
              <div className="text-5xl sm:text-6xl font-bold text-blue-600 mb-2">
                {weeklyMilk}
                <span className="text-2xl sm:text-3xl">{t('home.liters')}</span>
              </div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">
                {t('home.milkThisWeek')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;
