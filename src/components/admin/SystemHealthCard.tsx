import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Server,
  Database,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react';
import { SystemHealth } from '@/types/admin';
import { adminService } from '@/services/adminService';

interface SystemHealthCardProps {
  className?: string;
}

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ className }) => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadSystemHealth = async () => {
    try {
      setLoading(true);
      const health = await adminService.getSystemHealth();
      setSystemHealth(health);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading system health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemHealth();

    // Auto-refresh every 30 seconds for health data
    const interval = setInterval(loadSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading && !systemHealth) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
            <CardDescription>
              Real-time system status and resource monitoring
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSystemHealth}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {systemHealth && getStatusIcon(systemHealth.status)}
            <div>
              <p className="font-medium">System Status</p>
              <p className="text-sm text-muted-foreground">
                Last checked: {systemHealth ? new Date(systemHealth.last_check).toLocaleTimeString() : 'Never'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold capitalize ${getStatusColor(systemHealth?.status || 'unknown')}`}>
              {systemHealth?.status || 'Unknown'}
            </p>
            <p className="text-sm text-muted-foreground">
              Uptime: {systemHealth?.uptime.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Resource Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Server className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current</span>
                  <span className="font-medium">{systemHealth?.cpu_usage}%</span>
                </div>
                <Progress value={systemHealth?.cpu_usage || 0} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Threshold: < 80%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Database className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current</span>
                  <span className="font-medium">{systemHealth?.memory_usage}%</span>
                </div>
                <Progress value={systemHealth?.memory_usage || 0} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Threshold: < 85%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <HardDrive className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Disk Usage</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current</span>
                  <span className="font-medium">{systemHealth?.disk_usage}%</span>
                </div>
                <Progress value={systemHealth?.disk_usage || 0} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Threshold: < 90%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Issues */}
        {systemHealth?.issues && systemHealth.issues.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Active Issues ({systemHealth.issues.length})
            </h4>
            <div className="space-y-2">
              {systemHealth.issues.slice(0, 3).map((issue, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">{issue.title}</AlertTitle>
                  <AlertDescription className="text-sm">
                    {issue.description}
                    <Badge className={`ml-2 ${getSeverityColor(issue.severity)}`}>
                      {issue.severity.toUpperCase()}
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
              {systemHealth.issues.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  And {systemHealth.issues.length - 3} more issues...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start">
            <Activity className="h-4 w-4 mr-2" />
            Run Health Check
          </Button>
          <Button variant="outline" className="justify-start">
            <Zap className="h-4 w-4 mr-2" />
            Clear System Cache
          </Button>
          <Button variant="outline" className="justify-start">
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart Services
          </Button>
        </div>

        {/* Health Status Summary */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-3">Health Status Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {systemHealth?.issues.filter(i => i.severity === 'low').length || 0}
              </div>
              <div className="text-muted-foreground">Low Priority</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {systemHealth?.issues.filter(i => i.severity === 'medium').length || 0}
              </div>
              <div className="text-muted-foreground">Medium Priority</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {systemHealth?.issues.filter(i => i.severity === 'high').length || 0}
              </div>
              <div className="text-muted-foreground">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {systemHealth?.issues.filter(i => i.severity === 'critical').length || 0}
              </div>
              <div className="text-muted-foreground">Critical</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};