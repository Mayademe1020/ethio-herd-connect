
import React, { useState } from 'react';
import { Wifi, WifiOff, CloudOff, RefreshCw, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface EnhancedOfflineIndicatorProps {
  language: 'am' | 'en';
}

export const EnhancedOfflineIndicator = ({ language }: EnhancedOfflineIndicatorProps) => {
  const { isOnline, pendingSync, syncAll, syncing } = useOfflineSync();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed && isOnline && pendingSync.length === 0) {
    return null;
  }

  const getSyncStatusIcon = () => {
    if (syncing) return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    if (!isOnline) return <WifiOff className="w-4 h-4 text-red-500" />;
    if (pendingSync.length > 0) return <Clock className="w-4 h-4 text-orange-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getSyncStatusText = () => {
    if (syncing) {
      return language === 'am' ? 'እየተሰመራመረ...' : 'Syncing...';
    }
    if (!isOnline) {
      return language === 'am' ? 'ኦፍላይን ሁኔታ' : 'Offline Mode';
    }
    if (pendingSync.length > 0) {
      return language === 'am' 
        ? `${pendingSync.length} ያልተሰምሩ ለውጦች`
        : `${pendingSync.length} pending changes`;
    }
    return language === 'am' ? 'ሁሉም ተሰምሯል' : 'All synced';
  };

  const getSyncStatusColor = () => {
    if (syncing) return 'border-blue-200 bg-blue-50';
    if (!isOnline) return 'border-red-200 bg-red-50';
    if (pendingSync.length > 0) return 'border-orange-200 bg-orange-50';
    return 'border-green-200 bg-green-50';
  };

  return (
    <div className="fixed top-20 left-4 right-4 z-40">
      <Card className={`p-3 shadow-lg transition-all duration-300 ${getSyncStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getSyncStatusIcon()}
            <div>
              <div className="text-sm font-medium text-gray-800">
                {getSyncStatusText()}
              </div>
              {pendingSync.length > 0 && (
                <div className="text-xs text-gray-600">
                  {language === 'am' 
                    ? 'በመስመር ላይ ሲሆኑ ይመጣል' 
                    : 'Will sync when online'
                  }
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isOnline && pendingSync.length > 0 && !syncing && (
              <Button
                size="sm"
                variant="outline"
                onClick={syncAll}
                className="text-xs border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {language === 'am' ? 'ሰምር' : 'Sync'}
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
