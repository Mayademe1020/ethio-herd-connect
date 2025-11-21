export interface AnalyticsEvent {
  id?: string;
  event_name: string;
  user_id?: string;
  session_id: string;
  properties: {
    [key: string]: any;
  };
  created_at?: string;
}

export interface ScreenViewEvent extends AnalyticsEvent {
  event_name: 'screen_view';
  properties: {
    screen_name: string;
    previous_screen?: string;
    duration?: number;
  };
}

export interface UserActionEvent extends AnalyticsEvent {
  event_name: 'user_action';
  properties: {
    action: string;
    category: string;
    label?: string;
    value?: number;
    element?: string;
    page?: string;
  };
}

export interface AnalyticsSession {
  session_id: string;
  user_id?: string;
  start_time: Date;
  last_activity: Date;
  screen_views: number;
  actions: number;
}

export interface AnalyticsMetrics {
  total_users: number;
  total_sessions: number;
  total_screen_views: number;
  total_actions: number;
  avg_session_duration: number;
  top_screens: Array<{
    screen_name: string;
    views: number;
  }>;
  top_actions: Array<{
    action: string;
    category: string;
    count: number;
  }>;
  user_engagement: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
  };
}

export type AnalyticsEventType = 'screen_view' | 'user_action' | 'session_start' | 'session_end';

export interface AnalyticsConfig {
  enabled: boolean;
  trackScreenViews: boolean;
  trackUserActions: boolean;
  sessionTimeout: number; // in minutes
  batchSize: number;
  flushInterval: number; // in milliseconds
}