// src/components/ProtectedRoute.tsx - MVP Protected Route Wrapper

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useProfile } from '@/hooks/useProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { profile, isProfileComplete, isLoading: profileLoading, error, refetch } = useProfile();
  const location = useLocation();

  // Show loading while checking auth or profile
  if (authLoading || profileLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">እባክዎ ይጠብቁ... / Loading...</p>
        </div>
      </div>
    );
  }

  // Show error UI if profile fetch failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2 text-gray-900">
            መገለጫ መጫን አልተቻለም / Unable to Load Profile
          </h2>
          <p className="text-gray-600 mb-6">
            {error.message || 'An error occurred while loading your profile. Please try again.'}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            እንደገና ይሞክሩ / Try Again
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // For admin-only routes, check if user is admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if profile incomplete (except if already on onboarding page or admin routes)
  if (!isProfileComplete && location.pathname !== '/onboarding' && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
