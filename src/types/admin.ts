// Admin Toolkit Types and Interfaces

export type AdminRole = 'super_admin' | 'system_admin' | 'support_admin' | 'readonly_admin';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  permissions: AdminPermission[];
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memory_usage: number;
  cpu_usage: number;
  disk_usage: number;
  last_check: string;
  issues: SystemIssue[];
}

export interface SystemIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_users?: number;
  created_at: string;
  resolved_at?: string;
  resolution?: string;
}

export interface UserAnalytics {
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  active_users_month: number;
  new_users_today: number;
  new_users_week: number;
  new_users_month: number;
  retention_rate: number;
  churn_rate: number;
  geographic_distribution: GeographicData[];
  device_types: DeviceTypeData[];
  feature_usage: FeatureUsageData[];
}

export interface GeographicData {
  region: string;
  country: string;
  user_count: number;
  percentage: number;
}

export interface DeviceTypeData {
  device_type: string;
  user_count: number;
  percentage: number;
}

export interface FeatureUsageData {
  feature: string;
  user_count: number;
  usage_count: number;
  avg_session_time: number;
}

export interface DatabaseMetrics {
  connection_count: number;
  query_count: number;
  slow_queries: number;
  table_sizes: TableSizeData[];
  backup_status: BackupStatus;
  migration_status: MigrationStatus[];
}

export interface TableSizeData {
  table_name: string;
  row_count: number;
  size_mb: number;
  growth_rate: number;
}

export interface BackupStatus {
  last_backup: string;
  backup_size: number;
  status: 'success' | 'failed' | 'in_progress';
  next_backup: string;
}

export interface MigrationStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executed_at?: string;
  error_message?: string;
}

export interface SecurityMetrics {
  failed_login_attempts: number;
  suspicious_activities: SecurityEvent[];
  active_sessions: number;
  expired_sessions: number;
  password_resets_today: number;
  two_factor_enabled_users: number;
}

export interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious_ip' | 'unusual_activity' | 'security_breach';
  user_id?: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface PerformanceMetrics {
  response_times: ResponseTimeData[];
  error_rates: ErrorRateData[];
  throughput: ThroughputData[];
  resource_usage: ResourceUsageData;
  slowest_endpoints: EndpointPerformance[];
}

export interface ResponseTimeData {
  endpoint: string;
  avg_response_time: number;
  p95_response_time: number;
  p99_response_time: number;
  timestamp: string;
}

export interface ErrorRateData {
  endpoint: string;
  error_count: number;
  total_requests: number;
  error_rate: number;
  timestamp: string;
}

export interface ThroughputData {
  endpoint: string;
  requests_per_minute: number;
  timestamp: string;
}

export interface ResourceUsageData {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_usage: number;
  timestamp: string;
}

export interface EndpointPerformance {
  endpoint: string;
  method: string;
  avg_response_time: number;
  error_rate: number;
  request_count: number;
}

export interface EthiopianMarketMetrics {
  livestock_prices: LivestockPriceData[];
  regional_demand: RegionalDemandData[];
  seasonal_trends: SeasonalTrendData[];
  market_activity: MarketActivityData;
  farmer_engagement: FarmerEngagementData;
}

export interface LivestockPriceData {
  animal_type: string;
  breed: string;
  avg_price_etb: number;
  price_range_min: number;
  price_range_max: number;
  last_updated: string;
  region: string;
}

export interface RegionalDemandData {
  region: string;
  demand_score: number; // 1-10 scale
  trending_up: boolean;
  top_demanded_breeds: string[];
  avg_response_time: number; // hours to get response from buyers
}

export interface SeasonalTrendData {
  season: string;
  animal_type: string;
  price_multiplier: number;
  demand_multiplier: number;
  historical_avg_price: number;
}

export interface MarketActivityData {
  total_listings: number;
  active_listings: number;
  sold_animals_today: number;
  sold_animals_week: number;
  avg_sale_price: number;
  buyer_seller_ratio: number;
}

export interface FarmerEngagementData {
  daily_active_farmers: number;
  milk_recording_rate: number;
  marketplace_participation_rate: number;
  health_tracking_rate: number;
  offline_sync_success_rate: number;
}

export interface BusinessIntelligence {
  revenue_metrics: RevenueData;
  user_growth: GrowthData;
  feature_adoption: AdoptionData;
  market_insights: MarketInsight[];
  recommendations: BusinessRecommendation[];
}

export interface RevenueData {
  total_revenue: number;
  monthly_revenue: number;
  revenue_by_feature: FeatureRevenue[];
  projected_revenue: number;
  growth_rate: number;
}

export interface FeatureRevenue {
  feature: string;
  revenue: number;
  user_count: number;
  avg_revenue_per_user: number;
}

export interface GrowthData {
  user_acquisition_cost: number;
  lifetime_value: number;
  churn_rate: number;
  retention_rate: number;
  growth_projection: GrowthProjection[];
}

export interface GrowthProjection {
  month: string;
  projected_users: number;
  confidence_level: number;
}

export interface AdoptionData {
  feature_adoption_rates: FeatureAdoption[];
  user_segments: UserSegment[];
  onboarding_completion_rate: number;
  feature_discovery_rate: number;
}

export interface FeatureAdoption {
  feature: string;
  adoption_rate: number;
  time_to_adopt: number; // days
  user_satisfaction: number; // 1-5 scale
}

export interface UserSegment {
  segment_name: string;
  user_count: number;
  characteristics: string[];
  engagement_score: number;
}

export interface MarketInsight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  data_points: any[];
}

export interface BusinessRecommendation {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  expected_impact: string;
  timeline: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  description: string;
  metadata: any;
  timestamp: string;
  ip_address: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  admin_id?: string;
  action: string;
  resource: string;
  details: any;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface EmergencyResponse {
  id: string;
  type: 'system_down' | 'data_breach' | 'performance_issue' | 'security_threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'resolved' | 'monitoring';
  created_at: string;
  resolved_at?: string;
  assigned_admin?: string;
  actions_taken: EmergencyAction[];
  impact_assessment: string;
}

export interface EmergencyAction {
  id: string;
  action: string;
  timestamp: string;
  admin_id: string;
  result: string;
  duration_minutes?: number;
}

export interface DeploymentStatus {
  id: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  started_at: string;
  completed_at?: string;
  rollback_available: boolean;
  changes: DeploymentChange[];
  metrics: DeploymentMetrics;
}

export interface DeploymentChange {
  type: 'feature' | 'bug_fix' | 'security' | 'performance' | 'database';
  description: string;
  impact: 'low' | 'medium' | 'high';
  requires_downtime: boolean;
}

export interface DeploymentMetrics {
  deployment_time: number; // minutes
  downtime_duration: number; // minutes
  error_rate_change: number; // percentage
  performance_impact: number; // percentage
  user_impact: string;
}

export interface TestResult {
  id: string;
  test_suite: string;
  test_name: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  duration: number;
  error_message?: string;
  stack_trace?: string;
  timestamp: string;
  environment: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  test_count: number;
  last_run?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  results: TestResult[];
  coverage?: TestCoverage;
}

export interface TestCoverage {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  timestamp: string;
}