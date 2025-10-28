// src/AppMVP.tsx - Simplified MVP Application

import { Suspense, lazy } from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProviderMVP } from "@/contexts/AuthContextMVP";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ToastProvider } from "@/contexts/ToastContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Eager load critical routes
import LoginMVP from "./pages/LoginMVP";
import Onboarding from "./pages/Onboarding";
import { AppLayout } from "./components/AppLayout";

// Lazy load other routes
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
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProviderMVP>
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
      </AuthProviderMVP>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default AppMVP;
