import { useCallback } from 'react';
import { analyticsService } from '@/services/analyticsService';

export const useAnalytics = () => {
  const trackAction = useCallback((
    action: string,
    category: string,
    label?: string,
    value?: number,
    element?: string
  ) => {
    analyticsService.trackUserAction(action, category, label, value, element);
  }, []);

  const trackButtonClick = useCallback((
    buttonName: string,
    category: string = 'button',
    value?: number
  ) => {
    trackAction('click', category, buttonName, value, 'button');
  }, [trackAction]);

  const trackFormSubmit = useCallback((
    formName: string,
    category: string = 'form'
  ) => {
    trackAction('submit', category, formName, undefined, 'form');
  }, [trackAction]);

  const trackNavigation = useCallback((
    destination: string,
    source?: string
  ) => {
    trackAction('navigate', 'navigation', destination, undefined, source);
  }, [trackAction]);

  const trackSearch = useCallback((
    searchTerm: string,
    category: string = 'search'
  ) => {
    trackAction('search', category, searchTerm);
  }, [trackAction]);

  const trackError = useCallback((
    errorType: string,
    errorMessage?: string
  ) => {
    trackAction('error', 'error', errorType, undefined, errorMessage);
  }, [trackAction]);

  return {
    trackAction,
    trackButtonClick,
    trackFormSubmit,
    trackNavigation,
    trackSearch,
    trackError,
  };
};