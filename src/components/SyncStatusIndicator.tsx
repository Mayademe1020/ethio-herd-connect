import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { offlineQueue } from '@/lib/offlineQueue';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

export function SyncStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Update online status
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

  // Subscribe to queue changes
  useEffect(() => {
    const updateQueueStatus = async () => {
      const count = await offlineQueue.getPendingCount();
      setPendingCount(count);
      setIsProcessing(offlineQueue.isProcessing());
    };

    // Initial update
    updateQueueStatus();

    // Subscribe to changes
    const unsubscribe = offlineQueue.subscribe(() => {
      updateQueueStatus();
    });

    // Poll for updates
    const interval = setInterval(updateQueueStatus, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Handle manual sync
  const handleManualSync = async () => {
    if (!isOnline) {
      toast({
        title: t('errors.networkError'),
        description: t('sync.offlineMode'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);
      await offlineQueue.processQueue();
      setLastSyncTime(new Date());

      toast({
        title: t('sync.allSynced'),
        description: t('sync.syncNow'),
      });
    } catch (error) {
      toast({
        title: t('sync.syncFailed'),
        description: t('sync.retrying'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Format last sync time
  const formatLastSync = (date: Date | null) => {
    if (!date) return null;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return t('common.justNow');
    if (diffMins < 60) return t('common.minutesAgo', { count: diffMins });

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return t('common.hoursAgo', { count: diffHours });

    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
      {/* Online/Offline Status */}
      <div className="flex items-center gap-1.5">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-600">{t('sync.online')}</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-600">{t('sync.offline')}</span>
          </>
        )}
      </div>

      {/* Pending Items Count */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-100 rounded-full">
          <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
          <span className="text-xs font-medium text-orange-600">
            {t('sync.pendingSync', { count: pendingCount })}
          </span>
        </div>
      )}

      {/* All Synced Indicator */}
      {isOnline && pendingCount === 0 && !isProcessing && (
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
          <span className="text-xs text-muted-foreground">{t('sync.allSynced')}</span>
        </div>
      )}

      {/* Sync Progress */}
      {isProcessing && (
        <div className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
          <span className="text-xs text-blue-600">{t('sync.syncing')}</span>
        </div>
      )}

      {/* Manual Sync Button */}
      {isOnline && pendingCount > 0 && !isProcessing && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleManualSync}
          className="h-7 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          {t('sync.syncNow')}
        </Button>
      )}

      {/* Last Sync Time */}
      {lastSyncTime && (
        <span className="text-xs text-muted-foreground ml-auto">
          {formatLastSync(lastSyncTime)}
        </span>
      )}
    </div>
  );
}
