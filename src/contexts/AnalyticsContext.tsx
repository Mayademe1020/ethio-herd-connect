import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { AnalyticsConfig, AnalyticsMetrics } from '@/types/analytics';
import { analyticsService } from '@/services/analyticsService';

interface AnalyticsContextType {
  trackScreenView: (screenName: string, previousScreen?: string) => Promise<void>;
  trackUserAction: (
    action: string,
    category: string,
    label?: string,
    value?: number,
    element?: string,
    page?: string
  ) => Promise<void>;
  getAnalyticsMetrics: (
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ) => Promise<AnalyticsMetrics>;
  updateConfig: (config: Partial<AnalyticsConfig>) => void;
  getSessionId: () => string;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  config?: Partial<AnalyticsConfig>;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  config
}) => {
  useEffect(() => {
    // Update config if provided
    if (config) {
      analyticsService.updateConfig(config);
    }
  }, [config]);

  const value: AnalyticsContextType = {
    trackScreenView: analyticsService.trackScreenView.bind(analyticsService),
    trackUserAction: analyticsService.trackUserAction.bind(analyticsService),
    getAnalyticsMetrics: analyticsService.getAnalyticsMetrics.bind(analyticsService),
    updateConfig: analyticsService.updateConfig.bind(analyticsService),
    getSessionId: analyticsService.getSessionId.bind(analyticsService),
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};