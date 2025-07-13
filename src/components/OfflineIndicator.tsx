
import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Language } from '@/types';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface OfflineIndicatorProps {
  language: Language;
}

export const OfflineIndicator = ({ language }: OfflineIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnecting, setShowReconnecting] = useState(false);
  const { pendingSync, syncing, getSyncStatusMessage } = useOfflineSync();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnecting(true);
      setTimeout(() => setShowReconnecting(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnecting(false);
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
      offline: 'ከመስመር ውጭ',
      online: 'በመስመር ላይ',
      reconnecting: 'እንደገና በመገናኘት ላይ...',
      syncing: 'በማመሳሰል ላይ...',
      pendingItems: 'በመጠባበቅ ላይ ያሉ ንጥሎች'
    },
    en: {
      offline: 'Offline',
      online: 'Online',
      reconnecting: 'Reconnecting...',
      syncing: 'Syncing...',
      pendingItems: 'Pending items'
    },
    or: {
      offline: 'Interneetii Ala',
      online: 'Interneetii Keessa',
      reconnecting: 'Lamata wal qunnamsiisa...',
      syncing: 'Walsimsiisuun...',
      pendingItems: 'Wanti eegama'
    },
    sw: {
      offline: 'Nje ya Mtandao',
      online: 'Kwenye Mtandao',
      reconnecting: 'Kuunganisha tena...',
      syncing: 'Kusawazisha...',
      pendingItems: 'Vipengee vinavyosubiri'
    }
  };

  const t = translations[language];

  if (isOnline && !showReconnecting && !syncing && pendingSync.length === 0) {
    return null;
  }

  const getStatusMessage = () => {
    if (!isOnline) return t.offline;
    if (showReconnecting) return t.reconnecting;
    if (syncing) return t.syncing;
    if (pendingSync.length > 0) return `${pendingSync.length} ${t.pendingItems}`;
    return t.online;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (showReconnecting || syncing) return 'bg-yellow-500';
    if (pendingSync.length > 0) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (showReconnecting || syncing) return <RefreshCw className="w-4 h-4 animate-spin" />;
    return <Wifi className="w-4 h-4" />;
  };

  return (
    <div className={`${getStatusColor()} text-white px-3 py-2 text-center text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md transition-all duration-300 animate-fade-in`}>
      {getIcon()}
      <span className="font-medium">
        {getStatusMessage()}
      </span>
    </div>
  );
};
