import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MapPin,
  Calendar,
  BarChart3,
  RefreshCw,
  Target,
  Users,
  ShoppingCart
} from 'lucide-react';
import { EthiopianMarketMetrics, LivestockPriceData, RegionalDemandData } from '@/types/admin';
import { adminService } from '@/services/adminService';

interface EthiopianMarketMonitorProps {
  className?: string;
}

export const EthiopianMarketMonitor: React.FC<EthiopianMarketMonitorProps> = ({ className }) => {
  const [marketData, setMarketData] = useState<EthiopianMarketMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getEthiopianMarketMetrics();
      setMarketData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading Ethiopian market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();

    // Auto-refresh every 15 minutes for market data
    const interval = setInterval(loadMarketData, 900000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('am-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDemandColor = (score: number): string => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDemandIcon = (trending: boolean) => {
    return trending ?
      <TrendingUp className="h-4 w-4 text-green-600" /> :
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (loading && !marketData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Ethiopian Market Monitor
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
              <Globe className="h-5 w-5 mr-2" />
              Ethiopian Market Monitor
            </CardTitle>
            <CardDescription>
              Livestock market trends and regional insights
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMarketData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prices" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="prices">Prices</TabsTrigger>
            <TabsTrigger value="demand">Demand</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="prices" className="space-y-6">
            {/* Livestock Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marketData?.livestock_prices.map((price, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium capitalize">{price.animal_type}</p>
                          <p className="text-sm text-muted-foreground">{price.breed}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{price.region}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average Price</span>
                        <span className="font-bold text-lg">{formatCurrency(price.avg_price_etb)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Range:</span>
                        <span>{formatCurrency(price.price_range_min)} - {formatCurrency(price.price_range_max)}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{new Date(price.last_updated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Seasonal Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Seasonal Price Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData?.seasonal_trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium">{trend.season}</div>
                        <Badge variant="outline" className="capitalize">{trend.animal_type}</Badge>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Multiplier: </span>
                          <span className={`font-medium ${trend.price_multiplier > 1 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.price_multiplier}x
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Historical: </span>
                          <span className="font-medium">{formatCurrency(trend.historical_avg_price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demand" className="space-y-6">
            {/* Regional Demand */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketData?.regional_demand.map((region, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getDemandIcon(region.trending_up)}
                        <Badge className={getDemandColor(region.demand_score)}>
                          {region.demand_score}/10
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Demand Level</span>
                          <span>{region.demand_score}/10</span>
                        </div>
                        <Progress value={region.demand_score * 10} className="h-2" />
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">Response Time: </span>
                        <span className="font-medium">{region.avg_response_time}h</span>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">Top Breeds: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {region.top_demanded_breeds.slice(0, 2).map((breed, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {breed}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {/* Market Activity Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{marketData?.market_activity.total_listings || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Listings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{marketData?.market_activity.active_listings || 0}</p>
                      <p className="text-xs text-muted-foreground">Active Listings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{marketData?.market_activity.sold_animals_today || 0}</p>
                      <p className="text-xs text-muted-foreground">Sold Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(marketData?.market_activity.avg_sale_price || 0)}</p>
                      <p className="text-xs text-muted-foreground">Avg Sale Price</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Farmer Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Farmer Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Daily Active Farmers</span>
                      <span className="font-medium">{marketData?.farmer_engagement.daily_active_farmers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Milk Recording Rate</span>
                      <span className="font-medium">{marketData?.farmer_engagement.milk_recording_rate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Marketplace Participation</span>
                      <span className="font-medium">{marketData?.farmer_engagement.marketplace_participation_rate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Offline Sync Success</span>
                      <span className="font-medium">{marketData?.farmer_engagement.offline_sync_success_rate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* Market Insights */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Market Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Growing Oromia Demand</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Livestock prices in Oromia have increased by 15% in the last month due to seasonal demand patterns.
                            Consider increasing marketplace promotion in this region.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Users className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900">Mobile Adoption Success</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Mobile users now represent 78% of active users, up from 65% last quarter.
                            Continue focusing on mobile-first features and offline capabilities.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900">Marketplace Optimization Needed</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Only 23% of farmers are actively participating in the marketplace.
                            Consider implementing bulk listing features and negotiation tools.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actionable Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommended Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Expand Oromia Marketing</p>
                        <p className="text-sm text-muted-foreground">Target high-demand region with special promotions</p>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Improve Marketplace UX</p>
                        <p className="text-sm text-muted-foreground">Add bulk operations and better search filters</p>
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Seasonal Price Alerts</p>
                        <p className="text-sm text-muted-foreground">Notify farmers of optimal selling times</p>
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