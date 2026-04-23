import React from 'react';
import { Cloud, CloudOff, Check, RefreshCw } from 'lucide-react';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useNetworkStatus } from '@/contexts/NetworkStatusContext';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export const SyncStatusBadge: React.FC = () => {
  const { stats, isProcessing } = useOfflineQueue();
  const { isOnline } = useNetworkStatus();
  const { language } = useLanguage();

  const translations = {
    am: {
      synced: 'ተሰናስሯል',
      pending: 'በመጠባበቅ ላይ',
      syncing: 'በማስተካከል ላይ...',
      failed: 'አልተሳካም',
      items: 'እቃዎች'
    },
    en: {
      synced: 'Synced',
      pending: 'Pending',
      syncing: 'Syncing...',
      failed: 'Failed',
      items: 'items'
    },
    or: {
      synced: 'Sirreessameera',
      pending: 'Eeggamaa jira',
      syncing: 'Sirreessaa jira...',
      failed: 'Hinmilkoofne',
      items: 'meeshaalee'
    },
    sw: {
      synced: 'Imefanywa Upya',
      pending: 'Inasubiri',
      syncing: 'Inafanywa upya...',
      failed: 'Imeshindwa',
      items: 'vitu'
    }
  };

  const t = translations[language] || translations.en;

  // Don't show if everything is synced and no pending items
  if (stats.pending === 0 && stats.failed === 0 && !isProcessing) {
    return null;
  }

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: CloudOff,
        text: `${stats.pending} ${t.pending}`,
        className: 'bg-gray-100 text-gray-600 border-gray-300'
      };
    }

    if (isProcessing) {
      return {
        icon: RefreshCw,
        text: t.syncing,
        className: 'bg-blue-100 text-blue-700 border-blue-300 animate-pulse'
      };
    }

    if (stats.failed > 0) {
      return {
        icon: CloudOff,
        text: `${stats.failed} ${t.failed}`,
        className: 'bg-red-100 text-red-700 border-red-300'
      };
    }

    if (stats.pending > 0) {
      return {
        icon: Cloud,
        text: `${stats.pending} ${t.pending}`,
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300'
      };
    }

    return {
      icon: Check,
      text: t.synced,
      className: 'bg-green-100 text-green-700 border-green-300'
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium',
      'transition-all duration-300',
      config.className
    )}>
      <Icon className={cn(
        'w-3.5 h-3.5',
        isProcessing && 'animate-spin'
      )} />
      <span>{config.text}</span>
    </div>
  );
};
