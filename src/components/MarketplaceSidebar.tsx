
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Filter, 
  MapPin, 
  DollarSign, 
  Star, 
  Shield,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { Language } from '@/types';

interface MarketplaceSidebarProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: any) => void;
  filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    location: string;
    verifiedOnly: boolean;
  };
}

export const MarketplaceSidebar = ({ 
  language, 
  isOpen, 
  onClose, 
  onFiltersChange, 
  filters 
}: MarketplaceSidebarProps) => {
  const translations = {
    am: {
      filters: 'ማጣሪያዎች',
      category: 'ምድብ',
      priceRange: 'የዋጋ ክልል',
      minPrice: 'ዝቅተኛ ዋጋ',  
      maxPrice: 'ከፍተኛ ዋጋ',
      location: 'አካባቢ',
      verifiedOnly: 'የተረጋገጡ ብቻ',
      clearAll: 'ሁሉንም አጽዳ',
      apply: 'ተግብር',
      allCategories: 'ሁሉም ምድቦች',
      cattle: 'ከብት',
      goats: 'ፍየሎች', 
      sheep: 'በጎች',
      poultry: 'ዶሮ'
    },
    en: {
      filters: 'Filters',
      category: 'Category',
      priceRange: 'Price Range',
      minPrice: 'Min Price',
      maxPrice: 'Max Price', 
      location: 'Location',
      verifiedOnly: 'Verified Only',
      clearAll: 'Clear All',
      apply: 'Apply',
      allCategories: 'All Categories',
      cattle: 'Cattle',
      goats: 'Goats',
      sheep: 'Sheep', 
      poultry: 'Poultry'
    },
    or: {
      filters: 'Calaltoota',
      category: 'Akaakuu',
      priceRange: 'Daangaa Gatii',
      minPrice: 'Gatii Gadaanaa',
      maxPrice: 'Gatii Olaanaa',
      location: 'Bakka',
      verifiedOnly: 'Mirkaneeffaman Qofa',
      clearAll: 'Hunda Qulqulleessi',
      apply: 'Hojiirra Oolchi',
      allCategories: 'Akaakuuwwan Hunda',
      cattle: 'Loon',
      goats: 'Re\'ee',
      sheep: 'Hoolaa',
      poultry: 'Lukkuu'
    },
    sw: {
      filters: 'Vichungi',
      category: 'Jamii',
      priceRange: 'Mipaka ya Bei',
      minPrice: 'Bei ya Chini',
      maxPrice: 'Bei ya Juu',
      location: 'Mahali',
      verifiedOnly: 'Zilizothibitishwa Tu',
      clearAll: 'Futa Zote',
      apply: 'Tekeleza',
      allCategories: 'Jamii Zote',
      cattle: 'Ng\'ombe',
      goats: 'Mbuzi',
      sheep: 'Kondoo',
      poultry: 'Kuku'
    }
  };

  const t = translations[language];

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      verifiedOnly: false
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        ${isOpen ? 'lg:block' : 'lg:block'}
      `}>
        <Card className="h-full border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              {t.filters}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.category}</label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.allCategories} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t.allCategories}</SelectItem>
                  <SelectItem value="cattle">🐄 {t.cattle}</SelectItem>
                  <SelectItem value="goats">🐐 {t.goats}</SelectItem>
                  <SelectItem value="sheep">🐑 {t.sheep}</SelectItem>
                  <SelectItem value="poultry">🐔 {t.poultry}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium">{t.priceRange}</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    placeholder={t.minPrice}
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="number"
                    placeholder={t.maxPrice}
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.location}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Enter location..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Verified Only Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-600" />
                {t.verifiedOnly}
              </label>
              <Button
                variant={filters.verifiedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('verifiedOnly', !filters.verifiedOnly)}
              >
                {filters.verifiedOnly ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ON
                  </Badge>
                ) : (
                  <Badge variant="outline">OFF</Badge>
                )}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={clearAllFilters}
              >
                <Filter className="w-4 h-4 mr-2" />
                {t.clearAll}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
