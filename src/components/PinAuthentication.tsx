import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useTranslations } from '@/hooks/useTranslations';
import { secureLocalStorage, hashData } from '@/utils/securityUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Fingerprint, Eye, EyeOff } from 'lucide-react';

interface PinAuthenticationProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const PinAuthentication: React.FC<PinAuthenticationProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState<number | null>(null);
  const { user } = useAuth();
  const { showError, showSuccess } = useToastNotifications();
  const { t } = useTranslations();

  // Check if PIN is already set up
  useEffect(() => {
    if (!user) return;
    
    const hasPinSetup = secureLocalStorage.getItem(`pin-setup-${user.id}`);
    setIsSettingUp(!hasPinSetup);
    
    // Check if account is locked
    const lockedUntil = secureLocalStorage.getItem(`pin-lockout-${user.id}`);
    if (lockedUntil && new Date(lockedUntil) > new Date()) {
      setIsLocked(true);
      setLockTime(new Date(lockedUntil).getTime());
    }
  }, [user]);

  // Timer for locked account
  useEffect(() => {
    if (!isLocked || !lockTime) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      if (lockTime <= now) {
        setIsLocked(false);
        setLockTime(null);
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLocked, lockTime]);

  const handleSetupPin = () => {
    if (!user) return;
    
    if (pin.length < 4) {
      showError(
        t('pin.tooShort', 'PIN too short'),
        t('pin.minimumLength', 'PIN must be at least 4 digits')
      );
      return;
    }
    
    if (pin !== confirmPin) {
      showError(
        t('pin.mismatch', 'PINs do not match'),
        t('pin.tryAgain', 'Please enter the same PIN in both fields')
      );
      return;
    }
    
    // Store hashed PIN
    const hashedPin = hashData(pin);
    secureLocalStorage.setItem(`pin-hash-${user.id}`, hashedPin);
    secureLocalStorage.setItem(`pin-setup-${user.id}`, true);
    
    showSuccess(
      t('pin.setupSuccess', 'PIN Setup Complete'),
      t('pin.setupMessage', 'Your PIN has been set up successfully')
    );
    
    setIsSettingUp(false);
    onSuccess();
  };

  const handleVerifyPin = () => {
    if (!user) return;
    
    const storedHash = secureLocalStorage.getItem(`pin-hash-${user.id}`);
    if (!storedHash) {
      setIsSettingUp(true);
      return;
    }
    
    const inputHash = hashData(pin);
    if (inputHash === storedHash) {
      // Reset attempts on success
      setAttempts(0);
      secureLocalStorage.setItem(`pin-attempts-${user.id}`, 0);
      
      showSuccess(
        t('pin.correct', 'PIN Correct'),
        t('pin.accessGranted', 'Access granted')
      );
      
      onSuccess();
    } else {
      // Increment failed attempts
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      secureLocalStorage.setItem(`pin-attempts-${user.id}`, newAttempts);
      
      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        const lockoutTime = new Date();
        lockoutTime.setMinutes(lockoutTime.getMinutes() + 15); // 15 minute lockout
        
        secureLocalStorage.setItem(`pin-lockout-${user.id}`, lockoutTime.toISOString());
        setIsLocked(true);
        setLockTime(lockoutTime.getTime());
        
        showError(
          t('pin.accountLocked', 'Account Locked'),
          t('pin.tooManyAttempts', 'Too many incorrect attempts. Try again in 15 minutes.')
        );
      } else {
        showError(
          t('pin.incorrect', 'Incorrect PIN'),
          t('pin.attemptsRemaining', 'Incorrect PIN. {attempts} attempts remaining.', {
            attempts: 5 - newAttempts
          })
        );
      }
    }
  };

  // Format remaining lock time
  const formatLockTime = () => {
    if (!lockTime) return '';
    
    const now = new Date().getTime();
    const remaining = Math.max(0, lockTime - now);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Visual PIN input with large buttons for low-literacy users
  if (isSettingUp) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-4">
          <Lock className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-lg font-semibold">{t('pin.setup', 'Set Up PIN')}</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          {t('pin.setupDescription', 'Create a PIN to protect your account on shared devices')}
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {t('pin.enterPin', 'Enter PIN')}
          </label>
          <div className="relative">
            <Input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
              className="pr-10 text-center text-xl py-6"
              placeholder="• • • •"
              inputMode="numeric"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showPin ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            {t('pin.confirmPin', 'Confirm PIN')}
          </label>
          <div className="relative">
            <Input
              type={showPin ? 'text' : 'password'}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
              className="pr-10 text-center text-xl py-6"
              placeholder="• • • •"
              inputMode="numeric"
            />
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button onClick={handleSetupPin} className="w-full py-6 text-lg">
            {t('pin.createPin', 'Create PIN')}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="w-full">
              {t('common.cancel', 'Cancel')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-4">
        <Fingerprint className="h-6 w-6 text-primary mr-2" />
        <h2 className="text-lg font-semibold">{t('pin.enterPin', 'Enter PIN')}</h2>
      </div>
      
      {isLocked ? (
        <div className="text-center mb-4">
          <p className="text-red-500 font-medium">
            {t('pin.accountLocked', 'Account Locked')}
          </p>
          <p className="text-sm text-gray-600">
            {t('pin.tryAgainIn', 'Try again in {time}', { time: formatLockTime() })}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="relative">
              <Input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                className="pr-10 text-center text-xl py-6"
                placeholder="• • • •"
                inputMode="numeric"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPin ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button onClick={handleVerifyPin} className="w-full py-6 text-lg">
              {t('pin.verify', 'Verify PIN')}
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="w-full">
                {t('common.cancel', 'Cancel')}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PinAuthentication;