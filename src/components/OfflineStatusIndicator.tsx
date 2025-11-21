/**
 * Offline status indicator component
 * Shows connection status and pending sync count
 */

import { Wifi, WifiOff, Cloud, CloudOff, Loader2, AlertCircle } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';

interface OfflineStatusIndicatorProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const OfflineStatusIndicator = ({ 
  variant = 'compact',
  className 
}: OfflineStatusIndicatorProps) => {
  const { isOnline, syncing, getSyncStatusMessage, pendingSync } = useOfflineSync();
  const syncStatus = {
    isOnline,
    syncing,
    status: syncing ? 'syncing' : 'idle',
    pendingCount: pendingSync.length,
    progress: { total: 0, completed: 0 }
  } as any;
  const { t } = useTranslations();

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="w-4 h-4" />;
    }

    if (syncStatus.syncing) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }

    if (syncStatus.status === 'error') {
      return <AlertCircle className="w-4 h-4" />;
    }

    if (syncStatus.pendingCount > 0) {
      return <CloudOff className="w-4 h-4" />;
    }

    return <Cloud className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) {
      return 'text-gray-500 bg-gray-100';
    }

    if (syncStatus.syncing) {
      return 'text-blue-600 bg-blue-50';
    }

    if (syncStatus.status === 'error') {
      return 'text-red-600 bg-red-50';
    }

    if (syncStatus.pendingCount > 0) {
      return 'text-orange-600 bg-orange-50';
    }

    return 'text-emerald-600 bg-emerald-50';
  };

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
          getStatusColor(),
          className
        )}
        title={getSyncStatusMessage()}
      >
        {getStatusIcon()}
        {syncStatus.pendingCount > 0 && (
          <span className="tabular-nums">{syncStatus.pendingCount}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-2 rounded-lg text-sm',
        getStatusColor(),
        className
      )}
    >
      {getStatusIcon()}
      <div className="flex flex-col">
        <span className="font-medium">
          {syncStatus.isOnline ? t('Online') : t('Offline')}
        </span>
        <span className="text-xs opacity-80">
          {getSyncStatusMessage()}
        </span>
      </div>
      {syncStatus.syncing && syncStatus.progress.total > 0 && (
        <div className="ml-auto text-xs tabular-nums">
          {syncStatus.progress.completed}/{syncStatus.progress.total}
        </div>
      )}
    </div>
  );
};
