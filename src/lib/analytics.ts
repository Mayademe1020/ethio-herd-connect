import { supabase } from '@/integrations/supabase/client';

// Event names constants
export const ANALYTICS_EVENTS = {
  ANIMAL_REGISTERED: 'animal_registered',
  MILK_RECORDED: 'milk_recorded',
  LISTING_CREATED: 'listing_created',
  LISTING_VIEWED: 'listing_viewed',
  INTEREST_EXPRESSED: 'interest_expressed',
  OFFLINE_ACTION_QUEUED: 'offline_action_queued',
  OFFLINE_ACTION_SYNCED: 'offline_action_synced',
  PAGE_VIEW: 'page_view',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  session_id: string;
  properties: Record<string, any>;
  created_at?: string;
}

interface QueuedEvent {
  event_name: string;
  properties: Record<string, any>;
  timestamp: string;
}

class Analytics {
  private sessionId: string;
  private queue: QueuedEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly FLUSH_INTERVAL_MS = 30000; // 30 seconds
  private readonly MAX_QUEUE_SIZE = 10;
  private readonly QUEUE_STORAGE_KEY = 'analytics_queue';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadQueueFromStorage();
    this.startAutoFlush();
    
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics queue from storage:', error);
    }
  }

  private saveQueueToStorage(): void {
    try {
      localStorage.setItem(this.QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.warn('Failed to save analytics queue to storage:', error);
    }
  }

  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  private stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Track an analytics event
   */
  async track(eventName: string, properties: Record<string, any> = {}): Promise<void> {
    try {
      const event: QueuedEvent = {
        event_name: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      // Add to queue
      this.queue.push(event);
      this.saveQueueToStorage();

      // Flush if queue is full
      if (this.queue.length >= this.MAX_QUEUE_SIZE) {
        await this.flush();
      }
    } catch (error) {
      // Fail silently - don't block user actions
      console.warn('Analytics tracking failed:', error);
    }
  }

  /**
   * Track a page view
   */
  async page(pageName: string, properties: Record<string, any> = {}): Promise<void> {
    return this.track(ANALYTICS_EVENTS.PAGE_VIEW, {
      page_name: pageName,
      ...properties,
    });
  }

  /**
   * Identify a user (called after login)
   */
  async identify(userId: string, traits: Record<string, any> = {}): Promise<void> {
    // Store user traits if needed
    try {
      // For now, just track an identify event
      await this.track('user_identified', {
        user_id: userId,
        ...traits,
      });
    } catch (error) {
      console.warn('Analytics identify failed:', error);
    }
  }

  /**
   * Flush queued events to Supabase
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    const eventsToSend = [...this.queue];
    this.queue = [];
    this.saveQueueToStorage();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const events: Omit<AnalyticsEvent, 'id' | 'created_at'>[] = eventsToSend.map(event => ({
        event_name: event.event_name,
        user_id: user?.id,
        session_id: this.sessionId,
        properties: event.properties,
      }));

      const { error } = await supabase
        .from('analytics_events')
        .insert(events);

      if (error) {
        // If insert fails, add events back to queue
        this.queue.unshift(...eventsToSend);
        this.saveQueueToStorage();
        console.warn('Failed to flush analytics events:', error);
      }
    } catch (error) {
      // If flush fails, add events back to queue
      this.queue.unshift(...eventsToSend);
      this.saveQueueToStorage();
      console.warn('Failed to flush analytics events:', error);
    }
  }

  /**
   * Get pending event count
   */
  getPendingCount(): number {
    return this.queue.length;
  }

  /**
   * Clear all queued events
   */
  clearQueue(): void {
    this.queue = [];
    this.saveQueueToStorage();
  }

  /**
   * Cleanup (call when unmounting)
   */
  destroy(): void {
    this.stopAutoFlush();
    this.flush();
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export for testing
export { Analytics };
