import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Scan, Plus, Droplets, Beef, Check, Bell } from 'lucide-react';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEthiopianDashboard } from '@/utils/ethiopianCalendar';
import { cacheData, getCachedData, STORES } from '@/utils/indexedDB';
import { useNetworkStatus } from '@/contexts/NetworkStatusContext';

const fetchAnimalsCount = async (userId: string): Promise<number> => {
  const result: { count: number | null; error: { message?: string } | null } = await supabase
    .from('animals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true);

  if (result.error) {
    console.error('Error fetching animals count:', result.error);
    return 0;
  }
  return result.count || 0;
};

interface ChecklistItem {
  id: string;
  name: string;
  task: string;
  taskAm: string;
  status: 'pending' | 'done';
  detail: string;
  action: () => void;
}

const timeGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { icon: '🌅', en: 'Good morning', am: 'እንደምን አደሩ' };
  if (h < 17) return { icon: '☀️', en: 'Good afternoon', am: 'እንደምን ዋሉ' };
  return { icon: '🌙', en: 'Good evening', am: 'እንደምን አመሹ' };
};

const SimpleHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const { t } = useTranslation();
  const greeting = timeGreeting();

  useBackgroundSync();

  const { data: animalsCount = 0, isLoading: isAnimalsLoading } = useQuery<number>({
    queryKey: ['animals-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      try {
        const count = await fetchAnimalsCount(user.id);
        // Cache for offline
        await cacheData(STORES.ANIMALS, [{ id: 'count', count }], user.id);
        return count;
      } catch {
        // Offline fallback: read from cache
        const cached = await getCachedData<{ id: string; count: number }>(STORES.ANIMALS, user.id);
        const countItem = cached.find(c => c.id === 'count');
        return countItem?.count || 0;
      }
    },
    enabled: !!user,
    staleTime: 30000,
  });

  const { data: milkStats = { today: 0, yesterday: 0, week: 0 }, isLoading: isMilkStatsLoading } = useQuery<{ today: number; yesterday: number; week: number }>({
    queryKey: ['milk-stats', user?.id],
    queryFn: async (): Promise<{ today: number; yesterday: number; week: number }> => {
      if (!user) return { today: 0, yesterday: 0, week: 0 };

      try {
        // Single query: fetch all milk records from the past week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from('milk_production')
          .select('liters, recorded_at')
          .eq('user_id', user.id)
          .gte('recorded_at', weekAgo.toISOString());

        if (error) console.error('Error fetching milk stats:', error);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let todaySum = 0;
        let yesterdaySum = 0;
        let weekSum = 0;

        for (const row of data || []) {
          const recordedAt = new Date(row.recorded_at);
          const liters = row.liters || 0;
          weekSum += liters;
          if (recordedAt >= today && recordedAt < tomorrow) todaySum += liters;
          if (recordedAt >= yesterday && recordedAt < today) yesterdaySum += liters;
        }

        const stats = {
          today: Math.round(todaySum * 10) / 10,
          yesterday: Math.round(yesterdaySum * 10) / 10,
          week: Math.round(weekSum * 10) / 10,
        };

        // Cache for offline
        await cacheData(STORES.MILK_PRODUCTION, [{ id: 'milk-stats', ...stats }], user.id);

        return stats;
      } catch {
        // Offline fallback
        interface CachedMilkStat { id: string; today: number; yesterday: number; week: number }
        const cached = await getCachedData<CachedMilkStat>(STORES.MILK_PRODUCTION, user.id);
        const statsItem = cached.find(c => c.id === 'milk-stats');
        return statsItem || { today: 0, yesterday: 0, week: 0 };
      }
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const { data: checklist = { pending: [], done: [] }, isLoading: isTasksLoading } = useQuery<{ pending: ChecklistItem[]; done: ChecklistItem[] }>({
    queryKey: ['checklist', user?.id],
    queryFn: async (): Promise<{ pending: ChecklistItem[]; done: ChecklistItem[] }> => {
      if (!user) return { pending: [], done: [] };

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: cows, error: cowsError } = await supabase
          .from('animals')
          .select('id, name')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .eq('type', 'cattle');

        if (cowsError) {
          console.error('Error fetching cows:', cowsError);
          return { pending: [], done: [] };
        }
        if (!cows || cows.length === 0) return { pending: [], done: [] };

        const { data: todaysMilk, error: milkError } = await supabase
          .from('milk_production')
          .select('animal_id, liters')
          .eq('user_id', user.id)
          .gte('recorded_at', today.toISOString());

        if (milkError) {
          console.error('Error fetching today\'s milk:', milkError);
        }

        const milkMap = new Map<string, number>();
        todaysMilk?.forEach(r => {
          milkMap.set(r.animal_id, (milkMap.get(r.animal_id) || 0) + (r.liters || 0));
        });

        const pending: ChecklistItem[] = [];
        const done: ChecklistItem[] = [];

        cows.forEach(cow => {
          const amount = milkMap.get(cow.id);
          if (amount !== undefined) {
            done.push({
              id: cow.id,
              name: cow.name,
              task: 'Record milk',
              taskAm: 'ወተት ማጠብ',
              status: 'done',
              detail: `${amount}L`,
              action: () => navigate('/milk/record'),
            });
          } else {
            pending.push({
              id: cow.id,
              name: cow.name,
              task: 'Record milk',
              taskAm: 'ወተት ማጠብ',
              status: 'pending',
              detail: '',
              action: () => navigate('/milk/record'),
            });
          }
        });

        return { pending: pending.slice(0, 5), done: done.slice(0, 3) };
      } catch (error) {
        console.error('Error in checklist query:', error);
        return { pending: [], done: [] };
      }
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const isLoading = isAnimalsLoading || isMilkStatsLoading || isTasksLoading;

  const getUserDisplay = () => {
    if (user?.phone) return user.phone.slice(-4);
    return 'አለሙ';
  };

  const { language } = useLanguage();
  const ethiopianDateStr = formatEthiopianDashboard(language === 'am' ? 'am' : 'en');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50/30 p-4 pb-28">
        <div className="max-w-lg mx-auto space-y-6 animate-pulse">
          <div className="space-y-2">
            <div className="h-7 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-64" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-12 bg-gray-200 rounded w-full" />
            <div className="h-12 bg-gray-200 rounded w-full" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30 p-4 pb-28">
      <div className="max-w-lg mx-auto">

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 leading-none">
              <span className="mr-2">{greeting.icon}</span>
              {language === 'am'
                ? `እንደምን አደሩ ${getUserDisplay()}`
                : `${greeting.en}, ${getUserDisplay()}`
              }
            </h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-400'}`} title={isOnline ? 'Online' : 'Offline'} />
              <button
                onClick={() => navigate('/notification-settings')}
                className="p-2 rounded-full hover:bg-gray-200/50 active:scale-95 transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{ethiopianDateStr}</p>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ዛሬ · Today</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {checklist.pending.length === 0 && checklist.done.length === 0 ? (
          <div className="text-center py-12">
            <Check className="w-10 h-10 mx-auto mb-3 text-green-400" />
            <p className="text-sm text-gray-500">ሁሉም ተከናውኗል · All done</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 overflow-hidden mb-5">
            {checklist.pending.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-amber-50/50 active:scale-[0.99] transition-all text-left border-b border-gray-100 last:border-b-0"
              >
                <div className="w-5 h-5 rounded border-2 border-gray-300 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.task}</p>
                </div>
              </button>
            ))}

            {checklist.done.length > 0 && (
              <>
                <div className="h-px bg-gray-200 mx-4" />
                {checklist.done.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50/30 active:scale-[0.99] transition-all text-left"
                  >
                    <div className="w-5 h-5 rounded border-2 border-green-400 bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-500 text-sm line-through">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.detail}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-6">
            <div>
              <span className="text-2xl font-bold text-gray-900">{milkStats.today}L</span>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">ወተት · Milk</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">{animalsCount}</span>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">ላሞች · Cows</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">{checklist.done.length + checklist.pending.length}</span>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">ሪከርድ · Rec</p>
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-1.5">
            <span className="text-xs text-gray-400">ትናንት {milkStats.yesterday}L</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">ወቅት {milkStats.week}L</span>
          </div>
        </div>

      </div>

      <div className="fixed left-1/2 -translate-x-1/2 bottom-[88px] z-40">
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/80 px-3 py-2">
          <button onClick={() => navigate('/identify/simple')} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-all" aria-label="Scan">
            <Scan className="w-5 h-5 text-gray-600" />
            <span className="text-[10px] text-gray-500">Scan</span>
          </button>
          <div className="w-px h-8 bg-gray-200" />
          <button onClick={() => navigate('/register-animal')} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-all" aria-label="Add Animal">
            <Plus className="w-5 h-5 text-gray-600" />
            <span className="text-[10px] text-gray-500">Add</span>
          </button>
          <div className="w-px h-8 bg-gray-200" />
          <button onClick={() => navigate('/milk/record')} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-all" aria-label="Record Milk">
            <Droplets className="w-5 h-5 text-gray-600" />
            <span className="text-[10px] text-gray-500">Milk</span>
          </button>
          <div className="w-px h-8 bg-gray-200" />
          <button onClick={() => navigate('/animals')} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-all" aria-label="My Animals">
            <Beef className="w-5 h-5 text-gray-600" />
            <span className="text-[10px] text-gray-500">All</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleHome;
