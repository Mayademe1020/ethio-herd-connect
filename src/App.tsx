import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Critical for offline-first: sync queue when back online
import { useBackgroundSync } from '@/hooks/useBackgroundSync';

// Contexts
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DemoModeProvider } from '@/contexts/DemoModeContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';

// Components
import { AppLayout } from '@/components/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/loading-skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy-loaded Pages - Critical Performance Fix
const Index = React.lazy(() => import('@/pages/Index'));
const Auth = React.lazy(() => import('@/pages/Auth'));
const LoginMVP = React.lazy(() => import('@/pages/LoginMVP'));
const RegisterAnimal = React.lazy(() => import('@/pages/RegisterAnimal'));
const MyAnimals = React.lazy(() => import('@/pages/MyAnimals'));
const AnimalDetail = React.lazy(() => import('@/pages/AnimalDetail'));
const RecordMilk = React.lazy(() => import('@/pages/RecordMilk'));
const MilkProductionRecords = React.lazy(() => import('@/pages/MilkProductionRecords'));
const MarketplaceBrowse = React.lazy(() => import('@/pages/MarketplaceBrowse'));
const CreateListing = React.lazy(() => import('@/pages/CreateListing'));
const MyListings = React.lazy(() => import('@/pages/MyListings'));
const ListingDetail = React.lazy(() => import('@/pages/ListingDetail'));
const InterestInbox = React.lazy(() => import('@/pages/InterestInbox'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Onboarding = React.lazy(() => import('@/pages/Onboarding'));
const SimpleHome = React.lazy(() => import('@/pages/SimpleHome'));
const SyncStatus = React.lazy(() => import('@/pages/SyncStatus'));
const MilkAnalytics = React.lazy(() => import('@/pages/MilkAnalytics'));
const MilkSummary = React.lazy(() => import('@/pages/MilkSummary'));
const Favorites = React.lazy(() => import('@/pages/Favorites'));
const PublicMarketplaceEnhanced = React.lazy(() => import('@/pages/PublicMarketplaceEnhanced'));
const AnalyticsDashboard = React.lazy(() => import('@/pages/AnalyticsDashboard'));
const IdentifyAnimalPage = React.lazy(() => import('@/pages/IdentifyAnimalPage'));

// Admin Pages
const AdminLogin = React.lazy(() => import('@/pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('@/pages/AdminDashboard'));

// Styles
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
);

function App() {
  // CRITICAL: Enable background sync for offline-first
  useBackgroundSync();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary level="global">
        <Router>
          <DemoModeProvider>
            <LanguageProvider>
              <CalendarProvider>
                <AuthProvider>
                  <AdminProvider>
                    <AnalyticsProvider>
                      <ToastProvider>
                        <div className="App">
                          <Suspense fallback={<PageLoader />}>
                            <Routes>
                            {/* Public Routes */}
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/login" element={<LoginMVP />} />
                            <Route path="/admin/login" element={<AdminLogin />} />
      
                            {/* Protected Routes */}
                            <Route path="/" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <Index />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
      
                            {/* Animal Management */}
                            <Route path="/animals" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <MyAnimals />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
                            <Route path="/animals/register" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <RegisterAnimal />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
                            <Route path="/animals/:id" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <AnimalDetail />
                                </AppLayout>
                              </ProtectedRoute>
                            } />

                            {/* Animal Identification */}
                            <Route path="/identify" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <IdentifyAnimalPage />
                                </AppLayout>
                              </ProtectedRoute>
                            } />

                            {/* Milk Recording */}
                            <Route path="/milk/record" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <RecordMilk />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
                            <Route path="/milk/records" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <MilkProductionRecords />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
                            <Route path="/milk/analytics" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <MilkAnalytics />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
                            <Route path="/milk/summary" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <MilkSummary />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
      
                            {/* Marketplace */}
                            <Route path="/marketplace" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <MarketplaceBrowse />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
                            <Route path="/marketplace/public" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <PublicMarketplaceEnhanced />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
                            <Route path="/marketplace/create" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <CreateListing />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
                            <Route path="/marketplace/listings" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <MyListings />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
                            <Route path="/marketplace/listings/:id" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <ListingDetail />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
                            <Route path="/marketplace/interests" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <InterestInbox />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
      
                            {/* User Profile & Settings */}
                            <Route path="/profile" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <Profile />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
                            <Route path="/favorites" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <Favorites />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
                            <Route path="/sync" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <SyncStatus />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
      
                            {/* Onboarding */}
                            <Route path="/onboarding" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <Onboarding />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
      
                            {/* Admin Routes */}
                            <Route path="/admin" element={
                              <ProtectedRoute adminOnly>
                                <AdminDashboard />
                              </ProtectedRoute>
                            } />
                            <Route path="/admin/analytics" element={
                              <ProtectedRoute adminOnly>
                                <AnalyticsDashboard />
                              </ProtectedRoute>
                            } />
      
                            {/* Legacy/Simple Routes */}
                            <Route path="/home" element={
                              <ProtectedRoute>
                                <AppLayout>
                                  <SimpleHome />
                                </AppLayout>
                              </ProtectedRoute>
                            } />
      
                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                          </Routes>
                        </Suspense>
                      </div>
                      <Toaster position="top-right" />
                      </ToastProvider>
                  </AnalyticsProvider>
                </AdminProvider>
                </AuthProvider>
              </CalendarProvider>
            </LanguageProvider>
          </DemoModeProvider>
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
