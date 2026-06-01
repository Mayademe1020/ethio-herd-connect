// src/pages/RecordMilk.tsx
// Page for recording milk production in 2 clicks

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useMilkRecording } from '@/hooks/useMilkRecording';
import { ArrowLeft } from 'lucide-react';
import { scheduleReminder, getUserReminders } from '@/services/reminderService';
import { useNetworkStatus } from '@/contexts/NetworkStatusContext';
import { logger } from '@/utils/logger';
import { CowSelectionStep, AmountSelectionStep, ReminderToggle } from '@/components/record-milk';

interface Animal {
  id: string;
  animal_id?: string;
  name: string;
  type: string;
  subtype: string;
  photo_url?: string;
}

const RecordMilk = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDemoMode, getDemoData } = useDemoMode();
  const { recordMilkAsync, isRecording } = useMilkRecording();
  const { isOnline } = useNetworkStatus();

  const [selectedCow, setSelectedCow] = useState<Animal | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(true);

  const { data: cows = [], isLoading } = useQuery<Animal[]>({
    queryKey: ['milk-producing-animals', user?.id],
    queryFn: async (): Promise<Animal[]> => {
      if (!user) return [];
      try {
        const { data, error } = await supabase
          .from('animals')
          .select('id, animal_id, name, type, subtype, photo_url')
          .eq('user_id', user.id);
        if (error) {
          const msg = String(error?.message || '').toLowerCase();
          const isAborted = error?.name === 'AbortError' || msg.includes('abort') || msg.includes('cancel');
          if (!isAborted) console.error('Error fetching animals:', error);
          return [];
        }
        const femaleMilkProducingSubtypes = ['Cow', 'Female Goat', 'Ewe', 'Female', 'Hen'];
        const animals = (data || [])
          .map((animal: Animal) => ({
            id: animal.id,
            animal_id: animal.animal_id,
            name: animal.name,
            type: animal.type,
            subtype: animal.subtype,
            photo_url: animal.photo_url,
          }))
          .filter((animal: Animal) => femaleMilkProducingSubtypes.includes(animal.subtype || ''));
        try {
          const { cacheData, STORES } = await import('@/utils/indexedDB');
          await cacheData(STORES.ANIMALS, data || [], user.id);
        } catch (e) { logger.warn('Failed to cache animals in IndexedDB:', e); }
        return animals;
      } catch {
        try {
          const { getCachedData, STORES } = await import('@/utils/indexedDB');
          const cached = await getCachedData<Animal>(STORES.ANIMALS, user.id);
          const femaleMilkProducingSubtypes = ['Cow', 'Female Goat', 'Ewe', 'Female', 'Hen'];
          return cached
            .filter((animal: Animal) => femaleMilkProducingSubtypes.includes(animal.subtype || ''))
            .map((animal: Animal) => ({
              id: animal.id,
              animal_id: animal.animal_id,
              name: animal.name,
              type: animal.type,
              subtype: animal.subtype,
              photo_url: animal.photo_url,
            }));
        } catch {
          return [];
        }
      }
    },
    enabled: !!user,
  });

  useEffect(() => {
    const savedFavorites = localStorage.getItem('milk-recording-favorites');
    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  useEffect(() => {
    const loadReminders = async () => {
      if (!user?.id) return;
      try {
        setReminderLoading(true);
        const result = await getUserReminders(user.id);
        if (result.success && result.reminders) {
          const anyEnabled = result.reminders.some(
            (r) => (r.type === 'milk_morning' || r.type === 'milk_afternoon') && r.enabled
          );
          setReminderEnabled(anyEnabled);
        }
      } catch (error) {
        const errorCode = (error as { code?: string } | null)?.code;
        if (errorCode !== '42P01') console.warn('Could not load reminders');
      } finally {
        setReminderLoading(false);
      }
    };
    loadReminders();
  }, [user?.id]);

  useEffect(() => {
    if (isDemoMode && selectedCow && !selectedAmount) {
      const demoAmount = getDemoData('milk_amount');
      if (demoAmount) setSelectedAmount(demoAmount);
    }
  }, [isDemoMode, selectedCow, selectedAmount, getDemoData]);

  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem('milk-recording-favorites', JSON.stringify([...newFavorites]));
    setFavorites(newFavorites);
  };

  const toggleFavorite = (animalId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(animalId)) newFavorites.delete(animalId);
    else newFavorites.add(animalId);
    saveFavorites(newFavorites);
  };

  const handleSubmit = async () => {
    if (!selectedCow || !selectedAmount) return;
    try {
      await recordMilkAsync({ animal_id: selectedCow.id, liters: selectedAmount });
      setToastMessage(
        navigator.onLine
          ? '✓ ወተት ተመዝግቧል / Milk recorded successfully!'
          : '📱 ወተት በስልክዎ ተቀምጧል / Milk saved on your phone'
      );
      setShowToast(true);
      setTimeout(() => navigate('/record-milk'), isDemoMode ? 1000 : 1500);
    } catch (error) {
      console.error('Error recording milk:', error);
      setToastMessage('❌ ስህተት ተፈጥሯል / Error occurred');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleReminderToggle = async () => {
    if (!user?.id || reminderLoading) return;
    try {
      const newEnabled = !reminderEnabled;
      setReminderEnabled(newEnabled);
      await Promise.all([
        scheduleReminder(user.id, 'milk_morning', '06:00', newEnabled),
        scheduleReminder(user.id, 'milk_afternoon', '18:00', newEnabled),
      ]);
      setToastMessage(newEnabled ? '🔔 Reminders enabled' : '🔕 Reminders disabled');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Error toggling reminder:', error);
      setReminderEnabled(!reminderEnabled);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm" style={{ height: '56px' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => (selectedCow ? setSelectedCow(null) : navigate('/'))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-semibold text-gray-900">{selectedCow ? 'Select Amount' : 'Record Milk'}</h1>
          </div>
          {selectedCow && <div className="text-sm text-gray-500">Step 2 of 2</div>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {!selectedCow && !isLoading && cows.length > 0 && (
          <ReminderToggle enabled={reminderEnabled} loading={reminderLoading} onToggle={handleReminderToggle} />
        )}

        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 skeleton rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && cows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <span className="text-4xl">🐄</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No Female Animals Found</h2>
            <p className="text-gray-600 mb-8 max-w-sm leading-relaxed">
              Register female animals (cows, goats, sheep) that produce milk to start tracking your production.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <button onClick={() => navigate('/register-animal')} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <span>➕</span><span>Register Animal</span>
              </button>
              <button onClick={() => navigate('/my-animals')} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <span>👁️</span><span>View All</span>
              </button>
            </div>
          </div>
        )}

        {!isLoading && cows.length > 0 && !selectedCow && (
          <CowSelectionStep
            cows={cows}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectCow={(cow) => { setSelectedCow(cow); setSelectedAmount(undefined); }}
          />
        )}

        {selectedCow && (
          <AmountSelectionStep
            selectedCow={selectedCow}
            selectedAmount={selectedAmount}
            isRecording={isRecording}
            onAmountChange={setSelectedAmount}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {showToast && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-lg shadow-xl max-w-md animate-in slide-in-from-bottom">
            <p className="text-center font-medium">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordMilk;
