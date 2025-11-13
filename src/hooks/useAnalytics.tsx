// src/hooks/useAnalytics.tsx - Hook for fetching and analyzing analytics data

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';

interface AnalyticsEvent {
  id: string;
  event_name: string;
  user_id: string;
  properties: Record<string, any>;
  created_at: string;
}

interface EventCount {
  event_name: string;
  count: number;
  percentage: number;
}

interface AnalyticsSummary {
  totalEvents: number;
  events24h: number;
  events7d: number;
  topActions: EventCount[];
  animalRegistrations: number;
  milkRecordings: number;
  listingsCreated: number;
  interestsExpressed: number;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const { data: events, isLoading, error } = useQuery<AnalyticsEvent[]>({
    queryKey: ['analytics-events', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as any[]) || [];
    },
    enabled: !!user,
  });

  // Calculate analytics summary
  const summary: AnalyticsSummary = {
    totalEvents: 0,
    events24h: 0,
    events7d: 0,
    topActions: [],
    animalRegistrations: 0,
    milkRecordings: 0,
    listingsCreated: 0,
    interestsExpressed: 0,
  };

  if (events && events.length > 0) {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count events by time period
    summary.totalEvents = events.length;
    summary.events24h = events.filter(e => new Date(e.created_at) > oneDayAgo).length;
    summary.events7d = events.filter(e => new Date(e.created_at) > sevenDaysAgo).length;

    // Count by event type
    const eventCounts: Record<string, number> = {};
    events.forEach(event => {
      eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1;

      // Count specific events
      if (event.event_name === 'animal_registered') summary.animalRegistrations++;
      if (event.event_name === 'milk_recorded') summary.milkRecordings++;
      if (event.event_name === 'listing_created') summary.listingsCreated++;
      if (event.event_name === 'interest_expressed') summary.interestsExpressed++;
    });

    // Calculate top 5 actions
    summary.topActions = Object.entries(eventCounts)
      .map(([event_name, count]) => ({
        event_name,
        count,
        percentage: (count / summary.totalEvents) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  return {
    events,
    summary,
    isLoading,
    error,
  };
};
