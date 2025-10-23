
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { CountryProvider } from "@/contexts/CountryContext";
import { LoadingSpinnerEnhanced } from "./components/LoadingSpinnerEnhanced";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { isLowEndDevice } from "./utils/lazyLoading";
import { SessionManager } from "./components/SessionManager";

// Eager load critical routes (home, auth)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load all other routes for code splitting
const Animals = lazy(() => import("./pages/Animals"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Profile = lazy(() => import("./pages/Profile"));
const SystemAnalysis = lazy(() => import("./pages/SystemAnalysis"));
const MyListings = lazy(() => import("./pages/MyListings"));
const Favorites = lazy(() => import("./pages/Favorites"));
const InterestInbox = lazy(() => import("./pages/InterestInbox"));
const SellerAnalytics = lazy(() => import("./pages/SellerAnalytics"));

// Phase 3: Lazy load paginated pages
const HealthRecords = lazy(() => import("./pages/HealthRecords"));
const MilkProductionRecords = lazy(() => import("./pages/MilkProductionRecords"));
const PublicMarketplaceEnhanced = lazy(() => import("./pages/PublicMarketplaceEnhanced"));
const SyncStatus = lazy(() => import("./pages/SyncStatus").then(module => ({ default: module.SyncStatus })));

const queryClient = new QueryClient();

// Require authentication for protected routes
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    try {
      localStorage.setItem(
        'postLoginAction',
        JSON.stringify({ type: 'openMarketplace', timestamp: Date.now() })
      );
    } catch {}
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [language, setLanguage] = useState('en');
  
  useEffect(() => {
    // Get language from localStorage or default to English
    const storedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(storedLanguage);
    
    // Check device capabilities
    setIsLowEnd(isLowEndDevice());
    
    // Add event listener for online/offline status
    const handleConnectionChange = () => {
      // Force re-render when connection status changes
      setIsLowEnd(isLowEndDevice());
    };
    
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CountryProvider>
          <LanguageProvider>
            <CalendarProvider>
              <TooltipProvider>
            <Toaster />
            <Sonner />
            <SessionManager />
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <LoadingSpinnerEnhanced 
                  size={isLowEnd ? "sm" : "lg"} 
                  text={language === 'am' ? "እባክዎ ይጠብቁ..." : "Loading..."} 
                />
              </div>
            }>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/animals" element={<Animals />} />
                  
                  {/* Redirect old /market to single canonical marketplace route */}
                  <Route path="/market" element={<Navigate to="/marketplace" replace />} />
                  
                  {/* Phase 3: New Paginated Marketplace (Enhanced) */}
                  <Route 
                    path="/marketplace" 
                    element={
                      <RequireAuth>
                        <PublicMarketplaceEnhanced />
                      </RequireAuth>
                    } 
                  />
                  
                  <Route path="/my-listings" element={<MyListings />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/interest-inbox" element={<InterestInbox />} />
                  <Route path="/seller-analytics" element={<SellerAnalytics />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Phase 3: Paginated Milk Production */}
                  <Route path="/milk" element={<MilkProductionRecords />} />
                  
                  {/* Phase 3: New Paginated Health Records */}
                  <Route path="/health" element={<HealthRecords />} />
                  {/* Redirect legacy medical route to health */}
                  <Route path="/medical" element={<Navigate to="/health" replace />} />
                  
                  {/* Sync Status Page */}
                  <Route path="/sync-status" element={<SyncStatus />} />
                  
                  <Route path="/analysis" element={<SystemAnalysis />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </Suspense>
            {/* Performance monitoring in development or with debug flag */}
            {(process.env.NODE_ENV === 'development' || localStorage.getItem('debug') === 'true') && (
              <PerformanceMonitor language={language} />
            )}
            </TooltipProvider>
            </CalendarProvider>
          </LanguageProvider>
        </CountryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
