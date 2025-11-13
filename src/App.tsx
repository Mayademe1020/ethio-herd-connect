import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Contexts
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { DemoModeProvider } from '@/contexts/DemoModeContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { ToastProvider } from '@/contexts/ToastContext';

// Components
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import LoginMVP from '@/pages/LoginMVP';
import RegisterAnimal from '@/pages/RegisterAnimal';
import MyAnimals from '@/pages/MyAnimals';
import AnimalDetail from '@/pages/AnimalDetail';
import RecordMilk from '@/pages/RecordMilk';
import MilkProductionRecords from '@/pages/MilkProductionRecords';
import MarketplaceBrowse from '@/pages/MarketplaceBrowse';
import CreateListing from '@/pages/CreateListing';
import MyListings from '@/pages/MyListings';
import ListingDetail from '@/pages/ListingDetail';
import InterestInbox from '@/pages/InterestInbox';
import Profile from '@/pages/Profile';
import Onboarding from '@/pages/Onboarding';
import SimpleHome from '@/pages/SimpleHome';
import SyncStatus from '@/pages/SyncStatus';
import MilkAnalytics from '@/pages/MilkAnalytics';
import MilkSummary from '@/pages/MilkSummary';
import Favorites from '@/pages/Favorites';
import PublicMarketplaceEnhanced from '@/pages/PublicMarketplaceEnhanced';
import FeedRationing from '@/pages/FeedRationing';

// Admin Pages
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <DemoModeProvider>
          <LanguageProvider>
            <CalendarProvider>
              <AuthProvider>
                <AdminProvider>
                  <ToastProvider>
                    <div className="App">
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

                        {/* Feed Management */}
                        <Route path="/feed" element={
                          <ProtectedRoute>
                            <AppLayout>
                              <FeedRationing />
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
                    </div>
                    <Toaster position="top-right" />
                  </ToastProvider>
                </AdminProvider>
              </AuthProvider>
            </CalendarProvider>
          </LanguageProvider>
        </DemoModeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
