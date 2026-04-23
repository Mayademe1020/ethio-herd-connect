import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ETHIOPIA_CONSTANTS } from '@/constants/ethiopia';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const navigate = useNavigate();
  
  // Form state - order: User Name → Phone → PIN
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(true); // PIN visible by default
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  // Error states
  const [userNameError, setUserNameError] = useState<string | undefined>(undefined);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);
  const [pinError, setPinError] = useState<string | undefined>(undefined);

  // Online/offline detection
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

  // Validate Ethiopian phone number
  const validatePhone = (phone: string): { valid: boolean; cleaned: string; error?: string } => {
    const cleaned = phone.replace(/\D/g, '');
    
    // Remove leading 0 if present
    const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    
    if (withoutLeadingZero.length !== 9) {
      return { valid: false, cleaned: withoutLeadingZero, error: 'ስልክ ቁጥር 9 አሃዞች መሆን አለበት / Phone must be 9 digits' };
    }
    
    // Must start with 9 or 7 (Ethiopian mobile numbers)
    if (!withoutLeadingZero.startsWith('9') && !withoutLeadingZero.startsWith('7')) {
      return { valid: false, cleaned: withoutLeadingZero, error: 'ስልክ ቁጥር በ 9 ወይም 7 መጀመር አለበት / Phone must start with 9 or 7' };
    }
    
    return { valid: true, cleaned: withoutLeadingZero };
  };

  const handleRegister = async () => {
    setLoading(true);
    
    try {
      // Validate user name
      if (userName.trim().length < 2) {
        setUserNameError('ስሙ ቢያንስ 2 ፊደላት መሆን አለበት / Name must be at least 2 characters');
        setLoading(false);
        return;
      }
      setUserNameError(undefined);

      // Validate phone number
      const { valid, cleaned, error } = validatePhone(phoneNumber);
      if (!valid) {
        setPhoneError(error);
        toast.error(error || 'Invalid phone number');
        setLoading(false);
        return;
      }
      setPhoneError(undefined);

      // Validate PIN
      if (pin.length < 6) {
        const msg = 'ፒን ቢያንስ 6 አሃዞች መሆን አለበት / PIN must be at least 6 digits';
        setPinError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      setPinError(undefined);

      // Block interactive auth when offline
      if (!isOnline) {
        // Only show offline toast once every 30 seconds
        toast.error('የኢንተርኔት ግንኙነት ችግር / Network Error', {
          description: 'መለያ መፍጠር ኢንተርኔት ያስፈልጋል / Registration requires connectivity'
        });
        setLoading(false);
        return;
      }

      // Create email format from phone: 911234567@ethioherd.app
      const email = `${cleaned}@ethioherd.app`;
      const password = pin;

      // Try to sign in first (existing user)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        // User doesn't exist, create new account
        if (signInError.message.includes('Invalid login credentials') ||
            signInError.message.includes('Email not confirmed')) {
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              emailRedirectTo: undefined,
            }
          });

          if (signUpError) {
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
              .upsert({
                id: signUpData.user.id,
                phone: cleaned,
                farmer_name: userName.trim(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (profileError) {
              console.error('Profile creation error:', profileError);
            }
          }

          toast.success('✓ መለያ ተፈጥሯል! / Account created!', {
            description: `Welcome ${userName.trim()}!`
          });
          
          // Navigate after successful signup
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
        } else {
          throw signInError;
        }
      } else {
        // Existing user - update profile if name differs
        if (signInData?.user?.id) {
          await supabase
            .from('profiles' as any)
            .upsert({
              id: signInData.user.id,
              phone: cleaned,
              farmer_name: userName.trim(),
              updated_at: new Date().toISOString()
            });
        }
        
        toast.success('✓ እንኳን ደህና መጡ! / Welcome back!', {
          description: `Welcome ${userName.trim()}!`
        });
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message?.includes('fetch') || 
          error.message?.includes('network') || 
          error.message?.includes('Failed to fetch') ||
          !navigator.onLine) {
        toast.error('የኢንተርኔት ግንኙነት ችግር / Network Error', {
          description: 'እባክዎ ግንኙነትዎን ያረጋግጡ / Please check your connection'
        });
      } else {
        toast.error('መለያ መፍጠር አልተቻለም / Registration failed', {
          description: error.message || 'Please try again'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    await handleRegister();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* 1. User Name (FIRST) */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          👤 ስምዎ / Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => {
            setUserName(e.target.value);
            setUserNameError(undefined);
          }}
          placeholder="ስምዎን ያስገቡ"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-lg transition-colors ${
            userNameError ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-green-500'
          }`}
          style={{ minHeight: '48px' }}
          autoFocus
        />
        {userNameError && (
          <p className="text-sm text-red-600 mt-1" role="alert">{userNameError}</p>
        )}
      </div>

      {/* 2. Phone Number */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          📱 ስልክ ቁጥር / Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 px-3 py-3 border-2 border-gray-300 rounded-lg text-lg font-medium text-gray-700 select-none">
            {ETHIOPIA_CONSTANTS.PHONE_COUNTRY_CODE}
          </div>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={phoneNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 9);
              setPhoneNumber(value);
              setPhoneError(undefined);
            }}
            placeholder="9xxxxxxxx"
            maxLength={9}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-lg leading-6 placeholder:text-gray-400"
            style={{ minHeight: '48px' }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-600">9 አሃዞች (9 ወይም 7 ይጀምር)</p>
          <span className={`text-sm font-medium ${
            phoneNumber.length === 9 ? 'text-green-600' : 'text-gray-500'
          }`}>
            {phoneNumber.length}/9
          </span>
        </div>
        {phoneError && (
          <p className="text-sm text-red-600 mt-1" role="alert">{phoneError}</p>
        )}
      </div>

      {/* 3. PIN */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          🔐 ፒን / PIN <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setPin(value);
              setPinError(undefined);
            }}
            placeholder="••••••"
            maxLength={6}
            className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-600 text-lg leading-6 text-center tracking-widest placeholder:text-gray-400"
            style={{ minHeight: '48px' }}
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
            aria-label={showPin ? "Hide PIN" : "Show PIN"}
          >
            {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-600">ቢያንስ 6 አሃዞች / At least 6 digits</p>
          <span className={`text-sm font-medium ${
            pin.length >= 6 ? 'text-green-600' : 'text-gray-500'
          }`}>
            {pin.length}/6
          </span>
        </div>
        {pinError && (
          <p className="text-sm text-red-600 mt-1" role="alert">{pinError}</p>
        )}
      </div>

      {/* Offline warning */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3" role="status" aria-live="polite">
          <p className="text-sm text-yellow-800">
            ⚠️ Offline: Registration requires internet connection.
            <br /> መለያ መፍጠር ኢንተርኔት ያስፈልጋል
          </p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading || !isOnline}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-colors shadow-md ${
          userName.trim().length >= 2 && phoneNumber.length === 9 && pin.length >= 6 && isOnline
            ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        style={{ minHeight: '56px' }}
      >
        {loading ? 'እባክዎ ይጠብቁ... / Please wait...' : 
         userName.trim().length < 2 ? 'ስምዎን ያስገቡ' :
         phoneNumber.length < 9 ? `ስልክ ቁጥር ${9 - phoneNumber.length} አሃዞች ይጠብቁ` :
         pin.length < 6 ? `ፒን ${6 - pin.length} አሃዞች ይጠብቁ` :
         '✓ መዝግብ / Create Account'}
      </button>

      {/* Forgot PIN link */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium underline"
        >
          ፒን አስታወሰ? / Forgot your PIN?
        </button>
      </div>


    </form>
  );
}

export default RegisterForm;
