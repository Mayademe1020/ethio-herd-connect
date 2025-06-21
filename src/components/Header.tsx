
import { Bell, Menu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const Header = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <header className="bg-white shadow-sm border-b border-green-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">🐄</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MyLivestock</h1>
              <p className="text-sm text-gray-600">
                {language === 'am' ? 'ቤት-ግጦሽ' : 'Formerly Bet-Gitosa'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'am' ? 'en' : 'am')}
              className="flex items-center space-x-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'am' ? 'English' : 'አማርኛ'}</span>
            </Button>

            {/* Notifications */}
            <Button variant="outline" size="sm" className="relative transition-all duration-200 hover:scale-105 active:scale-95">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* Menu */}
            <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-105 active:scale-95">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
