
import React from 'react';
import { Home, Heart, ShoppingCart, BarChart3, Milk, User, Stethoscope } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  language: 'am' | 'en' | 'or' | 'sw';
}

const BottomNavigation = ({ language }: BottomNavigationProps) => {
  const location = useLocation();
  
  // BottomNavigation: already points to /marketplace and keeps public visibility
  // No changes required — ensure Market points to '/marketplace'
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
      path: '/marketplace'
    },
    {
      icon: Stethoscope,
      labelEn: 'Health',
      labelAm: 'ጤና',
      labelOr: 'Fayyaa',
      labelSw: 'Afya',
      path: '/health'
    },
    {
      icon: Milk,
      labelEn: 'Milk',
      labelAm: 'ወተት',
      labelOr: 'Aannan',
      labelSw: 'Maziwa',
      path: '/milk'
    },
    {
      icon: User,
      labelEn: 'Profile',
      labelAm: 'መገለጫ',
      labelOr: 'Ibsa',
      labelSw: 'Wasifu',
      path: '/profile'
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
    <nav className="fixed inset-x-0 bottom-0 bg-white border-t z-50 shadow-lg">
      <div className="container mx-auto px-1">
        <div className="grid grid-cols-6 gap-1">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "py-2 px-1 flex flex-col items-center text-xs text-gray-500 hover:text-gray-700 transition-all duration-200 hover:bg-gray-50 rounded-lg min-h-[60px] justify-center",
                  isActive ? "text-orange-600 font-semibold bg-orange-50" : ""
                )
              }
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] leading-tight text-center">
                {getLabel(item)}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
