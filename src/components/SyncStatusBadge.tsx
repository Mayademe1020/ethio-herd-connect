import React, { useState, useEffect, useRef } from 'react';
import { Cloud, CloudOff, Check, RefreshCw, Wifi, WifiOff, X } from 'lucide-react';
import { offlineQueue } from '@/lib/offlineQueue';
import { useNetworkStatus } from '@/contexts/NetworkStatusContext';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export const SyncStatusBadge: React.FC = () => {
  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);
  const { isOnline } = useNetworkStatus();
  const { language } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const items = offlineQueue.getAll();
      setPending(items.filter(i => i.status === 'pending').length);
      setFailed(items.filter(i => i.status === 'failed').length);
      setIsProcessing(offlineQueue.isProcessing());
    };
    update();
    const unsub = offlineQueue.subscribe(update);
    return unsub;
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleSync = async () => {
    const result = await offlineQueue.processQueue();
    if (result.processed > 0) {
      toast.success(`Synced ${result.processed} items`);
    }
    if (result.failed > 0) {
      toast.error(`${result.failed} items failed`);
    }
    if (result.processed === 0 && result.failed === 0) {
      toast.info('No pending items to sync');
    }
  };

  const handleRetryFailed = async () => {
    offlineQueue.retryFailedItems();
    toast.success('Retrying failed items...');
  };

  const translations: Record<string, { synced: string; pending: string; syncing: string; failed: string; items: string; sync: string; retry: string; online: string; offline: string }> = {
    am: { synced: 'ተሰናስሯል', pending: 'በመጠባበቅ ላይ', syncing: 'በማስተካከል ላይ...', failed: 'አልተሳካም', items: 'እቃዎች', sync: 'አመሳስል', retry: 'ደግሞ ሞክር', online: '�መስመር ላይ', offline: 'ከመስመር ውጭ' },
    en: { synced: 'Synced', pending: 'Pending', syncing: 'Syncing...', failed: 'Failed', items: 'items', sync: 'Sync Now', retry: 'Retry Failed', online: 'Online', offline: 'Offline' },
    or: { synced: 'Sirreessameera', pending: 'Eeggamaa jira', syncing: 'Sirreessaa jira...', failed: 'Hinmilkoofne', items: 'meeshaalee', sync: 'Amma Sirreessi', retry: 'Debi'ii Yaali', online: 'Online', offline: 'Offline' },
    sw: { synced: 'Imefanywa Upya', pending: 'Inasubiri', syncing: 'Inafanywa upya...', failed: 'Imeshindwa', items: 'vitu', sync: 'Sawazisha Sasa', retry: 'Jaribu Tena', online: 'Mtandaoni', offline: 'Nje ya Mtandao' },
  };

  const t = translations[language] || translations.en;

  if (pending === 0 && failed === 0 && !isProcessing) return null;

  const getStatusConfig = () => {
    if (!isOnline) {
      return { icon: CloudOff, text: `${pending} ${t.pending}`, className: 'bg-gray-100 text-gray-600 border-gray-300', label: t.offline };
    }
    if (isProcessing) {
      return { icon: RefreshCw, text: t.syncing, className: 'bg-blue-100 text-blue-700 border-blue-300 animate-pulse', label: t.syncing };
    }
    if (failed > 0) {
      return { icon: CloudOff, text: `${failed} ${t.failed}`, className: 'bg-red-100 text-red-700 border-red-300', label: t.failed };
    }
    if (pending > 0) {
      return { icon: Cloud, text: `${pending} ${t.pending}`, className: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: t.pending };
    }
    return { icon: Check, text: t.synced, className: 'bg-green-100 text-green-700 border-green-300', label: t.synced };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium',
          'transition-all duration-300 cursor-pointer hover:opacity-80',
          config.className
        )}
      >
        <Icon className={cn('w-3.5 h-3.5', isProcessing && 'animate-spin')} />
        <span>{config.text}</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border z-50 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-900">Sync Status</span>
            <div className="flex items-center gap-1.5">
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span className="text-xs text-gray-500">{isOnline ? t.online : t.offline}</span>
            </div>
          </div>

          <div className="space-y-1.5 mb-3 text-xs text-gray-600">
            {pending > 0 && (
              <div className="flex justify-between">
                <span>{t.pending}:</span>
                <span className="font-medium">{pending} {t.items}</span>
              </div>
            )}
            {failed > 0 && (
              <div className="flex justify-between">
                <span>{t.failed}:</span>
                <span className="font-medium text-red-600">{failed} {t.items}</span>
              </div>
            )}
            {isProcessing && (
              <div className="text-blue-600 font-medium">{t.syncing}</div>
            )}
            {pending === 0 && failed === 0 && !isProcessing && (
              <div className="text-green-600 font-medium">{t.synced}</div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleSync}
              disabled={isProcessing || !isOnline}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isProcessing && 'animate-spin')} />
              {t.sync}
            </button>
            {failed > 0 && (
              <button
                onClick={handleRetryFailed}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
              >
                {t.retry}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
