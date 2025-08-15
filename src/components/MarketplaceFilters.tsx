
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  MapPin, 
  Filter, 
  X,
  Shield,
  Tag,
  Calendar,
  Weight
} from 'lucide-react';
import { Language } from '@/types';

interface MarketplaceFiltersProps {
  language: Language;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    animalType: string;
    location: string;
    minPrice: number;
    maxPrice: number;
    ageRange: [number, number];
    weightRange: [number, number];
    healthStatus: string;
    verifiedOnly: boolean;
    sellerRating: number;
  };
  onFiltersChange: (filters: any) => void;
  showMobileFilters?: boolean;
  onToggleMobileFilters?: () => void;
  isAuthenticated: boolean;
}

export const MarketplaceFilters = ({
  language,
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  showMobileFilters = false,
  onToggleMobileFilters,
  isAuthenticated
}: MarketplaceFiltersProps) => {
  const translations = {
    am: {
      searchPlaceholder: 'እንስሳ ይፈልጉ...',
      filters: 'ማጣሪያዎች',
      animalType: 'የእንስሳ አይነት',
      allTypes: 'ሁሉም አይነቶች',
      cattle: 'ከብት',
      goats: 'ፍየሎች',
      sheep: 'በጎች',
      poultry: 'ዶሮዎች',
      location: 'አካባቢ',
      allLocations: 'ሁሉም አካባቢዎች',
      priceRange: 'የዋጋ ክልል',
      minPrice: 'ዝቅተኛ ዋጋ',
      maxPrice: 'ከፍተኛ ዋጋ',
      ageRange: 'የእድሜ ክልል',
      weightRange: 'የክብደት ክልል',
      healthStatus: 'የጤና ሁኔታ',
      allHealth: 'ሁሉም',
      excellent: 'በጣም ጤናማ',
      good: 'ጤናማ',
      verifiedOnly: 'የተረጋገጠ ብቻ',
      sellerRating: 'የሻጭ ደረጃ',
      clearAll: 'ሁሉንም አጽዳ',
      applyFilters: 'ማጣሪያዎችን ተግብር',
      loginForPrices: 'ዋጋዎችን ለማየት ይግቡ',
      activeFilters: 'ንቁ ማጣሪያዎች'
    },
    en: {
      searchPlaceholder: 'Search for animals...',
      filters: 'Filters',
      animalType: 'Animal Type',
      allTypes: 'All Types',
      cattle: 'Cattle',
      goats: 'Goats',
      sheep: 'Sheep',
      poultry: 'Poultry',
      location: 'Location',
      allLocations: 'All Locations',
      priceRange: 'Price Range',
      minPrice: 'Min Price',
      maxPrice: 'Max Price',
      ageRange: 'Age Range',
      weightRange: 'Weight Range',
      healthStatus: 'Health Status',
      allHealth: 'All',
      excellent: 'Excellent',
      good: 'Good',
      verifiedOnly: 'Verified Only',
      sellerRating: 'Seller Rating',
      clearAll: 'Clear All',
      applyFilters: 'Apply Filters',
      loginForPrices: 'Login to see prices',
      activeFilters: 'Active Filters'
    },
    or: {
      searchPlaceholder: 'Bineensota barbaadi...',
      filters: 'Calaltoota',
      animalType: 'Gosa Bineensotaa',
      allTypes: 'Gosaalee Hundaa',
      cattle: 'Loon',
      goats: 'Re\'ee',
      sheep: 'Hoolaa',
      poultry: 'Lukku',
      location: 'Bakka',
      allLocations: 'Bakkeewwan Hundaa',
      priceRange: 'Daangaa Gatii',
      minPrice: 'Gatii Gadaanaa',
      maxPrice: 'Gatii Olaanaa',
      ageRange: 'Daangaa Umurii',
      weightRange: 'Daangaa Ulfaatinaa',
      healthStatus: 'Haala Fayyaa',
      allHealth: 'Hundaa',
      excellent: 'Gaarii',
      good: 'Gaarii',
      verifiedOnly: 'Mirkaneeffame Qofa',
      sellerRating: 'Sadarkaa Gurgurtaa',
      clearAll: 'Hundaa Qulqulleessi',
      applyFilters: 'Calaltoota Hojiirra Oolchi',
      loginForPrices: 'Gatii ilaaluuf seeni',
      activeFilters: 'Calaltoota Sochii'
    },
    sw: {
      searchPlaceholder: 'Tafuta wanyama...',
      filters: 'Vichungi',
      animalType: 'Aina ya Mnyama',
      allTypes: 'Aina Zote',
      cattle: 'Ng\'ombe',
      goats: 'Mbuzi',
      sheep: 'Kondoo',
      poultry: 'Kuku',
      location: 'Mahali',
      allLocations: 'Maeneo Yote',
      priceRange: 'Mipaka ya Bei',
      minPrice: 'Bei ya Chini',
      maxPrice: 'Bei ya Juu',
      ageRange: 'Mipaka ya Umri',
      weightRange: 'Mipaka ya Uzito',
      healthStatus: 'Hali ya Afya',
      allHealth: 'Zote',
      excellent: 'Bora',
      good: 'Nzuri',
      verifiedOnly: 'Zilizothibitishwa Tu',
      sellerRating: 'Kiwango cha Muuzaji',
      clearAll: 'Futa Zote',
      applyFilters: 'Tumia Vichungi',
      loginForPrices: 'Ingia kuona bei',
      activeFilters: 'Vichungi Hai'
    }
  };

  const t = translations[language];

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      animalType: '',
      location: '',
      minPrice: 0,
      maxPrice: 1000000,
      ageRange: [0, 120],
      weightRange: [0, 1000],
      healthStatus: '',
      verifiedOnly: false,
      sellerRating: 0
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.animalType) count++;
    if (filters.location) count++;
    if (filters.minPrice > 0 || filters.maxPrice < 1000000) count++;
    if (filters.ageRange[0] > 0 || filters.ageRange[1] < 120) count++;
    if (filters.weightRange[0] > 0 || filters.weightRange[1] < 1000) count++;
    if (filters.healthStatus) count++;
    if (filters.verifiedOnly) count++;
    if (filters.sellerRating > 0) count++;
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Active Filters Summary */}
      {getActiveFilterCount() > 0 && (
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            {getActiveFilterCount()} {t.activeFilters}
          </Badge>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="w-3 h-3 mr-1" />
            {t.clearAll}
          </Button>
        </div>
      )}

      {/* Animal Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          {t.animalType}
        </label>
        <Select value={filters.animalType} onValueChange={(value) => updateFilter('animalType', value)}>
          <SelectTrigger>
            <SelectValue placeholder={t.allTypes} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t.allTypes}</SelectItem>
            <SelectItem value="cattle">🐄 {t.cattle}</SelectItem>
            <SelectItem value="goats">🐐 {t.goats}</SelectItem>
            <SelectItem value="sheep">🐑 {t.sheep}</SelectItem>
            <SelectItem value="poultry">🐔 {t.poultry}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          {t.location}
        </label>
        <Input
          placeholder={t.allLocations}
          value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}
        />
      </div>

      {/* Price Range - Only show if authenticated */}
      {isAuthenticated && (
        <div className="space-y-3">
          <label className="text-sm font-medium">{t.priceRange}</label>
          <div className="px-2">
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={([min, max]) => {
                updateFilter('minPrice', min);
                updateFilter('maxPrice', max);
              }}
              min={0}
              max={1000000}
              step={10000}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filters.minPrice.toLocaleString()} ETB</span>
            <span>{filters.maxPrice.toLocaleString()} ETB</span>
          </div>
        </div>
      )}

      {/* Price Range Message for Non-authenticated */}
      {!isAuthenticated && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            {t.loginForPrices}
          </p>
        </div>
      )}

      {/* Age Range */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {t.ageRange}
        </label>
        <div className="px-2">
          <Slider
            value={filters.ageRange}
            onValueChange={(value) => updateFilter('ageRange', value)}
            min={0}
            max={120}
            step={1}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{filters.ageRange[0]} months</span>
          <span>{filters.ageRange[1]} months</span>
        </div>
      </div>

      {/* Weight Range */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center">
          <Weight className="w-4 h-4 mr-2" />
          {t.weightRange}
        </label>
        <div className="px-2">
          <Slider
            value={filters.weightRange}
            onValueChange={(value) => updateFilter('weightRange', value)}
            min={0}
            max={1000}
            step={10}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{filters.weightRange[0]} kg</span>
          <span>{filters.weightRange[1]} kg</span>
        </div>
      </div>

      {/* Health Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t.healthStatus}</label>
        <Select value={filters.healthStatus} onValueChange={(value) => updateFilter('healthStatus', value)}>
          <SelectTrigger>
            <SelectValue placeholder={t.allHealth} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t.allHealth}</SelectItem>
            <SelectItem value="excellent">{t.excellent}</SelectItem>
            <SelectItem value="good">{t.good}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Verified Only */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          {t.verifiedOnly}
        </label>
        <Switch
          checked={filters.verifiedOnly}
          onCheckedChange={(checked) => updateFilter('verifiedOnly', checked)}
        />
      </div>
    </div>
  );

  // Mobile filters in a sheet
  if (showMobileFilters) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                {t.filters}
              </h2>
              <Button variant="ghost" size="sm" onClick={onToggleMobileFilters}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <FilterContent />
          </div>
        </div>
      </div>
    );
  }

  // Desktop filters
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          {t.filters}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FilterContent />
      </CardContent>
    </Card>
  );
};
