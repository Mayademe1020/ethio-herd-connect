// src/hooks/useBackgroundSync.tsx - Hook for background sync registration

import { useEffect } from 'react';
import { offlineQueue } from '@/lib/offlineQueue';
import { toast } from 'sonner';

export const useBackgroundSync = () => {
  useEffect(() => {
    // Service worker disabled in dev — skip registration
    // Online fallback below still works

    // Auto-process queue when coming online (fallback for browsers without sync)
    const handleOnline = () => {
      setTimeout(() => {
        offlineQueue.processQueue().then(() => {
          toast.success('✓ መስመር ላይ / Back Online', {
            description: 'Syncing your data...'
          });
        });
      }, 1000); // Small delay to ensure connection is stable
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
};
