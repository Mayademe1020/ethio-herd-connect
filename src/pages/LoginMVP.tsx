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
    <main
      role="main"
      className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Brand hero for larger screens (hidden on mobile for performance) */}
          <section className="hidden lg:block" aria-label="Brand introduction">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-md">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-3xl" aria-hidden="true">🐄</span>
                </div>
                <div className="text-3xl" aria-label="Ethiopian flag">🇪🇹</div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight mb-3">
                {t('home.welcome')}
              </h1>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ethio Herd Connect
              </p>
              <ul className="text-gray-700 space-y-2 list-disc pl-6">
                <li>Designed for basic smartphones first; optimized for small screens</li>
                <li>Bilingual labels (Amharic/English) with clear, simple wording</li>
                <li>Low-bandwidth friendly: efficient caching and minimal transfers</li>
              </ul>
              <div className="mt-6">
                <img
                  src="/placeholder.svg"
                  alt="Livestock iconography"
                  loading="lazy"
                  className="w-full max-w-md rounded-xl border border-gray-200"
                />
              </div>
            </div>
          </section>

          {/* Right: Login card */}
          <section aria-label="Login" className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Header */}
              <div className="text-center space-y-2 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-4xl" aria-hidden="true">🐄</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {t('home.welcome')}
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">Ethio Herd Connect</p>
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
              <p className="leading-relaxed">
                ✓ Works offline • ✓ Amharic support • ✓ Free to use
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LoginMVP;
