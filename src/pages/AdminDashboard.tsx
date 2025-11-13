import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  Users,
  Shield,
  Database,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  BarChart3,
  Zap,
  Globe,
  Lock,
  Server,
  TestTube,
  Wrench
} from 'lucide-react';
import { SystemHealth, UserAnalytics, SecurityMetrics, PerformanceMetrics } from '@/types/admin';

// Import admin components
import { SystemHealthCard } from '@/components/admin/SystemHealthCard';
import { UserAnalyticsCard } from '@/components/admin/UserAnalyticsCard';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { DatabaseManager } from '@/components/admin/DatabaseManager';
import { EthiopianMarketMonitor } from '@/components/admin/EthiopianMarketMonitor';
import { TestRunner } from '@/components/admin/TestRunner';
import { PerformanceMonitor } from '@/components/admin/PerformanceMonitor';

const AdminDashboard: React.FC = () => {
  const { adminUser, isAdmin, signOutAdmin } = useAdmin();
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - in production this would fetch from APIs
      setSystemHealth({
        status: 'healthy',
        uptime: 99.9,
        memory_usage: 65,
        cpu_usage: 45,
        disk_usage: 78,
        last_check: new Date().toISOString(),
        issues: []
      });

      setUserAnalytics({
        total_users: 1250,
        active_users_today: 89,
        active_users_week: 456,
        active_users_month: 892,
        new_users_today: 12,
        new_users_week: 67,
        new_users_month: 234,
        retention_rate: 78.5,
        churn_rate: 3.2,
        geographic_distribution: [
          { region: 'Oromia', country: 'Ethiopia', user_count: 450, percentage: 36 },
          { region: 'Amhara', country: 'Ethiopia', user_count: 320, percentage: 25.6 },
          { region: 'SNNPR', country: 'Ethiopia', user_count: 280, percentage: 22.4 },
          { region: 'Tigray', country: 'Ethiopia', user_count: 200, percentage: 16 }
        ],
        device_types: [
          { device_type: 'Android', user_count: 980, percentage: 78.4 },
          { device_type: 'iOS', user_count: 220, percentage: 17.6 },
          { device_type: 'Web', user_count: 50, percentage: 4 }
        ],
        feature_usage: [
          { feature: 'Milk Recording', user_count: 892, usage_count: 15420, avg_session_time: 180 },
          { feature: 'Animal Management', user_count: 1156, usage_count: 8920, avg_session_time: 240 },
          { feature: 'Marketplace', user_count: 567, usage_count: 3240, avg_session_time: 300 },
          { feature: 'Health Tracking', user_count: 445, usage_count: 2100, avg_session_time: 150 }
        ]
      });

      setSecurityMetrics({
        failed_login_attempts: 23,
        suspicious_activities: [],
        active_sessions: 156,
        expired_sessions: 12,
        password_resets_today: 8,
        two_factor_enabled_users: 234
      });

      setPerformanceMetrics({
        response_times: [],
        error_rates: [],
        throughput: [],
        resource_usage: {
          cpu_usage: 45,
          memory_usage: 65,
          disk_usage: 78,
          network_usage: 120,
          timestamp: new Date().toISOString()
        },
        slowest_endpoints: []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Access Required</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {adminUser?.full_name} ({adminUser?.role})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="capitalize">
                {adminUser?.role.replace('_', ' ')}
              </Badge>
              <Button variant="outline" onClick={signOutAdmin}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              {systemHealth && getStatusIcon(systemHealth.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                <span className={getStatusColor(systemHealth?.status || 'unknown')}>
                  {systemHealth?.status || 'Unknown'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Uptime: {systemHealth?.uptime.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userAnalytics?.active_users_today || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{userAnalytics?.new_users_today || 0} new today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityMetrics?.failed_login_attempts || 0}</div>
              <p className="text-xs text-muted-foreground">
                Failed login attempts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics?.resource_usage.cpu_usage || 0}%</div>
              <p className="text-xs text-muted-foreground">
                System resources
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="ethiopia">Ethiopia</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health Overview */}
              <SystemHealthCard />

              {/* User Analytics Overview */}
              <UserAnalyticsCard />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <TestTube className="h-4 w-4 mr-2" />
                  Run System Tests
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Database Backup
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Wrench className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">System health check completed</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">12 new users registered</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Security scan completed</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <SystemHealthCard />
          </TabsContent>

          <TabsContent value="users">
            <UserAnalyticsCard />
          </TabsContent>

          <TabsContent value="security">
            <SecurityDashboard />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMonitor />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseManager />
          </TabsContent>

          <TabsContent value="ethiopia">
            <EthiopianMarketMonitor />
          </TabsContent>

          <TabsContent value="testing">
            <TestRunner />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;