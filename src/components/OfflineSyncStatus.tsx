/**
 * Offline sync status component
 * Shows detailed sync status and pending items
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineActionQueue } from '@/hooks/useOfflineActionQueue';
import { getSyncQueue } from '@/utils/indexedDB';
import { useTranslations } from '@/hooks/useTranslations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface QueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
  userId: string;
}

export const OfflineSyncStatus = () => {
  const { user } = useAuth();
  const { syncStatus, syncAll, getSyncStatusMessage } = useOfflineActionQueue();
  const { t } = useTranslations();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

  useEffect(() => {
    if (user) {
      loadQueueItems();
    }
  }, [user, syncStatus.pendingCount]);

  const loadQueueItems = async () => {
    if (!user) return;
    const items = await getSyncQueue(user.id);
    setQueueItems(items);
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'create':
        return <Badge className="bg-emerald-100 text-emerald-700">Create</Badge>;
      case 'update':
        return <Badge className="bg-blue-100 text-blue-700">Update</Badge>;
      case 'delete':
        return <Badge className="bg-red-100 text-red-700">Delete</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getTableName = (table: string) => {
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

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <XCircle className="w-5 h-5 text-gray-500" />;
    }
    if (syncStatus.syncing) {
      return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    }
    if (syncStatus.status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    if (syncStatus.pendingCount === 0) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
    return <Clock className="w-5 h-5 text-orange-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle>{t('Sync Status')}</CardTitle>
              <CardDescription>{getSyncStatusMessage()}</CardDescription>
            </div>
          </div>
          <Button
            onClick={syncAll}
            disabled={!syncStatus.isOnline || syncStatus.syncing || syncStatus.pendingCount === 0}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncStatus.syncing ? 'animate-spin' : ''}`} />
            {t('Sync Now')}
          </Button>
        </div>
      </CardHeader>

      {queueItems.length > 0 && (
        <CardContent>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">
              {t('Pending Changes')} ({queueItems.length})
            </h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {queueItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getActionBadge(item.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {getTableName(item.table)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    {item.retryCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {t('Retry')} {item.retryCount}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}

      {syncStatus.syncing && syncStatus.progress.total > 0 && (
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('Syncing...')}</span>
              <span className="font-medium">
                {syncStatus.progress.completed} / {syncStatus.progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(syncStatus.progress.completed / syncStatus.progress.total) * 100}%`
                }}
              />
            </div>
            {syncStatus.progress.failed > 0 && (
              <p className="text-xs text-red-600">
                {syncStatus.progress.failed} {t('items failed')}
              </p>
            )}
          </div>
        </CardContent>
      )}

      {!syncStatus.isOnline && queueItems.length > 0 && (
        <CardContent>
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium">{t('You\'re offline')}</p>
              <p className="text-xs mt-1">
                {t('Your changes are saved locally and will sync automatically when you\'re back online.')}
              </p>
            </div>
          </div>
        </CardContent>
      )}

      {syncStatus.isOnline && queueItems.length === 0 && (
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-800 font-medium">
              {t('All changes synced')}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
