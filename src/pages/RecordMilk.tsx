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

  const [selectedCow, setSelectedCow] = useState<Animal | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(true);

  // Fetch cows (cattle with subtype 'Cow' or female animals that produce milk)
  const { data: cows = [], isLoading } = useQuery<Animal[]>({
    queryKey: ['cows', user?.id],
    queryFn: async (): Promise<Animal[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'cattle');

      if (error) {
        console.error('Error fetching cows:', error);
        return [];
      }

      // Map to Animal format and filter for cows (female cattle that produce milk)
      return (data || []).map((animal: any) => ({
        id: animal.id,
        name: animal.name,
        type: animal.type,
        subtype: animal.subtype || 'Cow',
        photo_url: animal.photo_url
      })).filter((animal: Animal) => 
        animal.subtype?.toLowerCase().includes('cow') ||
        animal.subtype?.toLowerCase() === 'female' ||
        !animal.subtype // If no subtype, assume it's a cow
      );
    },
    enabled: !!user
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
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-blue-600 rounded-lg transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {selectedCow ? 'Select Amount' : 'Record Milk'}
            </h1>
            <p className="text-sm opacity-90">
              {selectedCow ? 'መጠን ይምረጡ' : 'ወተት መዝግብ'}
            </p>
          </div>
          {selectedCow && (
            <div className="text-right">
              <div className="text-sm opacity-90">Step 2 of 2</div>
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">እየጫነ ነው... / Loading...</p>
          </div>
        )}

        {/* No Cows State */}
        {!isLoading && cows.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🐄</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              ላም የለም / No Cows Found
            </h2>
            <p className="text-gray-600 mb-6">
              You need to register a cow first before recording milk.
            </p>
            <button
              onClick={() => navigate('/register-animal')}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              ላም ያስመዝግቡ / Register Cow
            </button>
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
                ላም ይምረጡ / Select Cow
              </h2>
              <p className="text-sm text-gray-600">
                Step 1 of 2 • Click on a cow to continue
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sortedCows.map((cow) => (
                    <div
                      key={cow.id}
                      onClick={() => handleCowSelect(cow)}
                      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all active:scale-95 text-left border-2 border-transparent hover:border-blue-400 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        {/* Photo or Icon */}
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                          {cow.photo_url ? (
                            <img
                              src={cow.photo_url}
                              alt={cow.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl">🐄</span>
                          )}

                          {/* Favorite Star */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(cow.id);
                            }}
                            className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white transition-colors z-10"
                            aria-label="Toggle favorite"
                          >
                            {favorites.has(cow.id) ? (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            ) : (
                              <StarOff className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-800 truncate">
                            {cow.name}
                          </h3>
                          {cow.animal_id && (
                            <p className="text-xs text-gray-500 font-mono">
                              {cow.animal_id}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            {cow.subtype || 'Cow'}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                            <span>✓</span>
                            <span>Ready to record</span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="text-blue-500 text-2xl">→</div>
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
          <div className="space-y-4">
            {/* Selected Cow Info */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {selectedCow.photo_url ? (
                    <img
                      src={selectedCow.photo_url}
                      alt={selectedCow.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">🐄</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedCow.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedCow.subtype || 'Cow'}
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Selector */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <MilkAmountSelector
                onAmountSelected={handleAmountSelected}
                selectedAmount={selectedAmount}
              />
            </div>

            {/* Submit Button */}
            {selectedAmount && (
              <button
                onClick={handleSubmit}
                disabled={isRecording}
                className="w-full py-4 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                {isRecording ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>እያስቀመጠ... / Saving...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>መዝግብ / Record Milk</span>
                  </>
                )}
              </button>
            )}
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
