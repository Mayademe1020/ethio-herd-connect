
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { LoadingSpinnerEnhanced } from "./components/LoadingSpinnerEnhanced";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { isLowEndDevice } from "./utils/lazyLoading";
import { SessionManager } from "./components/SessionManager";

// Eager load critical routes (home, auth)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load all other routes for code splitting
const Profile = lazy(() => import("./pages/Profile"));
const MyListings = lazy(() => import("./pages/MyListings"));
const InterestInbox = lazy(() => import("./pages/InterestInbox"));
const MilkProductionRecords = lazy(() => import("./pages/MilkProductionRecords"));
const PublicMarketplaceEnhanced = lazy(() => import("./pages/PublicMarketplaceEnhanced"));

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

function App() {
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
        <LanguageProvider>
          <CalendarProvider>
            <TooltipProvider>
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <LoadingSpinnerEnhanced 
                    size={isLowEnd ? "sm" : "lg"} 
                    text={language === 'am' ? "እባክዎ ይጠብቁ..." : "Loading..."} 
                  />
                </div>
              }>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/animals" element={<RequireAuth><Animals /></RequireAuth>} />
                    <Route path="/milk" element={<RequireAuth><MilkProductionRecords /></RequireAuth>} />
                    <Route 
                      path="/marketplace" 
                      element={
                        <RequireAuth>
                          <PublicMarketplaceEnhanced />
                        </RequireAuth>
                      } 
                    />
                    <Route path="/my-listings" element={<RequireAuth><MyListings /></RequireAuth>} />
                    <Route path="/interest-inbox" element={<RequireAuth><InterestInbox /></RequireAuth>} />
                    <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </Suspense>
              {(process.env.NODE_ENV === 'development' || localStorage.getItem('debug') === 'true') && (
                <PerformanceMonitor language={language} />
              )}
            </TooltipProvider>
          </CalendarProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
