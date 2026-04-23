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

  useEffect(() => {
    navigate('/auth', { replace: true });
  }, [navigate]);

  return (
    <main
      role="main"
      className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4"
    >
      <div className="text-center">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </main>
  );
};

export default LoginMVP;
