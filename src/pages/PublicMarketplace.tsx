
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { LanguageSelector } from '@/components/LanguageSelector';
import BottomNavigation from '@/components/BottomNavigation';
import { ProfessionalMarketplace } from '@/components/ProfessionalMarketplace';

const PublicMarketplace = () => {
  const { language } = useLanguage();
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 pb-16 sm:pb-20 lg:pb-24">
      {/* Header with Language Selector */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-emerald-800">{t('marketplace.title')}</h1>
            <p className="text-sm text-emerald-600">{t('marketplace.subtitle')}</p>
          </div>
          <LanguageSelector />
        </div>
      </div>
      
      <ProfessionalMarketplace />
      <BottomNavigation language={language} />
    </div>
  );
};

export default PublicMarketplace;
