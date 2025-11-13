import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Clock,
  Server,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Target
} from 'lucide-react';
import { PerformanceMetrics, ResponseTimeData, ErrorRateData } from '@/types/admin';
import { adminService } from '@/services/adminService';

interface PerformanceMonitorProps {
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ className }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPerformanceMetrics();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();

    // Auto-refresh every 2 minutes for performance data
    const interval = setInterval(loadPerformanceData, 120000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceColor = (value: number, type: 'response' | 'error' | 'throughput'): string => {
    if (type === 'response') {
      if (value < 500) return 'text-green-600';
      if (value < 1000) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (type === 'error') {
      if (value < 1) return 'text-green-600';
      if (value < 5) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (type === 'throughput') {
      if (value > 100) return 'text-green-600';
      if (value > 50) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getResourceColor = (value: number, type: string): string => {
    if (type === 'cpu' || type === 'memory') {
      if (value < 70) return 'text-green-600';
      if (value < 85) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (type === 'disk') {
      if (value < 80) return 'text-green-600';
      if (value < 90) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getPerformanceStatus = (metrics: PerformanceMetrics): 'good' | 'warning' | 'critical' => {
    const avgResponseTime = metrics.response_times.reduce((sum, r) => sum + r.avg_response_time, 0) / metrics.response_times.length;
    const avgErrorRate = metrics.error_rates.reduce((sum, e) => sum + e.error_rate, 0) / metrics.error_rates.length;

    if (avgResponseTime > 2000 || avgErrorRate > 5) return 'critical';
    if (avgResponseTime > 1000 || avgErrorRate > 2) return 'warning';
    return 'good';
  };

  if (loading && !metrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Performance Monitor
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

  const performanceStatus = metrics ? getPerformanceStatus(metrics) : 'good';

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Performance Monitor
            </CardTitle>
            <CardDescription>
              System performance metrics and optimization insights
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={
              performanceStatus === 'good' ? 'text-green-600 border-green-200' :
              performanceStatus === 'warning' ? 'text-yellow-600 border-yellow-200' :
              'text-red-600 border-red-200'
            }>
              {performanceStatus.toUpperCase()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPerformanceData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">245ms</p>
                      <p className="text-xs text-muted-foreground">Avg Response Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">0.8%</p>
                      <p className="text-xs text-muted-foreground">Error Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">1,247</p>
                      <p className="text-xs text-muted-foreground">Requests/Min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resource Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Server className="h-4 w-4" />
                      <span className="text-sm">CPU Usage</span>
                    </div>
                    <span className={`text-sm font-medium ${getResourceColor(metrics?.resource_usage.cpu_usage || 0, 'cpu')}`}>
                      {metrics?.resource_usage.cpu_usage}%
                    </span>
                  </div>
                  <Progress value={metrics?.resource_usage.cpu_usage || 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4" />
                      <span className="text-sm">Memory Usage</span>
                    </div>
                    <span className={`text-sm font-medium ${getResourceColor(metrics?.resource_usage.memory_usage || 0, 'memory')}`}>
                      {metrics?.resource_usage.memory_usage}%
                    </span>
                  </div>
                  <Progress value={metrics?.resource_usage.memory_usage || 0} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4" />
                      <span className="text-sm">Disk Usage</span>
                    </div>
                    <span className={`text-sm font-medium ${getResourceColor(metrics?.resource_usage.disk_usage || 0, 'disk')}`}>
                      {metrics?.resource_usage.disk_usage}%
                    </span>
                  </div>
                  <Progress value={metrics?.resource_usage.disk_usage || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Performance Alerts */}
            {performanceStatus !== 'good' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Performance Issues Detected</AlertTitle>
                <AlertDescription>
                  {performanceStatus === 'critical'
                    ? 'Critical performance degradation detected. Immediate attention required.'
                    : 'Performance warnings detected. Monitor closely and consider optimization.'
                  }
                </AlertDescription>
              </Alert>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Detailed Metrics
              </Button>
              <Button variant="outline" className="justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance Trends
              </Button>
              <Button variant="outline" className="justify-start">
                <Zap className="h-4 w-4 mr-2" />
                Optimization Suggestions
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-4">
            <div className="space-y-3">
              {/* Mock endpoint performance data */}
              {[
                { endpoint: '/api/animals', method: 'GET', avg_time: 245, p95_time: 450, error_rate: 0.5, requests: 1250 },
                { endpoint: '/api/milk', method: 'POST', avg_time: 180, p95_time: 320, error_rate: 0.2, requests: 890 },
                { endpoint: '/api/marketplace', method: 'GET', avg_time: 320, p95_time: 580, error_rate: 1.2, requests: 567 },
                { endpoint: '/api/auth', method: 'POST', avg_time: 150, p95_time: 280, error_rate: 0.1, requests: 234 }
              ].map((endpoint, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {endpoint.method}
                        </Badge>
                        <span className="font-medium">{endpoint.endpoint}</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getPerformanceColor(endpoint.avg_time, 'response')}`}>
                          {formatDuration(endpoint.avg_time)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {endpoint.requests}/min
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">P95:</span>
                        <span className="font-medium ml-1">{formatDuration(endpoint.p95_time)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Errors:</span>
                        <span className={`font-medium ml-1 ${getPerformanceColor(endpoint.error_rate, 'error')}`}>
                          {endpoint.error_rate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requests:</span>
                        <span className="font-medium ml-1">{endpoint.requests}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CPU Cores</span>
                    <span className="text-sm font-medium">4 cores</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory</span>
                    <span className="text-sm font-medium">8 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage</span>
                    <span className="text-sm font-medium">100 GB SSD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Network</span>
                    <span className="text-sm font-medium">1 Gbps</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Database Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Connections</span>
                    <span className="text-sm font-medium">23/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Query Cache Hit Rate</span>
                    <span className="text-sm font-medium">94.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Slow Queries</span>
                    <span className="text-sm font-medium text-red-600">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Query Time</span>
                    <span className="text-sm font-medium">45ms</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900">Good Performance</h4>
                          <p className="text-sm text-green-700 mt-1">
                            System performance is within acceptable ranges. Response times are fast and error rates are low.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Optimization Opportunities</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Consider implementing caching for frequently accessed marketplace data to further improve response times.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900">Monitor Database Queries</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            3 slow queries detected. Review query optimization and consider adding database indexes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Implement API Caching</p>
                        <p className="text-sm text-muted-foreground">Cache frequent API responses to reduce database load</p>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Database Query Optimization</p>
                        <p className="text-sm text-muted-foreground">Review and optimize slow database queries</p>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">CDN Implementation</p>
                        <p className="text-sm text-muted-foreground">Implement CDN for static assets in Ethiopia</p>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>
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