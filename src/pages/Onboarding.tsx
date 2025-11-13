// src/pages/Onboarding.tsx - Collect farm name after first login

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { toast } from 'sonner';
import { validateFullName } from '@/utils/nameValidation';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [farmerName, setFarmerName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleNameChange = (value: string) => {
    setFarmerName(value);
    if (touched) {
      const validation = validateFullName(value);
      setNameError(validation.isValid ? '' : validation.error || '');
    }
  };

  const handleNameBlur = () => {
    setTouched(true);
    const validation = validateFullName(farmerName);
    setNameError(validation.isValid ? '' : validation.error || '');
  };

  const handleSubmit = async () => {
    // Validate name before submission
    const validation = validateFullName(farmerName);
    if (!validation.isValid) {
      setNameError(validation.error || '');
      setTouched(true);
      // Show bilingual error toast
      toast.error(validation.errorAm || validation.error || 'Validation failed', {
        description: validation.error
      });
      return;
    }

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);
    try {
      // Extract phone from email (911234567@ethioherd.app → 911234567)
      const phone = user.email?.split('@')[0] || '';

      // Create or update profile
      const { error } = await supabase
        .from('profiles' as any)
        .upsert({
          id: user.id,
          phone: phone,
          farmer_name: farmerName.trim(),
          farm_name: farmName.trim() || null,
        } as any);

      if (error) throw error;

      toast.success('✓ እንኳን ደህና መጡ! / Welcome!', {
        description: `${farmerName}${farmName ? ` - ${farmName}` : ''}`
      });

      // Wait a moment for the database to process, then redirect
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    } catch (error: any) {
      console.error('Onboarding error:', error);
      
      // Detect network errors specifically
      if (error.message?.includes('fetch') || 
          error.message?.includes('network') || 
          error.message?.includes('Failed to fetch') ||
          !navigator.onLine) {
        toast.error('የኢንተርኔት ግንኙነት ችግር / Network Error', {
          description: 'እባክዎ ግንኙነትዎን ያረጋግጡ / Please check your connection',
          action: {
            label: 'እንደገና ይሞክሩ / Retry',
            onClick: () => handleSubmit()
          }
        });
      } else {
        // Show bilingual error messages
        toast.error('መረጃ ማስቀመጥ አልተቻለም / Failed to save', {
          description: error.message || 'Please try again'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">🌾</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              እንኳን ደህና መጡ!
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome to Ethio Herd Connect
            </p>
          </div>

          {/* Farmer Name Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-base font-medium mb-3 text-gray-700">
                ስምዎ / Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={handleNameBlur}
                placeholder="ለምሳሌ: አበበ ተሰማ / e.g., Abebe Tesema"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-lg ${
                  nameError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-green-500'
                }`}
                style={{ minHeight: '48px' }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                data-form-type="other"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && farmerName.trim()) {
                    handleSubmit();
                  }
                }}
              />
              {nameError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    {nameError}
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-600 mt-2">
                የእርስዎ ሙሉ ስም (ስም እና የአባት ስም) / Your full name (first name and father's name)
              </p>
            </div>

            <div>
              <label className="block text-base font-medium mb-3 text-gray-700">
                የእርሻ ስም / Farm Name <span className="text-gray-400">(አማራጭ / optional)</span>
              </label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="ለምሳሌ: የአበበ እርሻ / e.g., Abebe's Farm"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-lg"
                style={{ minHeight: '48px' }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                data-form-type="other"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && farmerName.trim()) {
                    handleSubmit();
                  }
                }}
              />
              <p className="text-sm text-gray-600 mt-2">
                ይህ ስም በገበያ ላይ ይታያል / This name will be shown in marketplace
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !farmerName.trim()}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
              style={{ minHeight: '56px' }}
            >
              {loading ? 'እባክዎ ይጠብቁ... / Please wait...' : '✓ ቀጥል / Continue'}
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 ስሙን በኋላ መቀየር ይችላሉ / You can change this name later in settings
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            ✓ Works offline • ✓ Amharic support • ✓ Free to use
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
