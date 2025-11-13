// Admin Service - Handles all admin-related API calls and data management

import { supabase } from '@/integrations/supabase/client';
import {
  SystemHealth,
  UserAnalytics,
  SecurityMetrics,
  PerformanceMetrics,
  DatabaseMetrics,
  EthiopianMarketMetrics,
  BusinessIntelligence,
  AdminAction,
  AuditLog,
  EmergencyResponse,
  DeploymentStatus,
  TestResult,
  AdminUser
} from '@/types/admin';

class AdminService {
  // System Health Monitoring
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // Mock data - in production, this would call actual health check endpoints
      const response = await fetch('/api/admin/health');
      if (!response.ok) {
        throw new Error('Failed to fetch system health');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching system health:', error);
      // Return mock data for demo
      return {
        status: 'healthy',
        uptime: 99.9,
        memory_usage: 65,
        cpu_usage: 45,
        disk_usage: 78,
        last_check: new Date().toISOString(),
        issues: []
      };
    }
  }

  // User Analytics
  async getUserAnalytics(): Promise<UserAnalytics> {
    try {
      const response = await fetch('/api/admin/analytics/users');
      if (!response.ok) {
        throw new Error('Failed to fetch user analytics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      // Return mock data for demo
      return {
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
      };
    }
  }

  // Security Metrics
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const response = await fetch('/api/admin/security/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch security metrics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      // Return mock data for demo
      return {
        failed_login_attempts: 23,
        suspicious_activities: [],
        active_sessions: 156,
        expired_sessions: 12,
        password_resets_today: 8,
        two_factor_enabled_users: 234
      };
    }
  }

  // Performance Metrics
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const response = await fetch('/api/admin/performance/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      // Return mock data for demo
      return {
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
      };
    }
  }

  // Database Metrics
  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      const response = await fetch('/api/admin/database/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch database metrics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching database metrics:', error);
      // Return mock data for demo
      return {
        connection_count: 23,
        query_count: 15420,
        slow_queries: 3,
        table_sizes: [
          { table_name: 'animals', row_count: 2450, size_mb: 45.2, growth_rate: 2.1 },
          { table_name: 'milk_records', row_count: 15420, size_mb: 120.8, growth_rate: 5.3 },
          { table_name: 'market_listings', row_count: 567, size_mb: 23.4, growth_rate: 1.8 }
        ],
        backup_status: {
          last_backup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          backup_size: 245000000,
          status: 'success',
          next_backup: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString()
        },
        migration_status: []
      };
    }
  }

  // Ethiopian Market Metrics
  async getEthiopianMarketMetrics(): Promise<EthiopianMarketMetrics> {
    try {
      const response = await fetch('/api/admin/ethiopia/market');
      if (!response.ok) {
        throw new Error('Failed to fetch Ethiopian market metrics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching Ethiopian market metrics:', error);
      // Return mock data for demo
      return {
        livestock_prices: [
          { animal_type: 'cattle', breed: 'Borana', avg_price_etb: 25000, price_range_min: 20000, price_range_max: 35000, last_updated: new Date().toISOString(), region: 'Oromia' },
          { animal_type: 'goat', breed: 'Central Highland', avg_price_etb: 1800, price_range_min: 1200, price_range_max: 2500, last_updated: new Date().toISOString(), region: 'Amhara' }
        ],
        regional_demand: [
          { region: 'Oromia', demand_score: 8, trending_up: true, top_demanded_breeds: ['Borana', 'Arsi'], avg_response_time: 2.5 },
          { region: 'Amhara', demand_score: 7, trending_up: false, top_demanded_breeds: ['Central Highland'], avg_response_time: 3.2 }
        ],
        seasonal_trends: [
          { season: 'Dry Season', animal_type: 'cattle', price_multiplier: 1.2, demand_multiplier: 0.8, historical_avg_price: 22000 },
          { season: 'Rainy Season', animal_type: 'cattle', price_multiplier: 0.9, demand_multiplier: 1.3, historical_avg_price: 28000 }
        ],
        market_activity: {
          total_listings: 127,
          active_listings: 89,
          sold_animals_today: 8,
          sold_animals_week: 34,
          avg_sale_price: 12500,
          buyer_seller_ratio: 2.1
        },
        farmer_engagement: {
          daily_active_farmers: 156,
          milk_recording_rate: 78.5,
          marketplace_participation_rate: 23.4,
          health_tracking_rate: 45.6,
          offline_sync_success_rate: 92.3
        }
      };
    }
  }

  // Business Intelligence
  async getBusinessIntelligence(): Promise<BusinessIntelligence> {
    try {
      const response = await fetch('/api/admin/business-intelligence');
      if (!response.ok) {
        throw new Error('Failed to fetch business intelligence');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching business intelligence:', error);
      // Return mock data for demo
      return {
        revenue_metrics: {
          total_revenue: 125000,
          monthly_revenue: 18500,
          revenue_by_feature: [
            { feature: 'Premium Features', revenue: 45000, user_count: 234, avg_revenue_per_user: 192.31 },
            { feature: 'Marketplace Commission', revenue: 35000, user_count: 89, avg_revenue_per_user: 393.26 },
            { feature: 'Data Export', revenue: 12000, user_count: 156, avg_revenue_per_user: 76.92 }
          ],
          projected_revenue: 210000,
          growth_rate: 15.3
        },
        user_growth: {
          user_acquisition_cost: 25.50,
          lifetime_value: 185.75,
          churn_rate: 3.2,
          retention_rate: 78.5,
          growth_projection: [
            { month: 'Dec 2024', projected_users: 1450, confidence_level: 85 },
            { month: 'Jan 2025', projected_users: 1680, confidence_level: 78 },
            { month: 'Feb 2025', projected_users: 1920, confidence_level: 72 }
          ]
        },
        feature_adoption: {
          feature_adoption_rates: [
            { feature: 'Milk Recording', adoption_rate: 78.5, time_to_adopt: 3, user_satisfaction: 4.2 },
            { feature: 'Animal Management', adoption_rate: 92.3, time_to_adopt: 1, user_satisfaction: 4.5 },
            { feature: 'Marketplace', adoption_rate: 23.4, time_to_adopt: 14, user_satisfaction: 3.8 }
          ],
          user_segments: [
            { segment_name: 'Small Farmers', user_count: 890, characteristics: ['1-5 animals', 'Basic features'], engagement_score: 7.2 },
            { segment_name: 'Commercial Farmers', user_count: 234, characteristics: ['10+ animals', 'Premium features'], engagement_score: 8.9 },
            { segment_name: 'Market Traders', user_count: 126, characteristics: ['Marketplace focus', 'High activity'], engagement_score: 9.1 }
          ],
          onboarding_completion_rate: 68.5,
          feature_discovery_rate: 45.2
        },
        market_insights: [
          {
            title: 'Growing Demand in Oromia Region',
            description: 'Livestock prices in Oromia have increased by 15% in the last month due to seasonal demand.',
            impact: 'high',
            confidence: 85,
            data_points: []
          },
          {
            title: 'Mobile Adoption Increasing',
            description: 'Mobile users now represent 78% of active users, up from 65% last quarter.',
            impact: 'medium',
            confidence: 92,
            data_points: []
          }
        ],
        recommendations: [
          {
            title: 'Expand Marketplace Features',
            description: 'Add bulk listing and negotiation tools to increase marketplace engagement.',
            priority: 'high',
            effort: 'medium',
            expected_impact: 'Increase marketplace transactions by 40%',
            timeline: '2 months'
          },
          {
            title: 'Improve Mobile Performance',
            description: 'Optimize app performance for 2G networks in rural areas.',
            priority: 'high',
            effort: 'high',
            expected_impact: 'Reduce bounce rate by 25% in rural areas',
            timeline: '1 month'
          }
        ]
      };
    }
  }

  // Admin Actions
  async logAdminAction(action: Omit<AdminAction, 'id' | 'timestamp'>): Promise<void> {
    try {
      // Mock logging for demo - in production this would use the audit_logs table
      console.log('Admin Action Logged:', {
        admin_id: action.admin_id,
        action: action.action_type,
        resource: action.resource_type,
        resource_id: action.resource_id,
        timestamp: new Date().toISOString(),
        metadata: action.metadata
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  // Emergency Response
  async getEmergencyIncidents(): Promise<EmergencyResponse[]> {
    try {
      const response = await fetch('/api/admin/emergency/incidents');
      if (!response.ok) {
        throw new Error('Failed to fetch emergency incidents');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching emergency incidents:', error);
      return [];
    }
  }

  async createEmergencyIncident(incident: Omit<EmergencyResponse, 'id' | 'created_at' | 'resolved_at' | 'actions'>): Promise<EmergencyResponse> {
    try {
      const response = await fetch('/api/admin/emergency/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident)
      });
      if (!response.ok) {
        throw new Error('Failed to create emergency incident');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating emergency incident:', error);
      throw error;
    }
  }

  // Testing
  async runSystemTests(): Promise<TestResult[]> {
    try {
      const response = await fetch('/api/admin/tests/run', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to run system tests');
      }
      return await response.json();
    } catch (error) {
      console.error('Error running system tests:', error);
      return [];
    }
  }

  async getTestResults(): Promise<TestResult[]> {
    try {
      const response = await fetch('/api/admin/tests/results');
      if (!response.ok) {
        throw new Error('Failed to fetch test results');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching test results:', error);
      return [];
    }
  }

  // Database Management
  async createDatabaseBackup(): Promise<{ success: boolean; backup_id?: string }> {
    try {
      const response = await fetch('/api/admin/database/backup', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to create database backup');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating database backup:', error);
      return { success: false };
    }
  }

  async runDatabaseMigrations(): Promise<{ success: boolean; migrations?: any[] }> {
    try {
      const response = await fetch('/api/admin/database/migrate', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to run database migrations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error running database migrations:', error);
      return { success: false };
    }
  }

  // Deployment Management
  async getDeployments(): Promise<DeploymentStatus[]> {
    try {
      const response = await fetch('/api/admin/deployments');
      if (!response.ok) {
        throw new Error('Failed to fetch deployments');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching deployments:', error);
      return [];
    }
  }

  async createDeployment(deployment: Omit<DeploymentStatus, 'id' | 'started_at' | 'completed_at'>): Promise<DeploymentStatus> {
    try {
      const response = await fetch('/api/admin/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deployment)
      });
      if (!response.ok) {
        throw new Error('Failed to create deployment');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating deployment:', error);
      throw error;
    }
  }

  async rollbackDeployment(deploymentId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`/api/admin/deployments/${deploymentId}/rollback`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to rollback deployment');
      }
      return await response.json();
    } catch (error) {
      console.error('Error rolling back deployment:', error);
      return { success: false };
    }
  }
}

export const adminService = new AdminService();