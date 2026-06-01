import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useTranslation } from '@/hooks/useTranslation';

const LoginMVP = () => {
  const { user, loading, isLocalUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && user) {
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 100);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <main
        role="main"
        className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t.loading || 'Loading...'}</p>
        </div>
      </main>
    );
  }

  return null;
};

export default LoginMVP;
