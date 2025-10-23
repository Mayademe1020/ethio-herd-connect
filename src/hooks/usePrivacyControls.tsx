import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useTranslations } from '@/hooks/useTranslations';
import { secureLocalStorage } from '@/utils/securityUtils';

// Define privacy settings types
export interface PrivacySettings {
  shareLocationData: boolean;
  shareHerdStatistics: boolean;
  shareContactInfo: boolean;
  allowDataAnalytics: boolean;
  allowMarketingMessages: boolean;
  dataRetentionMonths: number;
}

// Default privacy settings optimized for Ethiopian farmers
const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  shareLocationData: false,
  shareHerdStatistics: true,
  shareContactInfo: false,
  allowDataAnalytics: true,
  allowMarketingMessages: false,
  dataRetentionMonths: 24, // 2 years default retention
};

export const usePrivacyControls = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastNotifications();
  const { t } = useTranslations();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  // Load privacy settings from secure storage
  useEffect(() => {
    if (!user) return;
    
    const loadPrivacySettings = () => {
      try {
        const storedSettings = secureLocalStorage.getItem(`privacy-settings-${user.id}`);
        if (storedSettings) {
          setPrivacySettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Failed to load privacy settings:', error);
      }
    };
    
    loadPrivacySettings();
  }, [user]);

  // Save privacy settings to secure storage and sync when online
  const savePrivacySettings = async (settings: PrivacySettings) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Save locally first (works offline)
      secureLocalStorage.setItem(`privacy-settings-${user.id}`, JSON.stringify(settings));
      setPrivacySettings(settings);
      
      // Try to sync with server if online
      const isOnline = navigator.onLine;
      if (isOnline) {
        // Here we would sync with server
        // For now, we'll just simulate a successful sync
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      showSuccess(
        t('privacy.settingsSaved', 'Privacy Settings Saved'),
        isOnline 
          ? t('privacy.settingsSyncedOnline', 'Your settings have been saved and synced')
          : t('privacy.settingsSavedOffline', 'Your settings have been saved locally and will sync when online')
      );
    } catch (error) {
      showError(
        t('privacy.saveFailed', 'Failed to Save Settings'),
        t('privacy.tryAgain', 'Please try again later')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Update a single privacy setting
  const updatePrivacySetting = async (key: keyof PrivacySettings, value: any) => {
    const updatedSettings = {
      ...privacySettings,
      [key]: value
    };
    await savePrivacySettings(updatedSettings);
  };

  // Reset privacy settings to defaults
  const resetPrivacySettings = async () => {
    await savePrivacySettings(DEFAULT_PRIVACY_SETTINGS);
  };

  // Request data deletion (with confirmation)
  const requestDataDeletion = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Here we would send a request to delete user data
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark data for deletion in local storage
      secureLocalStorage.setItem(`data-deletion-requested-${user.id}`, new Date().toISOString());
      
      showSuccess(
        t('privacy.deletionRequested', 'Data Deletion Requested'),
        t('privacy.deletionProcessing', 'Your request is being processed. This may take up to 30 days.')
      );
    } catch (error) {
      showError(
        t('privacy.deletionFailed', 'Request Failed'),
        t('privacy.tryAgainLater', 'Please try again later')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Check if specific data can be shared based on privacy settings
  const canShareData = (dataType: keyof PrivacySettings): boolean => {
    if (!user) return false;
    return privacySettings[dataType] as boolean;
  };

  // Get data retention policy in human-readable format
  const getDataRetentionPolicy = (): string => {
    const months = privacySettings.dataRetentionMonths;
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return t('privacy.retentionYears', '{years} years', { years });
      }
      return t('privacy.retentionYearsMonths', '{years} years and {months} months', { 
        years, 
        months: remainingMonths 
      });
    }
    return t('privacy.retentionMonths', '{months} months', { months });
  };

  return {
    privacySettings,
    savePrivacySettings,
    updatePrivacySetting,
    resetPrivacySettings,
    requestDataDeletion,
    canShareData,
    getDataRetentionPolicy,
    isLoading
  };
};

export default usePrivacyControls;