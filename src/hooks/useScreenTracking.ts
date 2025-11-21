import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '@/services/analyticsService';

export const useScreenTracking = () => {
  const location = useLocation();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;

    // Track screen view
    analyticsService.trackScreenView(
      currentPath,
      previousPathRef.current || undefined
    );

    // Update previous path
    previousPathRef.current = currentPath;
  }, [location.pathname]);
};