import { supabase } from '@/integrations/supabase/client';
import { AnalyticsEvent, AnalyticsMetrics, AnalyticsConfig, ScreenViewEvent, UserActionEvent } from '@/types/analytics';

class AnalyticsService {
  private config: AnalyticsConfig = {
    enabled: true,
    trackScreenViews: true,
    trackUserActions: true,
    sessionTimeout: 30, // 30 minutes
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
  };

  private eventQueue: AnalyticsEvent[] = [];
  private sessionId: string;
  private currentUserId: string | null = null;
  private lastActivity: Date = new Date();
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupAutoFlush();
    this.trackSessionStart();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupAutoFlush() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private async trackSessionStart() {
    // Disable analytics in development to prevent console errors
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Session started (tracking disabled in dev)');
      return;
    }

    await this.trackEvent({
      event_name: 'session_start',
      properties: {
        session_id: this.sessionId,
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });
  }

  async trackEvent(event: { event_name: string; properties: Record<string, any> }): Promise<void> {
    // Disable analytics in development to prevent console errors
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event:', event.event_name);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      this.currentUserId = user?.id || null;

      const fullEvent: AnalyticsEvent = {
        event_name: event.event_name,
        properties: event.properties,
        user_id: this.currentUserId || undefined,
        session_id: this.sessionId,
      } as AnalyticsEvent;

      this.eventQueue.push(fullEvent);
      this.lastActivity = new Date();

      // Flush if queue is full
      if (this.eventQueue.length >= this.config.batchSize) {
        await this.flush();
      }
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  async trackScreenView(screenName: string, previousScreen?: string): Promise<void> {
    if (!this.config.trackScreenViews) return;

    await this.trackEvent({
      event_name: 'screen_view',
      properties: {
        screen_name: screenName,
        previous_screen: previousScreen,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async trackUserAction(
    action: string,
    category: string,
    label?: string,
    value?: number,
    element?: string,
    page?: string
  ): Promise<void> {
    if (!this.config.trackUserActions) return;

    await this.trackEvent({
      event_name: 'user_action',
      properties: {
        action,
        category,
        label,
        value,
        element,
        page: page || window.location.pathname,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    // Skip flushing in development to prevent console errors
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Would flush', this.eventQueue.length, 'events');
      this.eventQueue = [];
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Use RPC to call track_event function which bypasses RLS issues
      for (const event of eventsToSend) {
        const { error } = await supabase.rpc('track_event', {
          p_event_name: event.event_name,
          p_event_category: null,
          p_properties: event.properties || {},
          p_device_type: 'web',
          p_app_version: '1.0.0'
        });

        if (error) {
          console.error('Error tracking analytics event:', error);
        }
      }
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  async getAnalyticsMetrics(
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ): Promise<AnalyticsMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // For now, return basic metrics. In a real implementation, you'd query aggregated data
      const metrics: AnalyticsMetrics = {
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

      // Get user's events
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id);

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data: events, error } = await query;

      if (error) throw error;

      if (events) {
        const screenViews = events.filter(e => e.event_name === 'screen_view');
        const userActions = events.filter(e => e.event_name === 'user_action');
        const sessions = new Set(events.map(e => e.session_id));

        metrics.total_sessions = sessions.size;
        metrics.total_screen_views = screenViews.length;
        metrics.total_actions = userActions.length;

        // Calculate top screens
        const screenCount: Record<string, number> = {};
        screenViews.forEach(event => {
          const properties = event.properties as any;
          const screenName = properties?.screen_name;
          if (screenName) {
            screenCount[screenName] = (screenCount[screenName] || 0) + 1;
          }
        });

        metrics.top_screens = Object.entries(screenCount)
          .map(([screen_name, views]) => ({ screen_name, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);

        // Calculate top actions
        const actionCount: Record<string, { category: string; count: number }> = {};
        userActions.forEach(event => {
          const properties = event.properties as any;
          const action = properties?.action;
          const category = properties?.category || 'general';
          if (action) {
            const key = `${action}_${category}`;
            if (!actionCount[key]) {
              actionCount[key] = { category, count: 0 };
            }
            actionCount[key].count++;
          }
        });

        metrics.top_actions = Object.entries(actionCount)
          .map(([action, data]) => ({
            action: action.split('_')[0],
            category: data.category,
            count: data.count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }

      return metrics;
    } catch (error) {
      console.error('Error getting analytics metrics:', error);
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
  }

  getSessionId(): string {
    return this.sessionId;
  }

  updateConfig(newConfig: Partial<AnalyticsConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  async destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush();
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();