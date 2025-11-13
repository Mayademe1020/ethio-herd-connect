// src/hooks/useBackgroundSync.tsx - Hook for background sync registration

import { useEffect } from 'react';
import { offlineQueue } from '@/lib/offlineQueue';
import { toast } from 'sonner';

export const useBackgroundSync = () => {
  useEffect(() => {
    // Service worker temporarily disabled due to Response.clone() errors
    // TODO: Fix service worker implementation before re-enabling
    
    // DISABLED: Register service worker
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.register('/service-worker.js')
    //     .then(registration => {
    //       console.log('Service Worker registered:', registration);
    //
    //       // Listen for messages from service worker
    //       navigator.serviceWorker.addEventListener('message', (event) => {
    //         if (event.data.type === 'SYNC_OFFLINE_QUEUE') {
    //           // Process queue when service worker requests sync
    //           offlineQueue.processQueue().then(() => {
    //             toast.success('✓ ተመሳሳይ ተደርጓል / Synced', {
    //               description: 'All offline data synced successfully'
    //             });
    //           }).catch((error) => {
    //             console.error('Sync error:', error);
    //           });
    //         }
    //       });
    //
    //       // Register sync event when coming online
    //       if ('sync' in registration && registration.sync) {
    //         window.addEventListener('online', () => {
    //           (registration.sync as any).register('sync-offline-queue')
    //             .then(() => {
    //               console.log('Background sync registered');
    //             })
    //             .catch((error: any) => {
    //               console.error('Background sync registration failed:', error);
    //               // Fallback to manual sync
    //               offlineQueue.processQueue();
    //             });
    //         });
    //       }
    //     })
    //     .catch(error => {
    //       console.error('Service Worker registration failed:', error);
    //     });
    // }

    // Auto-process queue when coming online (fallback if background sync not supported)
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
