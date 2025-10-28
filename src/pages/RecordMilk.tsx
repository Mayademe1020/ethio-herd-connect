// src/pages/RecordMilk.tsx
// Page for recording milk production in 2 clicks

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useMilkRecording } from '@/hooks/useMilkRecording';
import { MilkAmountSelector } from '@/components/MilkAmountSelector';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface Animal {
  id: string;
  name: string;
  type: string;
  subtype: string;
  photo_url?: string;
}

const RecordMilk = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recordMilkAsync, isRecording } = useMilkRecording();
  
  const [selectedCow, setSelectedCow] = useState<Animal | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
  };

  const handleSubmit = async () => {
    if (!selectedCow || !selectedAmount) return;

    try {
      await recordMilkAsync({
        animal_id: selectedCow.id,
        liters: selectedAmount
      });

      // Show success toast
      setToastMessage(
        navigator.onLine 
          ? '✓ ወተት ተመዝግቧል / Milk recorded successfully!'
          : '📱 ወተት በስልክዎ ተቀምጧል / Milk saved on your phone'
      );
      setShowToast(true);

      // Navigate back to home after 1.5 seconds
      setTimeout(() => {
        navigate('/');
      }, 1500);
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
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                ላም ይምረጡ / Select Cow
              </h2>
              <p className="text-sm text-gray-600">
                Step 1 of 2 • Click on a cow to continue
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cows.map((cow) => (
                <button
                  key={cow.id}
                  onClick={() => handleCowSelect(cow)}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all active:scale-95 text-left border-2 border-transparent hover:border-blue-400"
                >
                  <div className="flex items-center gap-4">
                    {/* Photo or Icon */}
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {cow.photo_url ? (
                        <img
                          src={cow.photo_url}
                          alt={cow.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">🐄</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-800 truncate">
                        {cow.name}
                      </h3>
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
                </button>
              ))}
            </div>
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
