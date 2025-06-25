
import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Language } from '@/types';

interface OfflineIndicatorProps {
  language: Language;
}

export const OfflineIndicator = ({ language }: OfflineIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  const translations = {
    am: {
      offline: 'ከመስመር ውጭ',
      online: 'በመስመር ላይ'
    },
    en: {
      offline: 'Offline',
      online: 'Online'
    },
    or: {
      offline: 'Interneetii Ala',
      online: 'Interneetii Keessa'
    },
    sw: {
      offline: 'Nje ya Mtandao',
      online: 'Kwenye Mtandao'
    }
  };

  const t = translations[language];

  if (isOnline) return null;

  return (
    <div className="bg-red-500 text-white px-4 py-2 text-center text-sm flex items-center justify-center space-x-2">
      <WifiOff className="w-4 h-4" />
      <span>{t.offline}</span>
    </div>
  );
};
