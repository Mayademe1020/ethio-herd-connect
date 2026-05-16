// src/pages/LoginMVP.tsx - Simplified MVP Login Page

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useTranslation } from '@/hooks/useTranslation';

const LoginMVP = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      console.log('User logged in, navigating to home...', user.id);
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    }
  }, [user, navigate]);

  // If no user, redirect to home - ProtectedRoute will handle showing login
  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <main
      role="main"
      className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">እባክዎ ይጠብቁ... / Loading...</p>
      </div>
    </main>
  );
};

export default LoginMVP;