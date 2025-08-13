import React from 'react';
import { Home, Heart, ShoppingCart, BarChart3, Milk } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  language: 'am' | 'en' | 'or' | 'sw';
}

const BottomNavigation = ({ language }: BottomNavigationProps) => {
  const location = useLocation();
  
  const navItems = [
    {
      icon: Home,
      labelEn: 'Home',
      labelAm: 'ዋና',
      labelOr: 'Mana',
      labelSw: 'Nyumbani',
      path: '/'
    },
    {
      icon: Heart,
      labelEn: 'Animals',
      labelAm: 'እንስሳት',
      labelOr: 'Horii',
      labelSw: 'Wanyama',
      path: '/animals'
    },
    {
      icon: ShoppingCart,
      labelEn: 'Market',
      labelAm: 'ገበያ',
      labelOr: 'Gabaa',
      labelSw: 'Soko',
      path: '/market'
    },
    {
      icon: BarChart3,
      labelEn: 'Analytics',
      labelAm: 'ትንታኔ',
      labelOr: 'Xiinxala',
      labelSw: 'Uchambuzi',
      path: '/analytics'
    },
    {
      icon: Milk,
      labelEn: 'Milk',
      labelAm: 'ወተት',
      labelOr: 'Aannan',
      labelSw: 'Maziwa',
      path: '/milk-production'
    }
  ];

  const getLabel = (item: any) => {
    switch (language) {
      case 'am':
        return item.labelAm;
      case 'or':
        return item.labelOr;
      case 'sw':
        return item.labelSw;
      default:
        return item.labelEn;
    }
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 bg-white border-t z-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-5">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "py-2 flex flex-col items-center text-xs text-gray-500 hover:text-gray-700",
                  isActive ? "text-orange-600 font-semibold" : ""
                )
              }
            >
              <item.icon className="w-5 h-5 mb-1" />
              {getLabel(item)}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
