
import { Bell, Menu, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const Header = () => {
  const { language, setLanguage, getLanguageName, getLanguageFlag } = useLanguage();
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const languages = [
    { code: 'am' as const, name: getLanguageName('am'), flag: getLanguageFlag('am') },
    { code: 'en' as const, name: getLanguageName('en'), flag: getLanguageFlag('en') },
    { code: 'or' as const, name: getLanguageName('or'), flag: getLanguageFlag('or') },
    { code: 'sw' as const, name: getLanguageName('sw'), flag: getLanguageFlag('sw') }
  ];

  const menuItems = [
    { path: '/', label: t('navigation.home') },
    { path: '/animals', label: t('navigation.animals') },
    { path: '/health', label: t('navigation.health') },
    { path: '/growth', label: t('navigation.growth') },
    { path: '/market', label: t('navigation.market') },
    { path: '/notifications', label: t('navigation.notifications') },
    { path: '/profile', label: t('navigation.profile') }
  ];

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-green-100 safe-area-pt sticky top-0 z-40">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm sm:text-lg lg:text-xl font-bold">🐄</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900">MyLivestock</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                {t('navigation.title')}
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
                  className="flex items-center space-x-1 sm:space-x-2 transition-all duration-200 hover:scale-105 active:scale-95 text-xs sm:text-sm px-2 sm:px-3 h-9 sm:h-10 lg:h-12 min-h-[48px] touch-manipulation"
                >
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{languages.find(l => l.code === language)?.flag}</span>
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
              className="relative transition-all duration-200 hover:scale-105 active:scale-95 h-9 sm:h-10 lg:h-12 w-9 sm:w-10 lg:w-12 p-0 min-h-[48px] touch-manipulation"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full"></span>
            </Button>

            {/* Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="transition-all duration-200 hover:scale-105 active:scale-95 h-9 sm:h-10 lg:h-12 w-9 sm:w-10 lg:w-12 p-0 min-h-[48px] touch-manipulation"
                >
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80 bg-white">
                <div className="mt-8">
                  <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg font-bold">🐄</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">MyLivestock</h2>
                      <p className="text-sm text-gray-600">{t('navigation.title')}</p>
                    </div>
                  </div>
                  
                  <nav className="space-y-1">
                    {menuItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleMenuItemClick(item.path)}
                        className="w-full text-left px-4 py-4 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors flex items-center space-x-3 font-medium min-h-[48px] touch-manipulation"
                      >
                        <span>{item.label}</span>
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
