// src/components/HomeScreenSimple.tsx
// Optimized Home Screen for Ethiopian farmers
// WCAG 2.1 Accessible & Responsive

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { EthiopianStatsOverview } from '@/components/EthiopianStatsOverview';
import { Milk, Store, TrendingUp, Wifi, WifiOff, Users, ChevronRight, MoreVertical, User } from 'lucide-react';

interface QuickStats {
  totalAnimals: number;
  milkThisWeek: number;
  activeListings: number;
  healthyAnimals: number;
  weeklyRevenue: number;
  vaccinationRate: number;
  cattleCount: number;
  goatCount: number;
  sheepCount: number;
  marketPrice: number;
}

export const HomeScreenSimple = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslations();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [stats] = React.useState<QuickStats>({
    totalAnimals: 0,
    milkThisWeek: 0,
    activeListings: 0,
    healthyAnimals: 0,
    weeklyRevenue: 0,
    vaccinationRate: 0,
    cattleCount: 0,
    goatCount: 0,
    sheepCount: 0,
    marketPrice: 0,
  });

  const hasStats = stats.totalAnimals > 0 || stats.weeklyRevenue > 0 || stats.cattleCount > 0;

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const statsForEthiopianOverview = {
    totalAnimals: stats.totalAnimals,
    healthyAnimals: stats.healthyAnimals || stats.totalAnimals,
    weeklyRevenue: stats.weeklyRevenue,
    pendingTasks: 0,
    growthRate: 0,
    vaccinationRate: stats.vaccinationRate,
    sickAnimals: 0,
    upcomingVaccinations: 0,
    cattleCount: stats.cattleCount,
    goatCount: stats.goatCount,
    sheepCount: stats.sheepCount,
    marketPrice: stats.marketPrice,
  };

  const mainActions = [
    {
      id: 'record-milk',
      title: t('home.recordMilk'),
      subtitle: t('home.recordMilkGuide'),
      emoji: '🥛',
      color: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300',
      onClick: () => navigate('/record-milk'),
      ariaLabel: `${t('home.recordMilk')}: ${t('home.recordMilkGuide')}`,
    },
    {
      id: 'my-animals',
      title: t('home.myAnimals'),
      subtitle: t('home.myAnimalsGuide'),
      emoji: '🐄',
      color: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-300',
      onClick: () => navigate('/animals'),
      ariaLabel: `${t('home.myAnimals')}: ${t('home.myAnimalsGuide')}`,
    },
  ];

  const secondaryActions = [
    {
      id: 'add-animal',
      title: t('home.addAnimal'),
      subtitle: t('home.addAnimalGuide'),
      emoji: '➕',
      color: 'bg-green-500 hover:bg-green-600 focus:ring-green-300',
      onClick: () => navigate('/register-animal'),
      ariaLabel: `${t('home.addAnimal')}: ${t('home.addAnimalGuide')}`,
    },
    {
      id: 'marketplace',
      title: t('home.marketplace'),
      subtitle: t('home.marketplaceGuide'),
      emoji: '🏪',
      color: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-300',
      onClick: () => navigate('/marketplace'),
      ariaLabel: `${t('home.marketplace')}: ${t('home.marketplaceGuide')}`,
    },
    {
      id: 'profile',
      title: t('profile.title') || 'Profile',
      subtitle: 'Settings & Account',
      emoji: '👤',
      color: 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-300',
      onClick: () => navigate('/profile'),
      ariaLabel: 'Profile and Settings',
    },
  ];

  const userName = user?.phone?.slice(-4) || 'Farmer';

  return (
    <main 
      className="min-h-screen bg-gray-50 pb-24 md:pb-6"
      role="main"
      aria-label="EthioHerd Connect Home"
    >
      {/* Offline Banner - Only shows when offline */}
      {!isOnline && (
        <div 
          className="bg-red-600 text-white px-4 py-3 flex items-center justify-center gap-2" 
          role="alert"
          aria-live="assertive"
        >
          <WifiOff className="w-5 h-5" aria-hidden="true" />
          <span className="font-bold text-sm">
            ⚠️ ኢንተርኔት የለም / No Internet
          </span>
        </div>
      )}

      {/* Responsive Container */}
      <div className="max-w-4xl mx-auto">
        {/* Header with Profile Access */}
        <header 
          className="bg-white px-4 py-4 shadow-sm"
          role="banner"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                {t('home.greeting').replace('{{name}}', userName)}
              </h1>
              <p className="text-gray-600 text-sm mt-0.5 truncate">
                {t('home.whatToDo')}
              </p>
            </div>
            
            {/* Profile & Status */}
            <div className="flex items-center gap-3 ml-3">
              {/* Online Status */}
              <div 
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                  isOnline ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                }`}
                role="status"
                aria-live="polite"
                aria-label={isOnline ? t('home.online') : t('home.offline')}
              >
                {isOnline ? (
                  <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span className="sr-only">{isOnline ? t('home.online') : t('home.offline')}</span>
                <span aria-hidden="true" className="hidden sm:inline">
                  {isOnline ? t('home.online') : t('home.offline')}
                </span>
              </div>

              {/* Profile Button */}
              <button
                onClick={() => navigate('/profile')}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Go to Profile"
              >
                <User className="w-5 h-5 text-gray-700" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        {/* Stats Section - Shows data when available, empty state when not */}
        <section 
          className="px-4 py-3 bg-white mx-4 mt-3 rounded-xl shadow-sm"
          aria-labelledby="stats-heading"
        >
          {hasStats ? (
            <>
              <h2 
                id="stats-heading" 
                className="text-sm font-semibold text-gray-700 mb-2"
              >
                {t('home.quickStats')}
              </h2>
              <EthiopianStatsOverview language={language} stats={statsForEthiopianOverview} />
            </>
          ) : (
            <div className="py-6 text-center">
              <div className="text-5xl mb-3">🐄</div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {t('home.welcome')}
              </h2>
              <p className="text-gray-600 mb-4 text-sm">
                Add your first animal to track your livestock
              </p>
              <button
                onClick={() => navigate('/register-animal')}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <span>➕</span>
                Add Animal / እንስስ ጨምር
              </button>
            </div>
          )}
        </section>

        {/* Main Actions - 2 Primary Buttons */}
        <section 
          className="px-4 py-4"
          aria-labelledby="main-actions-heading"
        >
          <h2 
            id="main-actions-heading" 
            className="sr-only"
          >
            {t('home.quickActions')}
          </h2>
          <div className="grid grid-cols-2 gap-3" role="group">
            {mainActions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`${action.color} text-white rounded-2xl p-5 shadow-md transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-opacity-50 flex flex-col items-center justify-center min-h-[100px]`}
                aria-label={action.ariaLabel}
              >
                <div className="text-4xl mb-2" aria-hidden="true">
                  {action.emoji}
                </div>
                <h3 className="text-base font-bold text-center">{action.title}</h3>
                <ChevronRight className="w-4 h-4 mt-1 text-white/70" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>

        {/* Secondary Actions - More Options */}
        <section 
          className="px-4 pb-4"
          aria-labelledby="more-actions-heading"
        >
          <h2 
            id="more-actions-heading" 
            className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"
          >
            <MoreVertical className="w-4 h-4" aria-hidden="true" />
            <span>More</span>
          </h2>
          <div className="space-y-2" role="group">
            {secondaryActions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-sm transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-3"
                aria-label={action.ariaLabel}
              >
                <div 
                  className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg"
                  aria-hidden="true"
                >
                  {action.emoji}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{action.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{action.subtitle}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>

        {/* Sync Status - Minimal Footer */}
        <footer 
          className="px-4 py-3"
          role="contentinfo"
        >
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div 
              className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
              aria-hidden="true"
            ></div>
            <span>
              {isOnline ? t('home.allSynced') : t('home.offline')}
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default HomeScreenSimple;
