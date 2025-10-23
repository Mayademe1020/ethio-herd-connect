import React, { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

type ErrorKind = 'network_offline' | 'auth_expired' | 'validation_failed';

interface Props {
  errorKind: ErrorKind | null;
  onClear?: () => void;
  onNavigate?: (route: string) => void;
  details?: string[];
}

export const FriendlyErrorHandler: React.FC<Props> = ({ errorKind, onClear, onNavigate, details }) => {
  const { t } = useTranslations();
  const [currentError, setCurrentError] = useState<ErrorKind | null>(errorKind);

  const messages: Record<ErrorKind, {
    icon: string;
    title: string;
    amharic: string;
    message: string;
    actions: { label: string; primary?: boolean; action: () => void }[];
  }> = {
    network_offline: {
      icon: '📡',
      title: 'No Internet Connection',
      amharic: 'ኢንተርኔት የለም',
      message: "Don't worry! Your data is saved on your phone and will upload automatically when you're back online.",
      actions: [
        { label: 'OK, Got It', primary: true, action: () => { setCurrentError(null); onClear?.(); } },
        { label: 'View Saved Items', action: () => onNavigate?.('/sync-status') },
      ],
    },
    auth_expired: {
      icon: '🔐',
      title: 'Please Sign In Again',
      amharic: 'እባክዎ እንደገና ይግቡ',
      message: 'For your security, we need you to log in again. Your work is saved and waiting for you.',
      actions: [
        { label: 'Sign In Now', primary: true, action: () => onNavigate?.('/auth') },
        { label: 'Later', action: () => { setCurrentError(null); onClear?.(); } },
      ],
    },
    validation_failed: {
      icon: '✏️',
      title: 'Some Information is Missing',
      amharic: 'መረጃ ይጎድላል',
      message: 'We need a bit more information to continue. Check the fields marked in red.',
      actions: [
        { label: 'OK', primary: true, action: () => { setCurrentError(null); onClear?.(); } },
        { label: 'Help', action: () => onNavigate?.('/help/forms') },
      ],
    },
  };

  if (!currentError) return null;
  const m = messages[currentError];

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-card border border-border rounded-lg shadow-lg">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{m.icon}</span>
          <div className="font-semibold">{m.title} <span className="ml-2 text-sm text-muted-foreground">{m.amharic}</span></div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">{m.message}</div>
        {details && details.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
            {details.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        )}
        <div className="mt-3 flex gap-2">
          {m.actions.map((a, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${a.primary ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
              onClick={a.action}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};