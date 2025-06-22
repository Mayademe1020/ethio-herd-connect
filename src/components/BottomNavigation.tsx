
import { Home, Users, Heart, TrendingUp, ShoppingCart, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BottomNavigationProps {
  language: 'am' | 'en';
}

export const BottomNavigation = ({ language }: BottomNavigationProps) => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: language === 'am' ? 'ቤት' : 'Home',
    },
    {
      path: '/animals',
      icon: Users,
      label: language === 'am' ? 'እንስሳት' : 'Animals',
    },
    {
      path: '/health',
      icon: Heart,
      label: language === 'am' ? 'ጤንነት' : 'Health',
    },
    {
      path: '/growth',
      icon: TrendingUp,
      label: language === 'am' ? 'እድገት' : 'Growth',
    },
    {
      path: '/market',
      icon: ShoppingCart,
      label: language === 'am' ? 'ገበያ' : 'Market',
    },
    {
      path: '/profile',
      icon: User,
      label: language === 'am' ? 'መግለጫ' : 'Profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex justify-around items-center h-14 sm:h-16 px-1 sm:px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-lg transition-colors touch-manipulation ${
                isActive
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-green-600 active:text-green-600'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 sm:mb-1" />
              <span className="text-[10px] sm:text-xs font-medium truncate leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
