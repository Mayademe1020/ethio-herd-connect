// src/components/ProtectedRoute.tsx - MVP Protected Route Wrapper

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useAdmin } from '@/contexts/AdminContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();

  // Show loading only while checking auth (not profile)
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">እባክዎ ይጠብቁ... / Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // If already on login page, don't redirect again
    if (location.pathname === '/login') {
      return <>{children}</>;
    }
    return <Navigate to="/login" replace />;
  }

  // For admin-only routes, check if user is admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Allow access to all authenticated routes without profile check
  return <>{children}</>;
};