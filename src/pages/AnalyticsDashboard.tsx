import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Eye, MousePointer, TrendingUp, BarChart3 } from 'lucide-react';
import { useAnalyticsContext } from '@/contexts/AnalyticsContext';
import { AnalyticsMetrics } from '@/types/analytics';
import { format } from 'date-fns';

const AnalyticsDashboard: React.FC = () => {
  const { getAnalyticsMetrics } = useAnalyticsContext();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const data = await getAnalyticsMetrics(startDate, endDate);
      
      // Ensure we have valid metrics object with all required properties
      const validMetrics = {
        total_users: data?.total_users || 0,
        total_sessions: data?.total_sessions || 0,
        total_screen_views: data?.total_screen_views || 0,
        total_actions: data?.total_actions || 0,
        avg_session_duration: data?.avg_session_duration || 0,
        top_screens: data?.top_screens || [],
        top_actions: data?.top_actions || [],
        user_engagement: data?.user_engagement || {
          daily_active_users: 0,
          weekly_active_users: 0,
          monthly_active_users: 0,
        },
      };
      
      setMetrics(validMetrics);
    } catch (error) {
      console.error('Error loading analytics metrics:', error);
      
      // Set fallback metrics on error
      setMetrics({
        total_users: 0,
        total_sessions: 0,
        total_screen_views: 0,
        total_actions: 0,
        avg_session_duration: 0,
        top_screens: [],
        top_actions: [],
        user_engagement: {
          daily_active_users: 0,
          weekly_active_users: 0,
          monthly_active_users: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Track user engagement and app usage metrics</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('7d')}
          >
            Last 7 days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('30d')}
          >
            Last 30 days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('90d')}
          >
            Last 90 days
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_sessions || 0}</div>
            <p className="text-xs text-muted-foreground">User sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Screen Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_screen_views || 0}</div>
            <p className="text-xs text-muted-foreground">Page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Actions</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_actions || 0}</div>
            <p className="text-xs text-muted-foreground">Interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.avg_session_duration
                ? `${Math.round(metrics.avg_session_duration / 60)}m`
                : '0m'
              }
            </div>
            <p className="text-xs text-muted-foreground">Average time</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="screens" className="space-y-4">
        <TabsList>
          <TabsTrigger value="screens">Top Screens</TabsTrigger>
          <TabsTrigger value="actions">Top Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="screens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Most Viewed Screens
              </CardTitle>
              <CardDescription>
                Pages and screens users visit most frequently
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics?.top_screens && metrics.top_screens.length > 0 ? (
                <div className="space-y-4">
                  {metrics.top_screens.map((screen, index) => (
                    <div key={screen.screen_name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{screen.screen_name}</p>
                          <p className="text-sm text-muted-foreground">Screen view</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{screen.views}</p>
                        <p className="text-sm text-muted-foreground">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No screen view data available for the selected time range.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Most Common Actions
              </CardTitle>
              <CardDescription>
                User interactions and actions performed in the app
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics?.top_actions && metrics.top_actions.length > 0 ? (
                <div className="space-y-4">
                  {metrics.top_actions.map((action, index) => (
                    <div key={`${action.action}_${action.category}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{action.action}</p>
                          <p className="text-sm text-muted-foreground">{action.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{action.count}</p>
                        <p className="text-sm text-muted-foreground">times</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No action data available for the selected time range.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;