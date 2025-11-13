import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { validateFullName } from '@/utils/nameValidation';
import { toast } from 'sonner';
import { Loader2, WifiOff } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFarmerName: string;
  currentFarmName: string | null;
  onSave: (farmerName: string, farmName: string) => Promise<void>;
}

/**
 * EditProfileModal Component
 * 
 * Allows farmers to edit their name and farm name.
 * Includes validation for farmer name (must have 2+ words).
 * Supports bilingual error messages and loading states.
 * 
 * @param isOpen - Controls modal visibility
 * @param onClose - Callback when modal is closed
 * @param currentFarmerName - Current farmer name from profile
 * @param currentFarmName - Current farm name from profile (optional)
 * @param onSave - Callback to save profile updates
 */
export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentFarmerName,
  currentFarmName,
  onSave,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [farmerName, setFarmerName] = useState(currentFarmerName);
  const [farmName, setFarmName] = useState(currentFarmName || '');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setFarmerName(currentFarmerName);
      setFarmName(currentFarmName || '');
      setNameError('');
    }
  }, [isOpen, currentFarmerName, currentFarmName]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFarmerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFarmerName(value);
    
    // Clear error when user starts typing
    if (nameError) {
      setNameError('');
    }
  };

  const handleFarmNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFarmName(e.target.value);
  };

  const handleSave = async () => {
    // Validate farmer name (must have 2+ words)
    const validation = validateFullName(farmerName);
    
    if (!validation.isValid) {
      const errorMessage = language === 'am' ? validation.errorAm : validation.error;
      setNameError(errorMessage || '');
      return;
    }

    setSaving(true);
    try {
      await onSave(farmerName.trim(), farmName.trim());
      toast.success(t('profile.profileUpdated'));
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      
      // Check for network errors
      if (error instanceof Error && error.message?.toLowerCase().includes('network')) {
        toast.error(
          language === 'am'
            ? 'የኢንተርኔት ግንኙነት ችግር'
            : 'Network error. Please check your connection.'
        );
      } else {
        toast.error(t('profile.profileUpdateFailed'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('profile.editProfile')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Farmer Name Input */}
          <div className="space-y-2">
            <Label htmlFor="farmer-name" className="text-sm font-medium">
              {t('profile.farmerName')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="farmer-name"
              type="text"
              value={farmerName}
              onChange={handleFarmerNameChange}
              className={nameError ? 'border-red-500 focus-visible:ring-red-500' : ''}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              disabled={saving}
              placeholder={language === 'am' ? 'ስም እና የአባት ስም' : 'First name and father\'s name'}
            />
            {nameError && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {nameError}
              </p>
            )}
          </div>

          {/* Farm Name Input */}
          <div className="space-y-2">
            <Label htmlFor="farm-name" className="text-sm font-medium">
              {t('profile.farmName')}{' '}
              <span className="text-gray-400">({t('profile.optional')})</span>
            </Label>
            <Input
              id="farm-name"
              type="text"
              value={farmName}
              onChange={handleFarmNameChange}
              autoComplete="off"
              disabled={saving}
              placeholder={language === 'am' ? 'የእርሻ ስም' : 'Farm name'}
            />
          </div>
        </div>

        {/* Offline Warning */}
        {isOffline && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">
              {language === 'am'
                ? 'መገለጫን ለማርትዕ የኢንተርኔት ግንኙነት ያስፈልጋል'
                : 'Internet connection required to edit profile'}
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || isOffline}
            className="w-full sm:w-auto"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('profile.saving')}
              </>
            ) : (
              t('common.save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
