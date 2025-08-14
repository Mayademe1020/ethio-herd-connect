
import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Index from "@/pages/Index";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/Home"));
const Animals = lazy(() => import("@/pages/Animals"));
const Growth = lazy(() => import("@/pages/Growth"));
const Health = lazy(() => import("@/pages/Health"));
const Market = lazy(() => import("@/pages/Market"));
const PublicMarketplace = lazy(() => import("@/pages/PublicMarketplace"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const MilkProduction = lazy(() => import("@/pages/MilkProduction"));
const Profile = lazy(() => import("@/pages/Profile"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Auth = lazy(() => import("@/pages/Auth"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-pulse text-lg">Loading...</div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/animals" element={<Animals />} />
                    <Route path="/growth" element={<Growth />} />
                    <Route path="/health" element={<Health />} />
                    <Route path="/market" element={<Market />} />
                    <Route path="/marketplace" element={<PublicMarketplace />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/milk" element={<MilkProduction />} />
                    <Route path="/milk-production" element={<MilkProduction />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </Suspense>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
