/**
 * Centralized data source configuration
 * Tracks which features use mock vs real data
 */

interface FeatureDataSource {
  useMock: boolean;
  reason?: string;
  targetDate?: string;
  hook?: string;
}

interface DataSourceConfig {
  FEATURES: {
    [key: string]: FeatureDataSource;
  };
}

export const DATA_SOURCE: DataSourceConfig = {
  FEATURES: {
    DASHBOARD: {
      useMock: false,
      hook: 'useDashboardStats',
    },
    ANIMALS: {
      useMock: false,
      hook: 'useAnimalsDatabase',
    },
    GROWTH: {
      useMock: false,
      hook: 'useGrowthRecords',
    },
    MARKETPLACE: {
      useMock: false,
      hook: 'useSecurePublicMarketplace',
    },
    MILK_PRODUCTION: {
      useMock: false,
      hook: 'useMilkProduction',
    },
    ANALYTICS: {
      useMock: true,
      reason: 'Hook exists but not connected to UI',
      targetDate: '2025-02-01',
      hook: 'useAnalytics',
    },
    NOTIFICATIONS: {
      useMock: true,
      reason: 'Hook exists but needs trigger system',
      targetDate: '2025-02-15',
      hook: 'useNotifications',
    },
    HEALTH_RECORDS: {
      useMock: true,
      reason: 'Display components use mock data',
      targetDate: '2025-02-01',
    },
  },
};

export const getDataSource = (feature: string): FeatureDataSource => {
  return DATA_SOURCE.FEATURES[feature] || { useMock: false };
};

export const isUsingMockData = (feature: string): boolean => {
  return getDataSource(feature).useMock;
};
