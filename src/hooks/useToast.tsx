import { useState, useCallback } from 'react';
import { ToastVariant } from '../components/Toast';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  icon?: string;
  duration?: number;
}

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info', icon?: string, duration?: number) => {
      const id = `toast-${++toastCounter}`;
      const newToast: ToastItem = {
        id,
        message,
        variant,
        icon,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, icon?: string) => {
      return showToast(message, 'success', icon);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, icon?: string) => {
      return showToast(message, 'error', icon);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, icon?: string) => {
      return showToast(message, 'warning', icon);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, icon?: string) => {
      return showToast(message, 'info', icon);
    },
    [showToast]
  );

  return {
    toasts,
    showToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  };
}
