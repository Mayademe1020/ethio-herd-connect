/**
 * Sync Status Page
 * Allows users to view and manage their offline sync queue
 * Optimized for Ethiopian farmers with visual indicators
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';
import { useOfflineActionQueue } from '@/hooks/useOfflineActionQueue';
import { useTranslations } from '@/hooks/useTranslations';
import { useAuth } from '@/contexts/AuthContext';
import { getSyncQueue } from '@/utils/indexedDB';
import { logger } from '@/utils/logger';

interface QueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
  userId: string;
}

export const SyncStatus: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const { user } = useAuth();
  const {
    syncStatus,
    syncAll,
    retryFailed,
    clearFailed
  } = useOfflineActionQueue();

  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load queue items
   */
  const loadQueueItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const items = await getSyncQueue(user.id);
      setQueueItems(items);
      logger.debug(`Loaded ${items.length} queue items`);
    } catch (error) {
      logger.error('Failed to load queue items', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load queue items on mount and after sync
   */
  useEffect(() => {
    loadQueueItems();
  }, [user, syncStatus.pendingCount, syncStatus.failedCount]);

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return t('Just now');
    if (minutes < 60) return `${minutes} ${t('min ago')}`;
    if (hours < 24) return `${hours} ${t('hr ago')}`;
    return `${days} ${t('days ago')}`;
  };

  /**
   * Get action label
   */
  const getActionLabel = (type: string): string => {
    switch (type) {
      case 'create':
        return t('Create');
      case 'update':
        return t('Update');
      case 'delete':
        return t('Delete');
      default:
        return type;
    }
  };

  /**
   * Get table label
   */
  const getTableLabel = (table: string): string => {
    switch (table) {
      case 'animals':
        return t('Animal');
      case 'health_records':
        return t('Health Record');
      case 'milk_production':
        return t('Milk Production');
      case 'market_listings':
        return t('Market Listing');
      default:
        return table;
    }
  };

  /**
   * Get action color
   */
  const getActionColor = (type: string): string => {
    switch (type) {
      case 'create':
        return 'text-emerald-600 bg-emerald-50';
      case 'update':
        return 'text-blue-600 bg-blue-50';
      case 'delete':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  /**
   * Handle sync
   */
  const handleSync = async () => {
    await syncAll();
    await loadQueueItems();
  };

  /**
   * Handle retry failed
   */
  const handleRetryFailed = async () => {
    await retryFailed();
    await loadQueueItems();
  };

  /**
   * Handle clear failed
   */
  const handleClearFailed = async () => {
    await clearFailed();
    await loadQueueItems();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('Back')}
            </Button>
            <h1 className="text-xl font-bold text-gray-900">
              {t('Sync Status')}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Sync Status Card */}
        <SyncStatusIndicator
          syncStatus={syncStatus}
          onSync={handleSync}
          onRetryFailed={handleRetryFailed}
          onClearFailed={handleClearFailed}
        />

        {/* Queue Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('Pending Items')}</span>
              {queueItems.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  {queueItems.length} {t('items')}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>{t('Loading...')}</p>
              </div>
            ) : queueItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">✅</p>
                <p>{t('No pending items')}</p>
                <p className="text-sm mt-1">
                  {t('All your changes have been synced')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {queueItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Action and Table */}
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(
                              item.type
                            )}`}
                          >
                            {getActionLabel(item.type)}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {getTableLabel(item.table)}
                          </span>
                        </div>

                        {/* Data preview */}
                        <div className="text-sm text-gray-600 mb-2">
                          {item.data.name && (
                            <p className="truncate">
                              <span className="font-medium">{t('Name')}:</span>{' '}
                              {item.data.name}
                            </p>
                          )}
                          {item.data.tag_number && (
                            <p className="truncate">
                              <span className="font-medium">{t('Tag')}:</span>{' '}
                              {item.data.tag_number}
                            </p>
                          )}
                        </div>

                        {/* Timestamp and retry count */}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{formatTimestamp(item.timestamp)}</span>
                          {item.retryCount > 0 && (
                            <span className="flex items-center gap-1 text-orange-600">
                              <AlertCircle className="w-3 h-3" />
                              {t('Retry')} {item.retryCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              {t('How Offline Sync Works')}
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>
                • {t('When offline, your changes are saved locally')}
              </li>
              <li>
                • {t('Changes sync automatically when you reconnect')}
              </li>
              <li>
                • {t('Failed items are retried with increasing delays')}
              </li>
              <li>
                • {t('You can manually sync anytime using the Sync button')}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
