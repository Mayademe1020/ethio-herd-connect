// src/pages/RecordMilk.tsx
// Page for recording milk production in 2 clicks

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { useMilkRecording } from '@/hooks/useMilkRecording';
import { MilkAmountSelector } from '@/components/MilkAmountSelector';
import { ArrowLeft, Loader2, Search, Star, StarOff, Bell, BellOff } from 'lucide-react';
import { scheduleReminder, getUserReminders } from '@/services/reminderService';

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
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const [selectedCow, setSelectedCow] = useState<Animal | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(true);

  // Track online/offline to avoid aborted network noise and support offline-first UX
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Fetch female animals that can produce milk
  const { data: cows = [], isLoading } = useQuery<Animal[]>({
    queryKey: ['milk-producing-animals', user?.id],
    queryFn: async (): Promise<Animal[]> => {
      if (!user) return [];
      if (!isOnline) return [];

      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        const msg = String(error?.message || '').toLowerCase();
        const isAborted = error?.name === 'AbortError' || msg.includes('abort') || msg.includes('cancel');
        if (!isAborted) {
          console.error('Error fetching animals:', error);
        }
        return [];
      }

      // Define female subtypes that can produce milk
      const femaleMilkProducingSubtypes = ['Cow', 'Female Goat', 'Ewe', 'Female', 'Hen'];

      // Map to Animal format and filter for female animals that produce milk
      return (data || []).map((animal: any) => ({
        id: animal.id,
        animal_id: animal.animal_id,
        name: animal.name,
        type: animal.type,
        subtype: animal.subtype,
        photo_url: animal.photo_url
      })).filter((animal: Animal) =>
        femaleMilkProducingSubtypes.includes(animal.subtype || '')
      );
    },
    enabled: !!user && isOnline
  });

  const handleCowSelect = (cow: Animal) => {
    setSelectedCow(cow);
    setSelectedAmount(undefined);
  };

  const handleAmountSelected = (amount: number) => {
    setSelectedAmount(amount);

    // In demo mode, auto-select cow if only one available and auto-submit
    if (isDemoMode && selectedCow && cows.length === 1) {
      setTimeout(() => handleSubmit(), 500); // Brief delay for UX
    }
  };

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('milk-recording-favorites');
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        setFavorites(new Set(parsed));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Load reminder status
  useEffect(() => {
    const loadReminders = async () => {
      if (!user?.id) return;

      try {
        setReminderLoading(true);
        const result = await getUserReminders(user.id);

        if (result.success && result.reminders) {
          // Check if any milk reminder is enabled
          const anyEnabled = result.reminders.some(
            (r) => (r.type === 'milk_morning' || r.type === 'milk_afternoon') && r.enabled
          );
          setReminderEnabled(anyEnabled);
        }
      } catch (error: any) {
        console.error('Error loading reminders:', error);
        // Silently handle missing table
        if (error?.code !== '42P01') {
          console.warn('Could not load reminders');
        }
      } finally {
        setReminderLoading(false);
      }
    };

    loadReminders();
  }, [user?.id]);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem('milk-recording-favorites', JSON.stringify([...newFavorites]));
    setFavorites(newFavorites);
  };

  // Toggle favorite
  const toggleFavorite = (animalId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(animalId)) {
      newFavorites.delete(animalId);
    } else {
      newFavorites.add(animalId);
    }
    saveFavorites(newFavorites);
  };

  // Pre-select amount in demo mode
  useEffect(() => {
    if (isDemoMode && selectedCow && !selectedAmount) {
      const demoAmount = getDemoData('milk_amount');
      if (demoAmount) {
        setSelectedAmount(demoAmount);
      }
    }
  }, [isDemoMode, selectedCow, selectedAmount, getDemoData]);

  const handleSubmit = async () => {
    if (!selectedCow || !selectedAmount) return;

    try {
      await recordMilkAsync({
        animal_id: selectedCow.id,
        liters: selectedAmount
      });

      // Show success toast (faster in demo mode)
      setToastMessage(
        navigator.onLine
          ? '✓ ወተት ተመዝግቧል / Milk recorded successfully!'
          : '📱 ወተት በስልክዎ ተቀምጧል / Milk saved on your phone'
      );
      setShowToast(true);

      // Navigate back to record milk page for consistency (MANDATORY)
      const delay = isDemoMode ? 1000 : 1500;
      setTimeout(() => {
        navigate('/record-milk');
      }, delay);
    } catch (error) {
      console.error('Error recording milk:', error);
      setToastMessage('❌ ስህተት ተፈጥሯል / Error occurred');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleBack = () => {
    if (selectedCow) {
      setSelectedCow(null);
      setSelectedAmount(undefined);
    } else {
      navigate('/');
    }
  };

  const handleReminderToggle = async () => {
    if (!user?.id || reminderLoading) return;

    try {
      const newEnabled = !reminderEnabled;
      setReminderEnabled(newEnabled);

      // Enable/disable both morning and afternoon reminders
      await Promise.all([
        scheduleReminder(user.id, 'milk_morning', '06:00', newEnabled),
        scheduleReminder(user.id, 'milk_afternoon', '18:00', newEnabled),
      ]);

      setToastMessage(
        newEnabled
          ? '🔔 Reminders enabled / ማስታወሻዎች ነቅተዋል'
          : '🔕 Reminders disabled / ማስታወሻዎች ጠፍተዋል'
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Error toggling reminder:', error);
      // Revert on error
      setReminderEnabled(!reminderEnabled);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm" style={{ height: '56px' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {selectedCow ? 'Select Amount' : 'Record Milk'}
            </h1>
          </div>
          {selectedCow && (
            <div className="text-sm text-gray-500">
              Step 2 of 2
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Reminder Toggle - Only show on cow selection screen */}
        {!selectedCow && !isLoading && cows.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {reminderEnabled ? (
                  <Bell className="w-5 h-5 text-blue-500" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {reminderEnabled ? 'Reminders On' : 'Reminders Off'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {reminderEnabled
                      ? 'Daily at 6 AM & 6 PM / በየቀኑ ጠዋት 6 እና ምሽት 6'
                      : 'Enable daily milk reminders / ዕለታዊ ማስታወሻዎችን ያንቁ'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReminderToggle}
                disabled={reminderLoading}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  reminderEnabled ? 'bg-blue-500' : 'bg-gray-300'
                } ${reminderLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    reminderEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {/* Skeleton for animal cards */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 skeleton rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4"></div>
                    <div className="skeleton h-3 w-1/2"></div>
                    <div className="skeleton h-3 w-1/4"></div>
                  </div>
                  <div className="skeleton h-5 w-5 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Empty State */}
        {!isLoading && cows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <span className="text-4xl">🐄</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              No Female Animals Found
            </h2>
            <p className="text-gray-600 mb-8 max-w-sm leading-relaxed">
              Register female animals (cows, goats, sheep) that produce milk to start tracking your production.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <button
                onClick={() => navigate('/register-animal')}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <span>➕</span>
                <span>Register Animal</span>
              </button>
              <button
                onClick={() => navigate('/my-animals')}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <span>👁️</span>
                <span>View All</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Select Cow */}
        {!isLoading && cows.length > 0 && !selectedCow && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="በስም ወይም በመለያ ያጣሩ / Search by name or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                ሴት እንስሳ ይምረጡ / Select Female Animal
              </h2>
              <p className="text-sm text-gray-600">
                Step 1 of 2 • Click on a female animal to continue
              </p>
            </div>

            {/* Filter and sort cows */}
            {(() => {
              const filteredCows = cows.filter(cow =>
                cow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (cow.animal_id && cow.animal_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (cow.subtype && cow.subtype.toLowerCase().includes(searchQuery.toLowerCase()))
              );

              // Sort: favorites first, then alphabetically
              const sortedCows = filteredCows.sort((a, b) => {
                const aFav = favorites.has(a.id);
                const bFav = favorites.has(b.id);
                if (aFav && !bFav) return -1;
                if (!aFav && bFav) return 1;
                return a.name.localeCompare(b.name);
              });

              return (
                <div className="space-y-3">
                  {sortedCows.map((cow) => (
                    <div
                      key={cow.id}
                      onClick={() => handleCowSelect(cow)}
                      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all active:scale-98 cursor-pointer border border-gray-200"
                    >
                      <div className="flex items-center gap-4">
                        {/* Photo */}
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {cow.photo_url ? (
                            <img
                              src={cow.photo_url}
                              alt={cow.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">🐄</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {cow.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {cow.subtype || 'Cow'}
                          </p>
                          {cow.animal_id && (
                            <p className="text-xs text-gray-500 font-mono">
                              ID: {cow.animal_id}
                            </p>
                          )}
                        </div>

                        {/* Favorite Star */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(cow.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          aria-label="Toggle favorite"
                        >
                          {favorites.has(cow.id) ? (
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          ) : (
                            <StarOff className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        {/* Arrow */}
                        <div className="text-gray-400 text-xl">→</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Step 2: Select Amount */}
        {selectedCow && (
          <div className="space-y-6">
            {/* Horizontal Animal Info Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {selectedCow.photo_url ? (
                    <img
                      src={selectedCow.photo_url}
                      alt={selectedCow.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🐄</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedCow.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedCow.subtype || 'Cow'}
                  </p>
                  {selectedCow.animal_id && (
                    <p className="text-xs text-gray-500 font-mono">
                      ID: {selectedCow.animal_id}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Input Section */}
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">How much milk?</h2>
                <p className="text-sm text-gray-600">Enter amount in liters</p>
              </div>

              {/* Large Number Input */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <input
                  type="text"
                  inputMode="decimal"
                  value={selectedAmount || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      const amount = parseFloat(value);
                      if (!isNaN(amount) && amount > 0 && amount <= 100) {
                        handleAmountSelected(amount);
                      } else if (value === '') {
                        handleAmountSelected(undefined);
                      }
                    }
                  }}
                  placeholder="0.0"
                  className="input-large-number w-full text-center"
                  autoFocus
                />
                <div className="text-center mt-4">
                  <span className="text-sm text-gray-500">L</span>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">Quick Select</p>
                <div className="flex justify-center gap-2">
                  {[2, 5, 10, 15, 20].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAmountSelected(amount)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all active:scale-95 text-sm font-medium ${
                        selectedAmount === amount
                          ? 'bg-emerald-500 border-emerald-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-emerald-400'
                      }`}
                    >
                      {amount}L
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              {selectedAmount && (
                <button
                  onClick={handleSubmit}
                  disabled={isRecording}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isRecording ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Save Record</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
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
