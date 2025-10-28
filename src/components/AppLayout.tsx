// src/components/AppLayout.tsx - Main app layout with navigation

import { useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNavigation } from './BottomNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  
  // Don't show navigation on login/onboarding pages
  const hideNavigation = ['/login', '/onboarding'].includes(location.pathname);
  
  if (hideNavigation) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen">
      {/* Top bar with language toggle */}
      <TopBar />
      
      {/* Main content with padding for top and bottom bars */}
      <div className="pt-14 pb-20">
        {children}
      </div>
      
      {/* Bottom navigation */}
      <BottomNavigation />
    </div>
  );
};
