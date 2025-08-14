
import React, { useState } from 'react';
import { Bell, Menu, Search, X, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const EnhancedHeader = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or filter current page
      console.log('Searching for:', searchQuery);
      setShowSearch(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-green-100 px-4 py-3 relative z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-green-600" />
            <h1 className="text-lg font-bold text-green-600">MyLivestock</h1>
          </div>
        </div>
        
        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search animals, breeds, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full"
              />
            </div>
          </form>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Mobile Search Toggle */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden"
          >
            <Search className="w-5 h-5" />
          </Button>
          
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/notifications')}
            className="relative"
          >
            <Bell className="w-5 h-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Profile */}
          {user && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/profile')}
              className="hidden sm:flex"
            >
              <User className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden mt-3 animate-fade-in">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search animals, breeds, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-12 w-full"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(false)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {showMenu && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg z-40 animate-fade-in">
          <div className="p-4 space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate('/marketplace');
                setShowMenu(false);
              }}
            >
              Public Marketplace
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate('/market');
                setShowMenu(false);
              }}
            >
              My Market
            </Button>
            {!user && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  navigate('/auth');
                  setShowMenu(false);
                }}
              >
                Login / Register
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
