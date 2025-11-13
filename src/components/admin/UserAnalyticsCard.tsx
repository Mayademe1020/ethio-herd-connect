import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Smartphone,
  Monitor,
  Globe,
  RefreshCw,
  Target,
  Activity
} from 'lucide-react';
import { UserAnalytics, GeographicData, DeviceTypeData } from '@/types/admin';
import { adminService } from '@/services/adminService';

interface UserAnalyticsCardProps {
  className?: string;
}

export const UserAnalyticsCard: React.FC<UserAnalyticsCardProps> = ({ className }) => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const analyticsData = await adminService.getUserAnalytics();
      setAnalytics(analyticsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading user analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadAnalyticsData, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getGrowthColor = (value: number): string => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  if (loading && !analytics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            User Analytics
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
              <Users className="h-5 w-5 mr-2" />
              User Analytics
            </CardTitle>
            <CardDescription>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalyticsData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(analytics?.total_users || 0)}
            </div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics?.active_users_today || 0}
            </div>
            <div className="text-xs text-muted-foreground">Active Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analytics?.new_users_today || 0}
            </div>
            <div className="text-xs text-muted-foreground">New Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analytics?.retention_rate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Retention</div>
          </div>
        </div>

        {/* Growth Indicators */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Growth Trends</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Weekly Growth</span>
              </div>
              <div className={`flex items-center space-x-1 ${getGrowthColor(analytics?.new_users_week || 0)}`}>
                {getGrowthIcon(analytics?.new_users_week || 0)}
                <span className="text-sm font-medium">+{analytics?.new_users_week || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm">Monthly Growth</span>
              </div>
              <div className={`flex items-center space-x-1 ${getGrowthColor(analytics?.new_users_month || 0)}`}>
                {getGrowthIcon(analytics?.new_users_month || 0)}
                <span className="text-sm font-medium">+{analytics?.new_users_month || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Churn Rate</span>
              </div>
              <div className={`flex items-center space-x-1 ${getGrowthColor(-(analytics?.churn_rate || 0))}`}>
                {getGrowthIcon(-(analytics?.churn_rate || 0))}
                <span className="text-sm font-medium">{analytics?.churn_rate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            Regional Distribution
          </h4>
          <div className="space-y-2">
            {analytics?.geographic_distribution.map((region, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{region.region}</span>
                  <Badge variant="outline" className="text-xs">
                    {region.country}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {region.user_count} users
                  </span>
                  <div className="w-16">
                    <Progress value={region.percentage} className="h-2" />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">
                    {region.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Types */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Device Types</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analytics?.device_types.map((device, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {device.device_type === 'Android' || device.device_type === 'iOS' ? (
                    <Smartphone className="h-4 w-4 text-green-600" />
                  ) : (
                    <Monitor className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-sm">{device.device_type}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{device.user_count}</div>
                  <div className="text-xs text-muted-foreground">{device.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Usage Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Top Features</h4>
          <div className="space-y-2">
            {analytics?.feature_usage.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{feature.feature}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {feature.user_count} users
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(feature.avg_session_time)}s avg
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};