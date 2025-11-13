// src/AppMVP.tsx - Simplified MVP Application

import React, { Suspense, lazy } from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProviderMVP } from "@/contexts/AuthContextMVP";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ToastProvider } from "@/contexts/ToastContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { memoryMonitor } from "@/utils/memoryMonitor";
import { animationOptimizer } from "@/utils/animationOptimizer";
import { register as registerServiceWorker } from "@/utils/serviceWorker";

// Eager load critical routes
import LoginMVP from "./pages/LoginMVP";
import Onboarding from "./pages/Onboarding";
import { AppLayout } from "./components/AppLayout";

// Lazy load other routes with preloading for critical paths
const SimpleHome = lazy(() => import("./pages/SimpleHome").then(m => ({ default: m.default })));
const RegisterAnimal = lazy(() => import("./pages/RegisterAnimal").then(m => ({ default: m.default })));
const MyAnimals = lazy(() => import("./pages/MyAnimals").then(m => ({ default: m.default })));
const AnimalDetail = lazy(() => import("./pages/AnimalDetail").then(m => ({ default: m.AnimalDetail })));
const RecordMilk = lazy(() => import("./pages/RecordMilk").then(m => ({ default: m.default })));
const MarketplaceBrowse = lazy(() => import("./pages/MarketplaceBrowse").then(m => ({ default: m.default })));
const ListingDetail = lazy(() => import("./pages/ListingDetail").then(m => ({ default: m.default })));
const CreateListing = lazy(() => import("./pages/CreateListing").then(m => ({ default: m.default })));
const MyListings = lazy(() => import("./pages/MyListings").then(m => ({ default: m.default })));
const ProfilePage = lazy(() => import("./pages/Profile").then(m => ({ default: m.default })));

// Preload critical routes after initial load
const preloadCriticalRoutes = () => {
  // Preload frequently used routes after 2 seconds
  setTimeout(() => {
    import("./pages/RegisterAnimal");
    import("./pages/RecordMilk");
    import("./pages/MyAnimals");
  }, 2000);
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Loading fallback component - shows bilingual text since translations may not be loaded yet
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">እባክዎ ይጠብቁ... / Loading...</p>
    </div>
  </div>
);

function AppMVP() {
  // Preload critical routes and register service worker after initial render
  React.useEffect(() => {
    preloadCriticalRoutes();
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProviderMVP>
          <CalendarProvider>
            <DemoModeProvider>
              <ToastProvider>
                <BrowserRouter>
                  <Suspense fallback={<LoadingFallback />}>
                    <AppLayout>
                      <Routes>
                      {/* Public Routes */}
                      <Route path="/login" element={<LoginMVP />} />
                      <Route path="/onboarding" element={<Onboarding />} />

                      {/* Protected Routes */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <SimpleHome />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/register-animal"
                        element={
                          <ProtectedRoute>
                            <RegisterAnimal />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/my-animals"
                        element={
                          <ProtectedRoute>
                            <MyAnimals />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/animals/:id"
                        element={
                          <ProtectedRoute>
                            <AnimalDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/record-milk"
                        element={
                          <ProtectedRoute>
                            <RecordMilk />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/marketplace"
                        element={
                          <ProtectedRoute>
                            <MarketplaceBrowse />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/marketplace/:id"
                        element={
                          <ProtectedRoute>
                            <ListingDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/create-listing"
                        element={
                          <ProtectedRoute>
                            <CreateListing />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/my-listings"
                        element={
                          <ProtectedRoute>
                            <MyListings />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <ProfilePage />
                          </ProtectedRoute>
                        }
                      />
                      </Routes>
                    </AppLayout>
                  </Suspense>
                </BrowserRouter>
                <Sonner />
              </ToastProvider>
            </DemoModeProvider>
          </CalendarProvider>
        </AuthProviderMVP>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default AppMVP;
