// src/hooks/useSimpleToast.ts
// Simplified toast API for Ethiopian farmers - ONE unified toast system
// Replaces all duplicate toast implementations

import { useToast as useRadixToast } from './use-toast';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export const useSimpleToast = () => {
  const { toast } = useRadixToast();

  const showSuccess = (message: string, description?: string) => {
    toast({
      title: '✅ ' + message,
      description,
      duration: 3000,
    });
  };

  const showError = (message: string, description?: string) => {
    toast({
      title: '❌ ' + message,
      description,
      variant: 'destructive',
      duration: 5000,
    });
  };

  const showInfo = (message: string, description?: string) => {
    toast({
      title: 'ℹ️ ' + message,
      description,
      duration: 3000,
    });
  };

  const showWarning = (message: string, description?: string) => {
    toast({
      title: '⚠️ ' + message,
      description,
      duration: 4000,
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    toast, // Keep original for advanced usage
  };
};

export default useSimpleToast;
