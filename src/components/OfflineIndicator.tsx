
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';
import { Language } from '@/types';

interface OfflineIndicatorProps {
  language: Language;
}

export const OfflineIndicator = ({ language }: OfflineIndicatorProps) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
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
      offline: 'ከመስመር ውጭ - መረጃዎች በአካባቢያዊ ይቀመጣሉ',
      online: 'በመስመር ላይ'
    },
    en: {
      offline: 'Offline - Data will be saved locally',
      online: 'Online'
    },
    or: {
      offline: 'Toora interneetii - Daataan naannoodhaan kuufama',
      online: 'Interneetii irratti'
    },
    sw: {
      offline: 'Nje ya mtandao - Data itahifadhiwa kimtandao',
      online: 'Mtandaoni'
    }
  };

  const t = translations[language];

  if (isOnline) return null;

  return (
    <Alert className="m-2 border-orange-200 bg-orange-50">
      <WifiOff className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        {t.offline}
      </AlertDescription>
    </Alert>
  );
};
