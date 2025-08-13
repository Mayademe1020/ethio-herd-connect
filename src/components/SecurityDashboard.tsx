
import React from 'react';
import { Shield, AlertTriangle, Eye, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { SecurityAlertBanner } from '@/components/SecurityAlertBanner';

export const SecurityDashboard: React.FC = () => {
  const { alerts, loading, checkSecurityStatus } = useSecurityMonitoring();

  const securityStats = {
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
    highAlerts: alerts.filter(a => a.severity === 'high').length,
    mediumAlerts: alerts.filter(a => a.severity === 'medium').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
          <p className="text-gray-600">Monitor your account security status and alerts</p>
        </div>
        <Button 
          onClick={checkSecurityStatus}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          {loading ? 'Checking...' : 'Refresh Status'}
        </Button>
      </div>

      <SecurityAlertBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Active security alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityStats.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{securityStats.highAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Should be reviewed soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
            <Lock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{securityStats.mediumAlerts}</div>
            <p className="text-xs text-muted-foreground">
              For your awareness
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
          <CardDescription>
            Best practices to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Strong Password</h4>
              <p className="text-sm text-gray-600">Use a unique password with at least 8 characters</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Regular Activity Review</h4>
              <p className="text-sm text-gray-600">Check your security alerts regularly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Monitor Login Activity</h4>
              <p className="text-sm text-gray-600">Report any suspicious login attempts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
