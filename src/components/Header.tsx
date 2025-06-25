
import { Bell, Menu, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const Header = () => {
  const { language, setLanguage, getLanguageName, getLanguageFlag } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const languages = [
    { code: 'am' as const, name: 'አማርኛ', flag: '🇪🇹' },
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
    { code: 'or' as const, name: 'Afaan Oromoo', flag: '🇪🇹' },
    { code: 'sw' as const, name: 'Kiswahili', flag: '🇹🇿' }
  ];

  const translations = {
    am: { 
      title: 'የእንስሳት አስተዳደር',
      home: 'ቤት',
      animals: 'እንስሳት',
      health: 'ጤንነት',
      growth: 'እድገት',
      market: 'ገበያ',
      profile: 'መግለጫ',
      notifications: 'ማሳወቂያዎች'
    },
    en: { 
      title: 'Livestock Management',
      home: 'Home',
      animals: 'Animals',
      health: 'Health',
      growth: 'Growth',
      market: 'Market',
      profile: 'Profile',
      notifications: 'Notifications'
    },
    or: { 
      title: 'Bulchiinsa Horii',
      home: 'Mana',
      animals: 'Horii',
      health: 'Fayyaa',
      growth: 'Guddina',
      market: 'Gabaa',
      profile: 'Ibsa',
      notifications: 'Beeksisa'
    },
    sw: { 
      title: 'Usimamizi wa Mifugo',
      home: 'Nyumbani',
      animals: 'Wanyama',
      health: 'Afya',
      growth: 'Ukuaji',
      market: 'Soko',
      profile: 'Wasifu',
      notifications: 'Arifa'
    }
  };

  const t = translations[language];

  const menuItems = [
    { path: '/', label: t.home },
    { path: '/animals', label: t.animals },
    { path: '/health', label: t.health },
    { path: '/growth', label: t.growth },
    { path: '/market', label: t.market },
    { path: '/notifications', label: t.notifications },
    { path: '/profile', label: t.profile }
  ];

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-green-100 safe-area-pt">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm sm:text-lg lg:text-xl font-bold">🐄</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900">MyLivestock</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                {t.title}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 sm:space-x-2 transition-all duration-200 hover:scale-105 active:scale-95 text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8 lg:h-9"
                >
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{getLanguageFlag(language)}</span>
                  <span className="sm:hidden">{languages.find(l => l.code === language)?.flag}</span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg z-50">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                      language === lang.code ? 'bg-green-50 text-green-700' : ''
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button 
              variant="outline" 
              size="sm" 
              className="relative transition-all duration-200 hover:scale-105 active:scale-95 h-7 sm:h-8 lg:h-9 w-7 sm:w-8 lg:w-9 p-0 touch-manipulation"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full"></span>
            </Button>

            {/* Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="transition-all duration-200 hover:scale-105 active:scale-95 h-7 sm:h-8 lg:h-9 w-7 sm:w-8 lg:w-9 p-0 touch-manipulation"
                >
                  <Menu className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900">{t.title}</h2>
                  <nav className="space-y-2">
                    {menuItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleMenuItemClick(item.path)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
