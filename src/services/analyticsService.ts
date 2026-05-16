import { supabase } from '@/integrations/supabase/client';
import { AnalyticsEvent, AnalyticsMetrics, AnalyticsConfig } from '@/types/analytics';

class AnalyticsService {
  private config: AnalyticsConfig = {
    enabled: false, // Disabled to prevent 400 errors from missing RPC function
    trackScreenViews: false,
    trackUserActions: false,
    sessionTimeout: 30,
    batchSize: 10,
    flushInterval: 30000,
  };

  private eventQueue: AnalyticsEvent[] = [];
  private sessionId: string;
  private currentUserId: string | null = null;
  private lastActivity: Date = new Date();

  constructor() {
    this.sessionId = this.generateSessionId();
    console.log('[Analytics] Service initialized (disabled)');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async trackEvent(event: { event_name: string; properties: Record<string, any> }): Promise<void> {
    // Analytics disabled - prevents 400 errors from missing Supabase RPC
    return;
  }

  async trackScreenView(screenName: string, previousScreen?: string): Promise<void> {
    return;
  }

  async trackUserAction(
    action: string,
    category: string,
    label?: string,
    value?: number,
    element?: string,
    page?: string
  ): Promise<void> {
    return;
  }

  private async flush(): Promise<void> {
    this.eventQueue = [];
  }

  async getAnalyticsMetrics(
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ): Promise<AnalyticsMetrics> {
    return {
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
    };
  }

  getSessionId(): string {
    return this.sessionId;
  }

  updateConfig(newConfig: Partial<AnalyticsConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  async destroy() {
    await this.flush();
  }
}

export const analyticsService = new AnalyticsService();