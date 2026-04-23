import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function OfflineSupport() {
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

  if (isOnline) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center gap-2 text-yellow-800">
        <WifiOff className="w-5 h-5" />
        <span className="text-sm font-medium">
          Offline Mode - Some features may be limited
        </span>
      </div>
    </div>
  );
}
