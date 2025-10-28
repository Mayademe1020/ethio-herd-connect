import { createContext, useContext, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';
import { ToastVariant } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant, icon?: string, duration?: number) => string;
  success: (message: string, icon?: string) => string;
  error: (message: string, icon?: string) => string;
  warning: (message: string, icon?: string) => string;
  info: (message: string, icon?: string) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, showToast, dismissToast, success, error, warning, info } = useToast();

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
}
