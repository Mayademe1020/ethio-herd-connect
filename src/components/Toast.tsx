import { useEffect } from 'react';
import { X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  variant: ToastVariant;
  icon?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-green-50 border-green-200 text-green-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
};

export function Toast({ id, message, variant, icon, duration = 3000, onDismiss }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg
        min-w-[300px] max-w-[500px]
        animate-in slide-in-from-right-full duration-300
        ${variantStyles[variant]}
      `}
      role="alert"
    >
      {icon && (
        <span className="text-2xl flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      <p className="flex-1 text-base font-medium leading-relaxed">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
