
import { Bell, Menu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  language: 'am' | 'en';
  setLanguage: (lang: 'am' | 'en') => void;
}

export const Header = ({ language, setLanguage }: HeaderProps) => {
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
              <h1 className="text-xl font-bold text-gray-900">ቤት-ግጦሽ</h1>
              <p className="text-sm text-gray-600">Bet-Gitosa</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'am' ? 'en' : 'am')}
              className="flex items-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'am' ? 'English' : 'አማርኛ'}</span>
            </Button>

            {/* Notifications */}
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* Menu */}
            <Button variant="outline" size="sm">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
