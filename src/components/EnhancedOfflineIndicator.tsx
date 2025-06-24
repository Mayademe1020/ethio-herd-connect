
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Language } from '@/types';

interface EnhancedOfflineIndicatorProps {
  language: Language;
  pendingSync?: number;
}

export const EnhancedOfflineIndicator = ({ language, pendingSync = 0 }: EnhancedOfflineIndicatorProps) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showSyncAnimation, setShowSyncAnimation] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (pendingSync > 0) {
        setShowSyncAnimation(true);
        setTimeout(() => setShowSyncAnimation(false), 3000);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSync]);

  const translations = {
    am: {
      offline: 'ከመስመር ውጭ',
      online: 'በመስመር ላይ',
      syncing: 'በማመሳሰል ላይ',
      pendingItems: 'በመጠባበቅ ላይ ያሉ',
      willSyncWhenOnline: 'በመስመር ላይ ሲመለስ ይመሳሰላል'
    },
    en: {
      offline: 'Offline',
      online: 'Online',
      syncing: 'Syncing',
      pendingItems: 'pending items',
      willSyncWhenOnline: 'Will sync when online'
    },
    or: {
      offline: 'Toora interneetii',
      online: 'Interneetii irratti',
      syncing: 'Walsimsiisuudhaan',
      pendingItems: 'wantoota eegaman',
      willSyncWhenOnline: 'Interneetii yeroo deebi\'u walsimsifama'
    },
    sw: {
      offline: 'Nje ya mtandao',
      online: 'Mtandaoni',
      syncing: 'Inasawazisha',
      pendingItems: 'vipengee vinavyosubiri',
      willSyncWhenOnline: 'Itasawazishwa wakati wa mtandaoni'
    }
  };

  const t = translations[language];

  if (isOnline && pendingSync === 0) return null;

  return (
    <Alert className={`m-2 ${isOnline ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'}`}>
      <div className="flex items-center space-x-2">
        {showSyncAnimation ? (
          <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
        ) : isOnline ? (
          <Wifi className="h-4 w-4 text-blue-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-orange-600" />
        )}
        
        <AlertDescription className={isOnline ? 'text-blue-800' : 'text-orange-800'}>
          <div className="flex items-center space-x-2">
            <span>
              {showSyncAnimation ? t.syncing : isOnline ? t.online : t.offline}
            </span>
            
            {pendingSync > 0 && (
              <>
                <Badge variant="secondary" className="text-xs">
                  {pendingSync} {t.pendingItems}
                </Badge>
                {!isOnline && (
                  <span className="text-xs opacity-80">
                    {t.willSyncWhenOnline}
                  </span>
                )}
              </>
            )}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
};
