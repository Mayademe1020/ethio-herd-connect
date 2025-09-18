import React from 'react';
import { HomeScreen } from '@/components/HomeScreen';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Show public marketplace option for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4">
        <div className="container-narrow text-center space-y-responsive py-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">EthioHerd Connect</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Professional livestock marketplace and management platform designed for Ethiopian farmers
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
            <Button onClick={() => navigate('/market')} size="lg" className="bg-primary hover:bg-primary/90 py-3 px-6">
              Browse Marketplace
            </Button>
            <Button onClick={() => navigate('/auth')} variant="outline" size="lg" className="py-3 px-6">
              Login / Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Return the new HomeScreen component for authenticated users
  return <HomeScreen />;
};
export default Index;