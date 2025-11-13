// src/components/BottomNavigation.tsx - Bottom navigation bar

import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Beef, Store, Milk, User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { path: '/', icon: Home, label: t('home.welcome') },
    { path: '/my-animals', icon: Beef, label: t('animals.myAnimals') },
    { path: '/marketplace', icon: Store, label: t('marketplace.marketplace') },
    { path: '/feed', icon: Milk, label: t('feed.feed') || 'Feed' },
    { path: '/record-milk', icon: Milk, label: t('milk.recordMilk') },
    { path: '/profile', icon: User, label: t('common.profile') || 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                active ? 'text-green-600' : 'text-gray-500'
              }`}
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className={`text-xs mt-1 ${active ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { BottomNavigation };
export default BottomNavigation;
