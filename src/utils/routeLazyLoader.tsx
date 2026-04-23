/**
 * Route-based lazy loading configuration
 * Optimized for Ethiopian farmers with low-bandwidth and basic smartphones
 */

import React, { lazy, Suspense, ReactNode } from 'react';
import { LoadingSpinnerEnhanced } from '@/components/LoadingSpinnerEnhanced';

// Lazy load heavy pages for better initial load time
// These pages are not needed immediately on app start

export const LazyMarketplaceBrowse = lazy(() => 
  import('@/pages/MarketplaceBrowse')
);

export const LazyAnalyticsDashboard = lazy(() => 
  import('@/pages/AnalyticsDashboard')
);

export const LazyMilkAnalytics = lazy(() => 
  import('@/pages/MilkAnalytics')
);

export const LazyMilkSummary = lazy(() => 
  import('@/pages/MilkSummary')
);

export const LazyAdminDashboard = lazy(() => 
  import('@/pages/AdminDashboard')
);

export const LazyPublicMarketplace = lazy(() => 
  import('@/pages/PublicMarketplaceEnhanced')
);

export const LazyFeedRationing = lazy(() => 
  import('@/pages/FeedRationing')
);

export const LazyMuzzleScanPage = lazy(() => 
  import('@/pages/MuzzleScanPage')
);

export const LazyIdentifyAnimalPage = lazy(() => 
  import('@/pages/IdentifyAnimalPage')
);

// Wrapper component for lazy loaded routes with proper fallback
interface LazyRouteWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const LazyRouteWrapper: React.FC<LazyRouteWrapperProps> = ({ 
  children, 
  fallback 
}) => {
  return (
    <Suspense fallback={fallback || <LoadingSpinnerEnhanced text="Loading..." />}>
      {children}
    </Suspense>
  );
};

// Simple loading fallback component
export const RouteLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <LoadingSpinnerEnhanced text="Loading..." />
  </div>
);

// Preload functions for prefetching on hover
type RouteName = 'marketplace' | 'analytics' | 'milkAnalytics' | 'milkSummary' | 
                 'admin' | 'publicMarketplace' | 'feedRationing' | 'muzzleScan' | 'identifyAnimal';

const routePreloadMap: Record<RouteName, () => Promise<unknown>> = {
  marketplace: () => import('@/pages/MarketplaceBrowse'),
  analytics: () => import('@/pages/AnalyticsDashboard'),
  milkAnalytics: () => import('@/pages/MilkAnalytics'),
  milkSummary: () => import('@/pages/MilkSummary'),
  admin: () => import('@/pages/AdminDashboard'),
  publicMarketplace: () => import('@/pages/PublicMarketplaceEnhanced'),
  feedRationing: () => import('@/pages/FeedRationing'),
  muzzleScan: () => import('@/pages/MuzzleScanPage'),
  identifyAnimal: () => import('@/pages/IdentifyAnimalPage'),
};

export const preloadRoute = (routeName: RouteName): void => {
  routePreloadMap[routeName]?.();
};
