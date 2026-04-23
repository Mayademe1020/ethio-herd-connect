// src/types/notificationPreferences.ts

export interface NotificationCategory {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  icon: string;
  frequency?: 'realtime' | 'daily' | 'weekly';
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  
  // Global settings
  global_enabled: boolean;
  do_not_disturb: boolean;
  dnd_start_time: string; // "22:00"
  dnd_end_time: string; // "06:00"
  
  // Category-specific settings
  milk_reminders: {
    enabled: boolean;
    morning_time: string;
    afternoon_time: string;
    frequency: 'realtime' | 'daily' | 'weekly';
    batch_enabled: boolean;
  };
  
  market_alerts: {
    enabled: boolean;
    new_listings: boolean;
    price_changes: boolean;
    interests: boolean;
    frequency: 'realtime' | 'daily' | 'weekly';
  };
  
  health_alerts: {
    enabled: boolean;
    vaccinations: boolean;
    breeding: boolean;
    health_issues: boolean;
    frequency: 'realtime' | 'daily' | 'weekly';
  };
  
  account_updates: {
    enabled: boolean;
    login_activity: boolean;
    security_alerts: boolean;
    feature_updates: boolean;
  };
  
  // Do Not Disturb schedule
  dnd_schedule: {
    enabled: boolean;
    start_time: string;
    end_time: string;
    days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  };
  
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferencesUpdate {
  global_enabled?: boolean;
  do_not_disturb?: boolean;
  dnd_start_time?: string;
  dnd_end_time?: string;
  milk_reminders?: Partial<NotificationPreferences['milk_reminders']>;
  market_alerts?: Partial<NotificationPreferences['market_alerts']>;
  health_alerts?: Partial<NotificationPreferences['health_alerts']>;
  account_updates?: Partial<NotificationPreferences['account_updates']>;
  dnd_schedule?: Partial<NotificationPreferences['dnd_schedule']>;
}

// Default preferences for new users
export const defaultPreferences: Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  global_enabled: true,
  do_not_disturb: false,
  dnd_start_time: '22:00',
  dnd_end_time: '06:00',
  
  milk_reminders: {
    enabled: true,
    morning_time: '06:00',
    afternoon_time: '18:00',
    frequency: 'realtime',
    batch_enabled: false,
  },
  
  market_alerts: {
    enabled: true,
    new_listings: true,
    price_changes: false,
    interests: true,
    frequency: 'daily',
  },
  
  health_alerts: {
    enabled: true,
    vaccinations: true,
    breeding: true,
    health_issues: true,
    frequency: 'realtime',
  },
  
  account_updates: {
    enabled: true,
    login_activity: false,
    security_alerts: true,
    feature_updates: true,
  },
  
  dnd_schedule: {
    enabled: false,
    start_time: '22:00',
    end_time: '06:00',
    days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  },
};
