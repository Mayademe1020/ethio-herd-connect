// src/pages/SimpleHome.tsx - MVP Home Dashboard

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { useTranslation } from '@/hooks/useTranslation';
import { NotificationDropdown } from '@/components/NotificationDropdown';

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

  // Fetch daily milk stats (today and yesterday) - FIXED: using correct column names
  // Auto-refreshes every 30 seconds to show real-time updates
  const { data: dailyMilkStats = { today: 0, yesterday: 0 } } = useQuery<{ today: number; yesterday: number }>({
    queryKey: ['daily-milk-stats', user?.id],
    queryFn: async (): Promise<{ today: number; yesterday: number }> => {
      if (!user) return { today: 0, yesterday: 0 };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's milk
      const { data: todayData, error: todayError } = await supabase
        .from('milk_production')
        .select('liters')
        .eq('user_id', user.id)
        .gte('recorded_at', today.toISOString())
        .lt('recorded_at', tomorrow.toISOString());

      if (todayError) {
        console.error('Error fetching today\'s milk:', todayError);
      }

      // Get yesterday's milk
      const { data: yesterdayData, error: yesterdayError } = await supabase
        .from('milk_production')
        .select('liters')
        .eq('user_id', user.id)
        .gte('recorded_at', yesterday.toISOString())
        .lt('recorded_at', today.toISOString());

      if (yesterdayError) {
        console.error('Error fetching yesterday\'s milk:', yesterdayError);
      }

      const todayTotal = todayData?.reduce((sum: number, record: any) => sum + (record.liters || 0), 0) || 0;
      const yesterdayTotal = yesterdayData?.reduce((sum: number, record: any) => sum + (record.liters || 0), 0) || 0;

      return {
        today: Math.round(todayTotal * 10) / 10,
        yesterday: Math.round(yesterdayTotal * 10) / 10
      };
    },
    enabled: !!user && isOnline,
    staleTime: 10000, // 10 seconds - data considered fresh
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnMount: true, // Refresh when component mounts
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

        // Get today's milk records - FIXED: using correct column name 'recorded_at'
        const { data: todaysMilk, error: milkError } = await supabase
          .from('milk_production')
          .select('animal_id')
          .eq('user_id', user.id)
          .gte('recorded_at', today.toISOString());  // FIXED: changed from 'production_date' to 'recorded_at'

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
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                {t('auth.logout')}
              </button>
            </div>
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
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:border-green-300 transition-colors">
              <div className="text-3xl mb-2">🐄</div>
              <div className="text-5xl sm:text-6xl font-bold text-green-600 mb-2">
                {animalsCount}
              </div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">
                {t('home.totalAnimals')}
              </div>
            </div>
            <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-colors">
              <div className="text-3xl mb-2">🥛</div>
              <div className="text-5xl sm:text-6xl font-bold text-purple-600 mb-2">
                {dailyMilkStats.yesterday}
                <span className="text-2xl sm:text-3xl">L</span>
              </div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">
                የትላንት / Yesterday
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <div className="text-3xl mb-2">🥛</div>
              <div className="text-5xl sm:text-6xl font-bold text-blue-600 mb-2">
                {dailyMilkStats.today}
                <span className="text-2xl sm:text-3xl">L</span>
              </div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">
                ዛሬ / Today
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;
