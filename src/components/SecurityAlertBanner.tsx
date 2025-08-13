
import React from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

export const SecurityAlertBanner: React.FC = () => {
  const { alerts, clearSecurityAlerts } = useSecurityMonitoring();

  if (alerts.length === 0) return null;

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'high':
        return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      default:
        return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  return (
    <div className="space-y-2 p-4">
      {alerts.map((alert) => (
        <Alert key={alert.id} className={`${getAlertStyle(alert.severity)} relative`}>
          <div className="flex items-start gap-3">
            {getAlertIcon(alert.severity)}
            <div className="flex-1">
              <AlertDescription className="font-medium">
                {alert.message}
              </AlertDescription>
              <p className="text-sm opacity-75 mt-1">
                {new Date(alert.timestamp).toLocaleString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSecurityAlerts}
              className="h-6 w-6 p-0 hover:bg-black/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
};
