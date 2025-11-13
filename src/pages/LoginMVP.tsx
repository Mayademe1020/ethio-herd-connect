// src/pages/LoginMVP.tsx - Simplified MVP Login Page

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { OtpAuthForm } from '@/components/OtpAuthForm';
import { useTranslation } from '@/hooks/useTranslation';

const LoginMVP = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Redirect to home if already logged in
    if (user) {
      console.log('User logged in, navigating to home...', user.id);
      // Small delay to ensure auth state is fully settled
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header with Ethiopian Flag and Welcome Text */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">🐄</span>
            </div>
            <div className="mb-2">
              <span className="text-4xl">🇪🇹</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t('home.welcome')}
            </h1>
            <p className="text-gray-600 text-lg">
              Ethio Herd Connect
            </p>
          </div>

          {/* OTP Auth Form */}
          <OtpAuthForm />

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Made for Ethiopian farmers 🌾</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            ✓ Works offline • ✓ Amharic support • ✓ Free to use
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginMVP;
