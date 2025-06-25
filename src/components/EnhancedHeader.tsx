
import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EnhancedHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-green-100 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm">
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-green-600">MyLivestock</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
