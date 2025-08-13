
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useViewTracking = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem('marketplace_session_id');
    if (!storedSessionId) {
      storedSessionId = crypto.randomUUID();
      localStorage.setItem('marketplace_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);

    // Get current view count for this session
    getViewCount(storedSessionId);
  }, []);

  const getViewCount = async (sessionId: string) => {
    try {
      const { count } = await supabase
        .from('listing_views')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId);
      
      setViewCount(count || 0);
    } catch (error) {
      console.error('Error getting view count:', error);
    }
  };

  const trackView = async (listingId: string) => {
    if (!sessionId) return;

    try {
      await supabase
        .from('listing_views')
        .insert({
          session_id: sessionId,
          listing_id: listingId,
          ip_address: null, // Could be populated server-side
          user_agent: navigator.userAgent
        });

      setViewCount(prev => prev + 1);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const shouldShowAuthGate = () => {
    return viewCount >= 3; // Show after 3 views
  };

  return {
    trackView,
    viewCount,
    shouldShowAuthGate,
    sessionId
  };
};
