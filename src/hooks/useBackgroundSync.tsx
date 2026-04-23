// src/hooks/useBackgroundSync.tsx - Hook for background sync registration

import { useEffect } from 'react';
import { offlineQueue } from '@/lib/offlineQueue';
import { toast } from 'sonner';

export const useBackgroundSync = () => {
  useEffect(() => {
    // Register service worker with safe cloning implementation
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration.scope);

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SYNC_OFFLINE_QUEUE') {
              console.log('Service Worker: Received sync request');
              offlineQueue.processQueue().then(() => {
                toast.success('✓ ተመሳሳይ ተደርጓል / Synced', {
                  description: 'All offline data synced successfully'
                });
              }).catch((error) => {
                console.error('Sync error:', error);
              });
            }
          });

          // Register background sync event when coming online
          if ('sync' in registration && typeof registration.sync === 'object') {
            window.addEventListener('online', () => {
              console.log('Service Worker: Online event, registering background sync');
              (registration.sync as any).register('sync-offline-queue')
                .then(() => {
                  console.log('Service Worker: Background sync registered successfully');
                })
                .catch((error: unknown) => {
                  console.error('Service Worker: Background sync registration failed:', error);
                  // Fallback to manual sync
                  offlineQueue.processQueue();
                });
            });
          }
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }

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
