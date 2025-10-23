/**
 * Sync Status Indicator Component
 * Shows real-time sync status with progress and retry information
 * Optimized for Ethiopian farmers with visual indicators
 */

import React from 'react';
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from '@/hooks/useTranslations';
import { cn } from '@/lib/utils';

export interface SyncStatus {
  isOnline: boolean;
  syncing: boolean;
  status: 'idle' | 'syncing' | 'error' | 'success';
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  lastSyncTime: number | null;
  pendingCount: number;
  failedCount?: number;
}

interface SyncStatusIndicatorProps {
  syncStatus: SyncStatus;
  onSync?: () => void;
  onRetryFailed?: () => void;
  onClearFailed?: () => void;
  compact?: boolean;
  className?: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  syncStatus,
  onSync,
  onRetryFailed,
  onClearFailed,
  compact = false,
  className
}) => {
  const { t } = useTranslations();

  /**
   * Get status icon
   */
  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <CloudOff className="w-5 h-5 text-gray-500" />;
    }

    switch (syncStatus.status) {
      case 'syncing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'success':
        return syncStatus.pendingCount === 0 ? (
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        ) : (
          <Cloud className="w-5 h-5 text-blue-600" />
        );
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Cloud className="w-5 h-5 text-gray-600" />;
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'text-gray-600';
    
    switch (syncStatus.status) {
      case 'syncing':
        return 'text-blue-600';
      case 'success':
        return syncStatus.pendingCount === 0 ? 'text-emerald-600' : 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  /**
   * Get status message
   */
  const getStatusMessage = () => {
    if (!syncStatus.isOnline) {
      return syncStatus.pendingCount > 0
        ? `${syncStatus.pendingCount} ${t('items queued for sync')}`
        : t('Offline mode');
    }

    switch (syncStatus.status) {
      case 'syncing':
        return t('Syncing...');
      case 'success':
        return syncStatus.pendingCount > 0
          ? `${syncStatus.pendingCount} ${t('items pending')}`
          : t('All synced');
      case 'error':
        return t('Sync error');
      default:
        return syncStatus.pendingCount > 0
          ? `${syncStatus.pendingCount} ${t('items to sync')}`
          : t('All synced');
    }
  };

  /**
   * Format last sync time
   */
  const getLastSyncText = () => {
    if (!syncStatus.lastSyncTime) return null;

    const now = Date.now();
    const diff = now - syncStatus.lastSyncTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return t('Just now');
    if (minutes < 60) return `${minutes} ${t('min ago')}`;
    if (hours < 24) return `${hours} ${t('hr ago')}`;
    return t('Over a day ago');
  };

  /**
   * Calculate progress percentage
   */
  const getProgressPercentage = () => {
    if (syncStatus.progress.total === 0) return 0;
    return Math.round((syncStatus.progress.completed / syncStatus.progress.total) * 100);
  };

  // Compact view for header/toolbar
  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {getStatusIcon()}
        <span className={cn('text-sm font-medium', getStatusColor())}>
          {getStatusMessage()}
        </span>
        {syncStatus.isOnline && syncStatus.pendingCount > 0 && !syncStatus.syncing && onSync && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSync}
            className="h-8 px-2"
            aria-label={t('Sync now')}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  // Full card view
  return (
    <Card className={cn('border-2', className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className={cn('text-base font-semibold', getStatusColor())}>
                {getStatusMessage()}
              </h3>
              {syncStatus.lastSyncTime && (
                <p className="text-xs text-gray-500">
                  {t('Last sync')}: {getLastSyncText()}
                </p>
              )}
            </div>
          </div>

          {/* Sync button */}
          {syncStatus.isOnline && syncStatus.pendingCount > 0 && !syncStatus.syncing && onSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSync}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('Sync now')}
            </Button>
          )}
        </div>

        {/* Progress bar (when syncing) */}
        {syncStatus.syncing && syncStatus.progress.total > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>
                {t('Progress')}: {syncStatus.progress.completed} / {syncStatus.progress.total}
              </span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        )}

        {/* Status details */}
        <div className="space-y-2 text-sm">
          {/* Pending items */}
          {syncStatus.pendingCount > 0 && (
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <span className="text-blue-900">
                {t('Pending items')}
              </span>
              <span className="font-semibold text-blue-900">
                {syncStatus.pendingCount}
              </span>
            </div>
          )}

          {/* Failed items */}
          {syncStatus.failedCount && syncStatus.failedCount > 0 && (
            <div className="flex items-center justify-between p-2 bg-red-50 rounded">
              <span className="text-red-900">
                {t('Failed items')}
              </span>
              <span className="font-semibold text-red-900">
                {syncStatus.failedCount}
              </span>
            </div>
          )}

          {/* Offline message */}
          {!syncStatus.isOnline && (
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-700 text-sm">
                {t('You are currently offline. Your changes are being saved locally and will sync automatically when you reconnect.')}
              </p>
            </div>
          )}

          {/* Error message */}
          {syncStatus.status === 'error' && (
            <div className="p-3 bg-red-50 rounded border border-red-200">
              <p className="text-red-700 text-sm">
                {t('Some items failed to sync. They will be retried automatically.')}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons for failed items */}
        {syncStatus.failedCount && syncStatus.failedCount > 0 && (
          <div className="flex gap-2 mt-3">
            {onRetryFailed && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetryFailed}
                className="flex-1 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {t('Retry failed')}
              </Button>
            )}
            {onClearFailed && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFailed}
                className="flex-1"
              >
                {t('Clear failed')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
