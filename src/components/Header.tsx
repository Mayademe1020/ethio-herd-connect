
import { Bell, Menu, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

export const Header = () => {
  const { language, setLanguage, getLanguageName, getLanguageFlag } = useLanguage();
  
  const languages = [
    { code: 'am' as const, name: 'አማርኛ', flag: '🇪🇹' },
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
    { code: 'or' as const, name: 'Afaan Oromoo', flag: '🇪🇹' },
    { code: 'sw' as const, name: 'Kiswahili', flag: '🇹🇿' }
  ];

  const translations = {
    am: { title: 'የእንስሳት አስተዳደር' },
    en: { title: 'Livestock Management' },
    or: { title: 'Bulchiinsa Horii' },
    sw: { title: 'Usimamizi wa Mifugo' }
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
                {translations[language].title}
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
            >
              <Bell className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full"></span>
            </Button>

            {/* Menu */}
            <Button 
              variant="outline" 
              size="sm" 
              className="transition-all duration-200 hover:scale-105 active:scale-95 h-7 sm:h-8 lg:h-9 w-7 sm:w-8 lg:w-9 p-0 touch-manipulation"
            >
              <Menu className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
