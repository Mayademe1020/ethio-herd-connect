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
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { NeutralCard, NeutralCardContent } from '@/components/ui/neutral-card';
import { SimpleHomeSkeleton } from '@/components/SimpleHomeSkeleton';

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
  const [reorderMode, setReorderMode] = useState(false);

  type QuickAction = { id: string; label: string; emoji: string; path: string };
  const buildDefaultActions = (): QuickAction[] => ([
    { id: 'identify', label: '🔍 Identify Animal', emoji: '🔍', path: '/identify' },
    { id: 'record-milk', label: '🥛 Record Milk', emoji: '🥛', path: '/record-milk' },
    { id: 'add-animal', label: '➕ Add Animal', emoji: '➕', path: '/register-animal' },
    { id: 'my-animals', label: '🐄 My Animals', emoji: '🐄', path: '/my-animals' },
    { id: 'marketplace', label: '🛒 Marketplace', emoji: '🛒', path: '/marketplace' },
  ]);

  const storageKey = `quick-actions-order-${user?.id || 'anon'}`;
  const [actions, setActions] = useState<QuickAction[]>(buildDefaultActions());

  useEffect(() => {
    // Load persisted order; fall back to default
    try {
      const orderRaw = localStorage.getItem(storageKey);
      const order = orderRaw ? JSON.parse(orderRaw) as string[] : null;
      const defaults = buildDefaultActions();
      if (order && Array.isArray(order)) {
        const byId = new Map(defaults.map(a => [a.id, a]));
        const merged = order
          .map(id => byId.get(id))
          .filter(Boolean) as QuickAction[];
        // Include any new actions not in saved order
        const remaining = defaults.filter(a => !order.includes(a.id));
        setActions([...merged, ...remaining]);
      } else {
        setActions(defaults);
      }
    } catch {
      setActions(buildDefaultActions());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, t]);

  const persistOrder = (list: QuickAction[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(list.map(a => a.id)));
    } catch {}
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    setActions(prev => {
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      persistOrder(next);
      return next;
    });
  };

  // Basic drag-and-drop for desktop; touch devices use arrow controls
  const onDragStart = (index: number, e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', String(index));
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onDrop = (index: number, e: React.DragEvent) => {
    const fromIndexStr = e.dataTransfer.getData('text/plain');
    const fromIndex = Number(fromIndexStr);
    if (!Number.isNaN(fromIndex) && fromIndex !== index) {
      moveItem(fromIndex, index);
    }
  };

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
  const { data: animalsCount = 0, isLoading: isAnimalsLoading } = useQuery<number>({
    queryKey: ['animals-count', user?.id],
    queryFn: () => user ? fetchAnimalsCount(user.id) : Promise.resolve(0),
    enabled: !!user && isOnline,
    staleTime: 30000, // 30 seconds
  });

  // Fetch daily milk stats (today and yesterday) - FIXED: using correct column names
  // Auto-refreshes every 30 seconds to show real-time updates
  const { data: dailyMilkStats = { today: 0, yesterday: 0 }, isLoading: isMilkStatsLoading } = useQuery<{ today: number; yesterday: number }>({
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

  const { data: todaysTasks = [], isLoading: isTasksLoading } = useQuery<Task[]>({
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
          .gte('recorded_at', today.toISOString());

        if (milkError) {
          console.error('Error fetching today\'s milk:', milkError);
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

  // Show skeleton while loading
  const isLoading = isAnimalsLoading || isMilkStatsLoading || isTasksLoading;
  
  if (isLoading) {
    return <SimpleHomeSkeleton />;
  }

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
              <EnhancedButton
                onClick={signOut}
                variant="destructive"
                size="sm"
                aria-label={t('auth.logout')}
                title={t('auth.logout')}
              >
                {t('auth.logout')}
              </EnhancedButton>
            </div>
          </div>

          {/* Sync Status Indicator */}
          <SyncStatusIndicator />
        </div>

        {/* Quick Actions */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{t('home.quickActions') || 'Quick Actions'}</h2>
          <EnhancedButton
            onClick={() => setReorderMode(v => !v)}
            variant="outline"
            size="sm"
            aria-label={reorderMode ? 'Done' : 'Reorder'}
            title={reorderMode ? 'Done' : 'Reorder'}
          >
            {reorderMode ? (t('common.done') || 'Done') : (t('common.reorder') || 'Reorder')}
          </EnhancedButton>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {actions.map((action, index) => (
            <NeutralCard
              key={action.id}
              asButton
              onClick={() => !reorderMode && navigate(action.path)}
              onDragStart={(e: any) => reorderMode && onDragStart(index, e)}
              onDragOver={onDragOver}
              onDrop={(e: any) => reorderMode && onDrop(index, e)}
              draggable={reorderMode}
              className={reorderMode ? 'opacity-90' : ''}
            >
              <NeutralCardContent className="p-6 sm:p-8 flex flex-col items-center">
                <div className="text-4xl sm:text-5xl mb-2">{action.emoji}</div>
                <div className="font-bold text-base sm:text-lg text-gray-800">{action.label}</div>
                {reorderMode && (
                  <div className="mt-3 flex gap-3">
                    <EnhancedButton
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); moveItem(index, Math.max(0, index - 1)); }}
                    >↑</EnhancedButton>
                    <EnhancedButton
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); moveItem(index, Math.min(actions.length - 1, index + 1)); }}
                    >↓</EnhancedButton>
                  </div>
                )}
              </NeutralCardContent>
            </NeutralCard>
          ))}
        </div>

        {/* Today's Tasks Widget */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            {t('home.todaysTasks')}
          </h2>
          {todaysTasks.length > 0 ? (
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <EnhancedButton
                  key={task.id}
                  onClick={task.action}
                  variant="outline"
                  size="lg"
                  aria-label={`${task.title} / ${task.titleAm}`}
                  title={`${task.title} / ${task.titleAm}`}
                  className="w-full flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left border border-yellow-200"
                >
                  <div className="text-2xl">{task.icon}</div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.titleAm}</p>
                  </div>
                  <div className="text-yellow-600">→</div>
                </EnhancedButton>
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
        <NeutralCard className="p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800">
            {t('home.quickStats')}
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <NeutralCard asButton className="p-5 text-center">
              <div className="text-3xl mb-2">🐄</div>
              <div className="text-5xl sm:text-6xl font-bold text-green-600 mb-2">
                {animalsCount}
              </div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">
                {t('home.totalAnimals')}
              </div>
            </NeutralCard>
            <NeutralCard asButton className="p-5 text-center">
              <div className="text-3xl mb-2">🥛</div>
              <div className="text-5xl sm:text-6xl font-bold text-purple-600 mb-2">
                {dailyMilkStats.yesterday}
                <span className="text-2xl sm:text-3xl">L</span>
              </div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">
                የትላንት / Yesterday
              </div>
            </NeutralCard>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <NeutralCard asButton className="p-5 text-center">
              <div className="text-3xl mb-2">🥛</div>
              <div className="text-5xl sm:text-6xl font-bold text-blue-600 mb-2">
                {dailyMilkStats.today}
                <span className="text-2xl sm:text-3xl">L</span>
              </div>
              <div className="text-sm sm:text-base text-gray-700 font-semibold">
                ዛም / Today
              </div>
            </NeutralCard>
          </div>
        </NeutralCard>
      </div>
    </div>
  );
};

export default SimpleHome;
