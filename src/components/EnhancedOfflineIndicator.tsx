
import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { Language } from '@/types';

interface EnhancedOfflineIndicatorProps {
  language: Language;
}

export const EnhancedOfflineIndicator = ({ language }: EnhancedOfflineIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnecting, setShowReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnecting(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnecting(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const translations = {
    am: {
      offline: 'ከመስመር ውጭ - የተከማቸ መረጃ ይጠቀማሉ',
      reconnecting: 'እንደገና በመገናኘት ላይ...',
      syncPending: 'ማመሳሰል በመጠባበቅ ላይ'
    },
    en: {
      offline: 'Offline - Using cached data',
      reconnecting: 'Reconnecting...',
      syncPending: 'Sync pending'
    },
    or: {
      offline: 'Interneetii Ala - Daataa kuufame fayyadama',
      reconnecting: 'Lamata wal qunnamsiisa...',
      syncPending: 'Walsimsiisuun eegama'
    },
    sw: {
      offline: 'Nje ya Mtandao - Kutumia data iliyo...',
      reconnecting: 'Kuunganisha tena...',
      syncPending: 'Kusawazisha kunasubiri'
    }
  };

  const t = translations[language];

  if (isOnline && !showReconnecting) return null;

  return (
    <div className={`${
      isOnline ? 'bg-yellow-500' : 'bg-red-500'
    } text-white px-3 py-2 text-center text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md`}>
      {isOnline ? (
        <AlertTriangle className="w-4 h-4" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
      <span className="font-medium">
        {isOnline ? t.syncPending : t.offline}
      </span>
    </div>
  );
};
