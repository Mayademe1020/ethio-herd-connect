
import { Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface OfflineIndicatorProps {
  language: 'am' | 'en';
}

export const OfflineIndicator = ({ language }: OfflineIndicatorProps) => {
  const { isOnline, pendingSync, syncAll } = useOfflineSync();

  if (isOnline && pendingSync.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-40">
      <div className="bg-white border border-orange-200 rounded-lg p-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <>
                <CloudOff className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-800">
                  {language === 'am' 
                    ? `${pendingSync.length} ያልተሰምሩ ለውጦች`
                    : `${pendingSync.length} pending changes`
                  }
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-red-800">
                  {language === 'am' ? 'ኦፍላይን ሁኔታ' : 'Offline Mode'}
                </span>
              </>
            )}
          </div>

          {isOnline && pendingSync.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={syncAll}
              className="text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              {language === 'am' ? 'ሰምር' : 'Sync'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
