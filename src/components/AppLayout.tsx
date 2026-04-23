// src/components/AppLayout.tsx - Main app layout with navigation

import { useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNavigation } from './BottomNavigation';
import { FeedbackWidget } from './FeedbackWidget';
import { OfflineBanner, OnlineIndicator } from './OfflineBanner';
import { useScreenTracking } from '@/hooks/useScreenTracking';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();

  // Track screen views
  useScreenTracking();

  // Don't show navigation on login/onboarding pages
  const hideNavigation = ['/login', '/onboarding'].includes(location.pathname);
  
  if (hideNavigation) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen">
      {/* Offline indicator */}
      {!hideNavigation && <OfflineBanner />}
      
      {/* Online indicator */}
      {!hideNavigation && <OnlineIndicator />}
      
      {/* Top bar with language toggle */}
      <TopBar />
      
      {/* Main content with padding for top and bottom bars */}
      <div className={cn("pb-20", !hideNavigation && "pt-14")}>
        {children}
      </div>
      
      {/* Bottom navigation */}
      <BottomNavigation />
      
      {/* Feedback widget - only show on authenticated pages */}
      {!hideNavigation && <FeedbackWidget />}
    </div>
  );
};
