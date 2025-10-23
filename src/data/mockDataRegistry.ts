/**
 * Registry of all mock data usage in the application
 * Used to track migration from mock to real data
 */

export interface MockDataLocation {
    id: string;
    file: string;
    component: string;
    dataType: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    userImpact: 'high' | 'medium' | 'low';
    replacementHook?: string;
    estimatedEffort: string;
    status: 'identified' | 'in-progress' | 'completed';
    notes?: string;
}

export const MOCK_DATA_REGISTRY: MockDataLocation[] = [
    {
        id: 'mock-marketplace-data',
        file: 'src/data/mockMarketplaceData.ts',
        component: 'Various marketplace components',
        dataType: 'Marketplace Listings',
        description: 'Mock marketplace data file - no longer used',
        priority: 'low',
        userImpact: 'low',
        replacementHook: 'useSecurePublicMarketplace',
        estimatedEffort: '0 days',
        status: 'completed',
        notes: 'Public marketplace now uses real data. This file can be deleted.'
    },
    {
        id: 'analytics-charts',
        file: 'src/pages/Analytics.tsx',
        component: 'Analytics',
        dataType: 'Analytics Data',
        description: 'All analytics charts use hardcoded data',
        priority: 'high',
        userImpact: 'high',
        replacementHook: 'useAnalytics',
        estimatedEffort: '3 days',
        status: 'identified',
        notes: 'Hook exists but not connected to UI. Need to integrate real data from all tables.'
    },
    {
        id: 'notifications-list',
        file: 'src/components/SmartNotificationSystem.tsx',
        component: 'SmartNotificationSystem',
        dataType: 'Notifications',
        description: 'Hardcoded notification list',
        priority: 'medium',
        userImpact: 'medium',
        replacementHook: 'useNotifications',
        estimatedEffort: '2 days',
        status: 'identified',
        notes: 'Hook exists. Need to add notification triggers for events.'
    },
    {
        id: 'health-records-display',
        file: 'src/pages/Medical.tsx',
        component: 'Medical',
        dataType: 'Health Records',
        description: 'Some health data displays use mock data',
        priority: 'medium',
        userImpact: 'medium',
        replacementHook: 'useHealthRecords',
        estimatedEffort: '2 days',
        status: 'identified',
        notes: 'Recording works, but display components show mock data.'
    },
    {
        id: 'vaccination-schedules',
        file: 'src/components/HealthReminderSystem.tsx',
        component: 'HealthReminderSystem',
        dataType: 'Vaccination Schedules',
        description: 'Vaccination schedule reminders use hardcoded data',
        priority: 'high',
        userImpact: 'high',
        replacementHook: 'useVaccinationSchedules',
        estimatedEffort: '3 days',
        status: 'identified',
        notes: 'Database table exists with preloaded schedules. Need to fetch and display.'
    },
    {
        id: 'dashboard-recent-activity',
        file: 'src/components/RecentActivity.tsx',
        component: 'RecentActivity',
        dataType: 'Recent Activity Feed',
        description: 'Recent activity feed shows hardcoded activities',
        priority: 'medium',
        userImpact: 'medium',
        replacementHook: 'useDashboardStats',
        estimatedEffort: '1 day',
        status: 'identified',
        notes: 'Hook exists. Need to fetch recent activities from multiple tables.'
    },
    {
        id: 'community-forum',
        file: 'src/components/CommunityForumPreview.tsx',
        component: 'CommunityForumPreview',
        dataType: 'Forum Posts',
        description: 'Community forum preview shows placeholder data',
        priority: 'low',
        userImpact: 'low',
        replacementHook: 'N/A',
        estimatedEffort: '10 days',
        status: 'identified',
        notes: 'Feature not implemented. Needs full forum database structure.'
    },
    {
        id: 'agricultural-insights',
        file: 'src/components/EthiopianAgriculturalInsights.tsx',
        component: 'EthiopianAgriculturalInsights',
        dataType: 'Agricultural Tips',
        description: 'Agricultural insights show hardcoded tips',
        priority: 'low',
        userImpact: 'low',
        replacementHook: 'N/A',
        estimatedEffort: '5 days',
        status: 'identified',
        notes: 'Could integrate with AI assistant or content management system.'
    },
    {
        id: 'weather-data',
        file: 'src/components/HomeScreen.tsx',
        component: 'HomeScreen (Weather Card)',
        dataType: 'Weather Information',
        description: 'Weather card shows placeholder data',
        priority: 'low',
        userImpact: 'medium',
        replacementHook: 'N/A',
        estimatedEffort: '2 days',
        status: 'identified',
        notes: 'Need to integrate weather API (OpenWeatherMap or similar).'
    },
];

// Helper functions
export const getMockDataByPriority = (priority: 'high' | 'medium' | 'low') => {
    return MOCK_DATA_REGISTRY.filter(item => item.priority === priority);
};

export const getMockDataByStatus = (status: MockDataLocation['status']) => {
    return MOCK_DATA_REGISTRY.filter(item => item.status === status);
};

export const getHighPriorityMockData = () => {
    return MOCK_DATA_REGISTRY.filter(
        item => item.priority === 'high' && item.status !== 'completed'
    );
};

export const getMockDataStats = () => {
    const total = MOCK_DATA_REGISTRY.length;
    const completed = MOCK_DATA_REGISTRY.filter(item => item.status === 'completed').length;
    const inProgress = MOCK_DATA_REGISTRY.filter(item => item.status === 'in-progress').length;
    const identified = MOCK_DATA_REGISTRY.filter(item => item.status === 'identified').length;

    const highPriority = MOCK_DATA_REGISTRY.filter(item => item.priority === 'high').length;
    const mediumPriority = MOCK_DATA_REGISTRY.filter(item => item.priority === 'medium').length;
    const lowPriority = MOCK_DATA_REGISTRY.filter(item => item.priority === 'low').length;

    return {
        total,
        completed,
        inProgress,
        identified,
        highPriority,
        mediumPriority,
        lowPriority,
        completionPercentage: Math.round((completed / total) * 100),
    };
};
