
import { toast } from 'sonner';

export const useToastNotifications = () => {
  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
      className: 'bg-green-50 border-green-200',
    });
  };

  const showError = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
      className: 'bg-red-50 border-red-200',
    });
  };

  const showInfo = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
      className: 'bg-blue-50 border-blue-200',
    });
  };

  const showWarning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
      className: 'bg-yellow-50 border-yellow-200',
    });
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
