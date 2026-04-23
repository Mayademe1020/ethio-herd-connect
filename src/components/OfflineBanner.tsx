import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '@/contexts/NetworkStatusContext';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline, isOffline, lastOnlineAt } = useNetworkStatus();
  const { language } = useLanguage();

  const translations = {
    am: {
      offline: 'ኢንተርኔት የለም',
      offlineMessage: 'ለውጦች በሞባይልዎ ላይ ይቆያሉ እና በመስመር ላይ ሲመለሱ ይሰተካከላሉ',
      online: 'መልሰዎ ውጤታማ ነው',
      lastOnline: 'የመጨረሻ ጊዜ በመስመር ላይ'
    },
    en: {
      offline: 'No Internet Connection',
      offlineMessage: 'Changes will be saved on your device and synced when you\'re back online',
      online: 'Back Online',
      lastOnline: 'Last online'
    },
    or: {
      offline: 'Interneetii Hin Jiru',
      offlineMessage: 'Jijjiiramni meeshaa keessan irratti ni qaabatama fi sirnaan dhaabaan sirreessa',
      online: 'Interneetiitti Deebite',
      lastOnline: 'Interneetii yeroo dhuma'
    },
    sw: {
      offline: 'Hakuna Muunganisho wa Intaneti',
      offlineMessage: 'Mabadiliko yatahifwa kwenye kifaa chako na kufanywa upya unaporudi mtandaoni',
      online: 'Rudi Mtandaoni',
      lastOnline: 'Mara ya mwisho mtandaoni'
    }
  };

  const t = translations[language] || translations.en;

  if (!isOffline) return null;

  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50 px-4 py-3',
      'bg-red-600 text-white shadow-lg'
    )}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{t.offline}</span>
            <span className="text-xs text-red-100">{t.offlineMessage}</span>
          </div>
        </div>
        {lastOnlineAt && (
          <span className="text-xs text-red-200 hidden sm:block">
            {t.lastOnline}: {lastOnlineAt.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

export const OnlineIndicator: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (isOnline) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
      <Wifi className="w-4 h-4" />
      <span className="text-sm font-medium">Back Online</span>
    </div>
  );
};
