import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextMVP';
import { encryptSensitiveData, decryptSensitiveData } from '@/utils/securityUtils';
import { toast } from 'sonner';
import { useTranslations } from '@/hooks/useTranslations';

interface SensitiveData {
  [key: string]: unknown;
}

export const useSensitiveDataProtection = () => {
  const { user } = useAuth();
  const [accessGranted, setAccessGranted] = useState(false);
  const { t } = useTranslations();

  // Store sensitive data with encryption
  const storeSensitiveData = (key: string, data: Record<string, unknown>): boolean => {
    try {
      if (!user) {
        toast.error(
          t('security.unauthorized', 'Unauthorized')
        );
        return false;
      }

      // Add metadata for security audit
      const dataWithMetadata = {
        data,
        metadata: {
          userId: user.id,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      };

      // Encrypt with double-layer protection
      const encrypted = encryptSensitiveData(dataWithMetadata);
      
      // Store with user-specific key
      localStorage.setItem(`sensitive-${user.id}-${key}`, encrypted);
      
      return true;
    } catch (error) {
      console.error('Error storing sensitive data:', error);
      toast.error(
        t('security.storageError', 'Storage Error')
      );
      return false;
    }
  };

  // Retrieve and decrypt sensitive data
  const retrieveSensitiveData = (key: string): unknown => {
    try {
      if (!user) {
        toast.error(
          t('security.unauthorized', 'Unauthorized')
        );
        return null;
      }

      // Only allow access if explicitly granted or in emergency mode
      if (!accessGranted) {
        toast.error(
          t('security.accessDenied', 'Access Denied')
        );
        return null;
      }

      const encrypted = localStorage.getItem(`sensitive-${user.id}-${key}`);
      if (!encrypted) return null;

      const decrypted = decryptSensitiveData(encrypted);
      return decrypted?.data || null;
    } catch (error) {
      console.error('Error retrieving sensitive data:', error);
      toast.error(
        t('security.decryptionError', 'Decryption Error')
      );
      return null;
    }
  };

  // Request access to sensitive data (e.g., with PIN confirmation)
  const requestAccess = (pin?: string): boolean => {
    // In a real implementation, this would validate a PIN or biometric
    // For now, we'll just grant access
    setAccessGranted(true);
    
    // Auto-revoke access after 5 minutes
    setTimeout(() => {
      setAccessGranted(false);
    }, 5 * 60 * 1000);
    
    return true;
  };

  // Revoke access to sensitive data
  const revokeAccess = (): void => {
    setAccessGranted(false);
  };

  // Delete sensitive data
  const deleteSensitiveData = (key: string): boolean => {
    try {
      if (!user) return false;
      
      localStorage.removeItem(`sensitive-${user.id}-${key}`);
      return true;
    } catch (error) {
      console.error('Error deleting sensitive data:', error);
      return false;
    }
  };

  return {
    storeSensitiveData,
    retrieveSensitiveData,
    requestAccess,
    revokeAccess,
    deleteSensitiveData,
    accessGranted
  };
};

export default useSensitiveDataProtection;