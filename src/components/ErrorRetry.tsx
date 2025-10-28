import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorRetryProps {
  message: string;
  icon?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ErrorRetry({ message, icon, onRetry, isRetrying = false }: ErrorRetryProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        {icon ? (
          <span className="text-6xl" aria-hidden="true">
            {icon}
          </span>
        ) : (
          <AlertCircle className="w-16 h-16 text-red-500" />
        )}
      </div>
      <p className="text-lg font-medium text-gray-900 mb-4">{message}</p>
      <Button
        onClick={onRetry}
        disabled={isRetrying}
        className="min-w-[200px]"
        size="lg"
      >
        {isRetrying ? (
          <>
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            እባክዎ ይጠብቁ... / Retrying...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-5 w-5" />
            እንደገና ይሞክሩ / Retry
          </>
        )}
      </Button>
    </div>
  );
}
