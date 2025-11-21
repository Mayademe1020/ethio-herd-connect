// src/components/OtpAuthForm.tsx - Phone + PIN Authentication (Ethiopia Only)

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ETHIOPIA_CONSTANTS } from '@/constants/ethiopia';

export function OtpAuthForm() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);
  const [pinError, setPinError] = useState<string | undefined>(undefined);

  // Lightweight online/offline detection for Ethiopia's intermittent connectivity
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
        setPhoneError(error);
        toast.error(error || 'Invalid phone number');
        setLoading(false);
        return;
      }

      // Validate PIN
      if (pin.length < 6) {
        const msg = 'ፒን በጣም አጭር ነው / PIN too short';
        setPinError(msg);
        toast.error(msg, {
          description: 'PIN must be at least 6 digits'
        });
        setLoading(false);
        return;
      }

      // Block interactive auth when offline; show friendly guidance
      if (!isOnline) {
        toast.info('Offline mode: You can browse, but login needs internet.', {
          description: 'የመግባት ሂደት ኢንተርኔት ያስፈልጋል / Login requires connectivity'
        });
        setLoading(false);
        return;
      }

      // Create email format from phone: 911234567@ethioherd.app
      const email = `${cleaned}@ethioherd.app`;
      const password = pin;

      // Enhanced error handling for authentication
      try {
        // Try to sign in first
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (signInError) {
          console.log('Sign in error:', signInError.message);
          
          // If user doesn't exist, create account
          if (signInError.message.includes('Invalid login credentials') ||
              signInError.message.includes('Email not confirmed')) {
            
            console.log('Creating new account...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: email,
              password: password,
              options: {
                emailRedirectTo: undefined, // Skip email confirmation
              }
            });

            if (signUpError) {
              console.error('Sign up error:', signUpError);
              
              // If user already exists, try to sign in again
              if (signUpError.message.includes('already registered')) {
                const { error: retrySignInError } = await supabase.auth.signInWithPassword({
                  email: email,
                  password: password,
                });
                
                if (!retrySignInError) {
                  toast.success('✓ እንኳን ደህና መጡ! / Welcome back!', {
                    description: `Phone: +251${cleaned}`
                  });
                  setTimeout(() => navigate('/', { replace: true }), 500);
                  return;
                }
              }
              throw signUpError;
            }

            // Auto-create profile for new user
            if (signUpData.user) {
              const { error: profileError } = await supabase
                .from('profiles' as any)
                .insert({
                  id: signUpData.user.id,
                  phone: cleaned, // Store local format; onboarding can update
                  farmer_name: 'Farmer', // Default name required only
                  farm_name: null, // Optional field
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
      } catch (authError: any) {
        console.error('Authentication error:', authError);
        throw authError;
      }
    } catch (error: any) {
      console.error('Login error:', error);
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
    setPhoneError(undefined);
  };

  // Handle PIN input - only allow digits
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    setPin(value);
    setPinError(undefined);
  };

  return (
    <div className="w-full">
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); if (!loading) { void signInWithPhonePin(); } }}>
        <div>
          <label htmlFor="phone-input" className="block text-base font-medium mb-2 text-gray-800">
            ስልክ ቁጥር / Phone Number
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 px-3 py-3 border-2 border-gray-300 rounded-lg text-lg font-medium text-gray-700 select-none">
              {ETHIOPIA_CONSTANTS.PHONE_COUNTRY_CODE}
            </div>
            <input
              id="phone-input"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="tel-national"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="911234567"
              maxLength={10}
              aria-invalid={!!phoneError}
              aria-describedby="phone-help"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-lg leading-6 placeholder:text-gray-400"
              style={{ minHeight: '48px' }}
              autoFocus
            />
          </div>
          <p id="phone-help" className="text-sm text-gray-600 mt-2" aria-live="polite">
            9 አሃዞች ያስገቡ / Enter 9 digits (e.g., 911234567)
          </p>
          {phoneError && (
            <p className="text-sm text-red-600 mt-1" role="alert">{phoneError}</p>
          )}
        </div>

        <div>
          <label htmlFor="pin-input" className="block text-base font-medium mb-2 text-gray-800">
            ፒን / PIN
          </label>
          <input
            id="pin-input"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="current-password"
            value={pin}
            onChange={handlePinChange}
            placeholder="••••••"
            maxLength={6}
            aria-invalid={!!pinError}
            aria-describedby="pin-help"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-lg leading-6 text-center tracking-widest placeholder:text-gray-400"
            style={{ minHeight: '48px' }}
          />
          <p id="pin-help" className="text-sm text-gray-600 mt-2" aria-live="polite">
            ቢያንስ 6 አሃዞች / At least 6 digits
          </p>
          {pinError && (
            <p className="text-sm text-red-600 mt-1" role="alert">{pinError}</p>
          )}
        </div>

        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3" role="status" aria-live="polite">
            <p className="text-sm text-yellow-800">
              ⚠️ Offline mode: You can browse, but login needs internet.
              <br /> የመግባት ሂደት ኢንተርኔት ያስፈልጋል
            </p>
          </div>
        )}

        <button
          type="submit"
          onClick={(e) => { e.preventDefault(); if (!loading) { void signInWithPhonePin(); } }}
          disabled={loading || !isOnline || phoneNumber.length < 9 || pin.length < 6}
          aria-disabled={loading || !isOnline || phoneNumber.length < 9 || pin.length < 6}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600"
          style={{ minHeight: '56px' }}
        >
          {loading ? 'እባክዎ ይጠብቁ... / Please wait...' : '✓ ግባ / Login'}
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 አዲስ ተጠቃሚ? / New user? Just enter your phone and create a PIN to get started!
          </p>
        </div>
      </form>
    </div>
  );
}

export default OtpAuthForm;