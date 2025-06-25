
import React from 'react';
import { Home, Heart, TrendingUp, ShoppingCart, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Language } from '@/types';

interface BottomNavigationProps {
  language: Language;
}

export const BottomNavigation = ({ language }: BottomNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const translations = {
    am: {
      home: 'ቤት',
      health: 'ጤንነት',
      growth: 'እድገት',
      market: 'ገበያ',
      profile: 'መግለጫ'
    },
    en: {
      home: 'Home',
      health: 'Health',
      growth: 'Growth',
      market: 'Market',
      profile: 'Profile'
    },
    or: {
      home: 'Mana',
      health: 'Fayyaa',
      growth: 'Guddina',
      market: 'Gabaa',
      profile: 'Ibsa'
    },
    sw: {
      home: 'Nyumbani',
      health: 'Afya',
      growth: 'Ukuaji',
      market: 'Soko',
      profile: 'Wasifu'
    }
  };

  const t = translations[language];

  const navItems = [
    { path: '/', label: t.home, icon: Home },
    { path: '/health', label: t.health, icon: Heart },
    { path: '/growth', label: t.growth, icon: TrendingUp },
    { path: '/market', label: t.market, icon: ShoppingCart },
    { path: '/profile', label: t.profile, icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
