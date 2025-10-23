import React from 'react';
import { HomeScreen } from '@/components/HomeScreen';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { OtpAuthForm } from '@/components/OtpAuthForm';
import { useNavigate } from 'react-router-dom';
import { useDateDisplay } from '@/hooks/useDateDisplay';
// Index page: update CTAs to reflect private marketplace access only
const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
        <div className="container-narrow text-center space-y-responsive py-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">EthioHerd Connect</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Professional livestock marketplace and management platform designed for Ethiopian farmers
          </p>
          <div className="max-w-md mx-auto">
            <OtpAuthForm showPasswordFallback onTogglePassword={() => navigate('/auth')} />
          </div>
        </div>
      </div>
    );
  }

  return <HomeScreen />;
};
export default Index;