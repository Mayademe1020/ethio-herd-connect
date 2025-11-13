// src/components/OtpAuthForm.tsx - Phone + PIN Authentication (Ethiopia Only)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ETHIOPIA_CONSTANTS } from '@/constants/ethiopia';

export function OtpAuthForm() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  // Clean and validate Ethiopian phone number using constants
  const validatePhone = (phone: string): { valid: boolean; cleaned: string; error?: string } => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Remove leading 0 if present (0911234567 → 911234567)
    const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;

    // Use Ethiopia constants for validation
    if (withoutLeadingZero.length !== ETHIOPIA_CONSTANTS.PHONE_VALIDATION.MIN_LENGTH) {
      return { valid: false, cleaned: withoutLeadingZero, error: 'ስልክ ቁጥር 9 አሃዞች መሆን አለበት / Phone must be 9 digits' };
    }

    // Must start with 9 (Ethiopian mobile numbers)
    if (!withoutLeadingZero.startsWith(ETHIOPIA_CONSTANTS.PHONE_VALIDATION.STARTS_WITH)) {
      return { valid: false, cleaned: withoutLeadingZero, error: 'ስልክ ቁጥር በ 9 መጀመር አለበት / Phone must start with 9' };
    }

    return { valid: true, cleaned: withoutLeadingZero };
  };

  const signInWithPhonePin = async () => {
    setLoading(true);
    try {
      // Validate phone number
      const { valid, cleaned, error } = validatePhone(phoneNumber);
      if (!valid) {
        toast.error(error || 'Invalid phone number');
        setLoading(false);
        return;
      }

      // Validate PIN
      if (pin.length < 6) {
        toast.error('ፒን በጣም አጭር ነው / PIN too short', {
          description: 'PIN must be at least 6 digits'
        });
        setLoading(false);
        return;
      }

      // Create email format from phone: 911234567@ethioherd.app
      const email = `${cleaned}@ethioherd.app`;
      const password = pin;

      // Try to sign in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        // If user doesn't exist, create account
        if (signInError.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
          });

          if (signUpError) throw signUpError;

          // Auto-create profile for new user
          if (signUpData.user) {
            const { error: profileError } = await supabase
              .from('profiles' as any)
              .insert({
                id: signUpData.user.id,
                phone: cleaned,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (profileError) {
              console.error('Profile creation error:', profileError);
              // Don't throw - user can still complete onboarding
            }
          }

          toast.success('✓ መለያ ተፈጥሯል! / Account created!', {
            description: `Welcome! Phone: +251${cleaned}`
          });
          
          // Navigate after successful signup
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
        } else {
          throw signInError;
        }
      } else {
        toast.success('✓ እንኳን ደህና መጡ! / Welcome back!', {
          description: `Phone: +251${cleaned}`
        });
        
        // Navigate after successful login
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      }
    } catch (error: any) {
      toast.error('መግባት አልተቻለም / Login failed', {
        description: error.message || 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle phone input - only allow digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    setPhoneNumber(value);
  };

  // Handle PIN input - only allow digits
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    setPin(value);
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div>
          <label className="block text-base font-medium mb-3 text-gray-700">
            ስልክ ቁጥር / Phone Number
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 px-3 py-3 border-2 border-gray-300 rounded-lg text-lg font-medium text-gray-700">
              {ETHIOPIA_CONSTANTS.PHONE_COUNTRY_CODE}
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="911234567"
              maxLength={10}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-lg"
              style={{ minHeight: '48px' }}
              autoFocus
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            9 አሃዞች ያስገቡ / Enter 9 digits (e.g., 911234567)
          </p>
        </div>

        <div>
          <label className="block text-base font-medium mb-3 text-gray-700">
            ፒን / PIN
          </label>
          <input
            type="password"
            value={pin}
            onChange={handlePinChange}
            placeholder="••••••"
            maxLength={6}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-lg text-center tracking-widest"
            style={{ minHeight: '48px' }}
          />
          <p className="text-sm text-gray-600 mt-2">
            ቢያንስ 6 አሃዞች / At least 6 digits
          </p>
        </div>

        <button
          onClick={signInWithPhonePin}
          disabled={loading || phoneNumber.length < 9 || pin.length < 6}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
          style={{ minHeight: '56px' }}
        >
          {loading ? 'እባክዎ ይጠብቁ... / Please wait...' : '✓ ግባ / Login'}
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 አዲስ ተጠቃሚ? / New user? Just enter your phone and create a PIN to get started!
          </p>
        </div>
      </div>
    </div>
  );
}

export default OtpAuthForm;