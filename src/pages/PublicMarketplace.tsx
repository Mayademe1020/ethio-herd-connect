
import React from 'react';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { ProfessionalMarketplace } from '@/components/ProfessionalMarketplace';
import { useLanguage } from '@/contexts/LanguageContext';

const PublicMarketplace = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <ProfessionalMarketplace />
      <BottomNavigation language={language} />
    </div>
  );
};

export default PublicMarketplace;
