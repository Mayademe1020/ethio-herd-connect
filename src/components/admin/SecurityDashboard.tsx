import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  AlertTriangle,
  Lock,
  Unlock,
  Users,
  Clock,
  Eye,
  RefreshCw,
  TrendingUp,
  Activity,
  Globe
} from 'lucide-react';
import { SecurityMetrics, SecurityEvent } from '@/types/admin';
import { adminService } from '@/services/adminService';

interface SecurityDashboardProps {
  className?: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className }) => {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [metrics, events] = await Promise.all([
        adminService.getSecurityMetrics(),
        // Mock recent events - in production this would come from API
        Promise.resolve([
          {
            id: '1',
            type: 'failed_login',
            user_id: 'user123',
            ip_address: '192.168.1.100',
            user_agent: 'Mozilla/5.0...',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            severity: 'low',
            description: 'Failed login attempt from unknown IP'
          },
          {
            id: '2',
            type: 'suspicious_ip',
            ip_address: '10.0.0.50',
            user_agent: 'Bot/1.0',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            severity: 'medium',
            description: 'Suspicious activity detected'
          }
        ] as SecurityEvent[])
      ]);

      setSecurityMetrics(metrics);
      setRecentEvents(events);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();

    // Auto-refresh every 2 minutes
    const interval = setInterval(loadSecurityData, 120000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'failed_login': return <Lock className="h-4 w-4" />;
      case 'suspicious_ip': return <Globe className="h-4 w-4" />;
      case 'unusual_activity': return <Activity className="h-4 w-4" />;
      case 'security_breach': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading && !securityMetrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Dashboard
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
              <Shield className="h-5 w-5 mr-2" />
              Security Dashboard
            </CardTitle>
            <CardDescription>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSecurityData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Recent Events</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Security Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {securityMetrics?.failed_login_attempts || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Failed Logins</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {securityMetrics?.active_sessions || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Active Sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Unlock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {securityMetrics?.two_factor_enabled_users || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">2FA Enabled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {securityMetrics?.password_resets_today || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Password Resets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Alerts */}
            {securityMetrics && securityMetrics.failed_login_attempts > 10 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>High Failed Login Attempts</AlertTitle>
                <AlertDescription>
                  {securityMetrics.failed_login_attempts} failed login attempts detected in the last 24 hours.
                  Consider reviewing security policies.
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <Eye className="h-4 w-4 mr-2" />
                View Security Logs
              </Button>
              <Button variant="outline" className="justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Security Scan
              </Button>
              <Button variant="outline" className="justify-start">
                <Lock className="h-4 w-4 mr-2" />
                Lock Suspicious IPs
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="space-y-3">
              {recentEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No security events in the last 24 hours</p>
                </div>
              ) : (
                recentEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${getSeverityColor(event.severity)}`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium text-sm">{event.description}</p>
                              <Badge variant="outline" className={`text-xs ${getSeverityColor(event.severity)}`}>
                                {event.severity}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p>IP: {event.ip_address}</p>
                              <p>Type: {event.type.replace('_', ' ')}</p>
                              {event.user_id && <p>User ID: {event.user_id}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Session Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Sessions</span>
                    <span className="text-sm font-medium">{securityMetrics?.active_sessions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Expired Sessions</span>
                    <span className="text-sm font-medium">{securityMetrics?.expired_sessions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">2FA Adoption Rate</span>
                    <span className="text-sm font-medium">
                      {securityMetrics?.two_factor_enabled_users ?
                        `${((securityMetrics.two_factor_enabled_users / 1250) * 100).toFixed(1)}%` :
                        '0%'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Threat Detection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failed Login Attempts</span>
                    <span className="text-sm font-medium text-red-600">
                      {securityMetrics?.failed_login_attempts || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Suspicious Activities</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {securityMetrics?.suspicious_activities?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Password Resets Today</span>
                    <span className="text-sm font-medium">
                      {securityMetrics?.password_resets_today || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};