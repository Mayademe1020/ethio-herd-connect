
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Filter, 
  MapPin, 
  DollarSign, 
  Shield, 
  Calendar,
  Tag,
  X
} from 'lucide-react';
import { Language } from '@/types';

interface MarketplaceSidebarProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  filters: {
    category: string;
    minPrice: string;
    maxPrice: string;
    location: string;
    verifiedOnly: boolean;
  };
  onFiltersChange: (filters: any) => void;
}

export const MarketplaceSidebar = ({
  language,
  isOpen,
  onClose,
  filters,
  onFiltersChange
}: MarketplaceSidebarProps) => {
  const translations = {
    am: {
      filters: 'ማጣሪያዎች',
      category: 'ምድብ',
      allCategories: 'ሁሉም ምድቦች',
      cattle: 'ከብት',
      goat: 'ፍየል',
      sheep: 'በግ',
      poultry: 'ዶሮ',
      priceRange: 'የዋጋ ክልል',
      minPrice: 'ዝቅተኛ ዋጋ',
      maxPrice: 'ከፍተኛ ዋጋ',
      location: 'አካባቢ',
      verifiedOnly: 'የተረጋገጠ ብቻ',
      clearAll: 'ሁሉንም አጽዳ',
      apply: 'ተግብር'
    },
    en: {
      filters: 'Filters',
      category: 'Category',
      allCategories: 'All Categories',
      cattle: 'Cattle',
      goat: 'Goat',
      sheep: 'Sheep',
      poultry: 'Poultry',
      priceRange: 'Price Range',
      minPrice: 'Min Price',
      maxPrice: 'Max Price',
      location: 'Location',
      verifiedOnly: 'Verified Only',
      clearAll: 'Clear All',
      apply: 'Apply'
    },
    or: {
      filters: 'Calaqqisiisa',
      category: 'Gosa',
      allCategories: 'Gosaalee Hundaa',
      cattle: 'Loon',
      goat: 'Re\'ee',
      sheep: 'Hoolaa',
      poultry: 'Lukku',
      priceRange: 'Daangaa Gatii',
      minPrice: 'Gatii Gadaanaa',
      maxPrice: 'Gatii Olaanaa',
      location: 'Bakka',
      verifiedOnly: 'Mirkaneeffame Qofa',
      clearAll: 'Hundaa Qulqulleessi',
      apply: 'Hojiirra Oolchi'
    },
    sw: {
      filters: 'Vichuja',
      category: 'Kategoria',
      allCategories: 'Kategoria Zote',
      cattle: 'Ng\'ombe',
      goat: 'Mbuzi',
      sheep: 'Kondoo',
      poultry: 'Kuku',
      priceRange: 'Mipaka ya Bei',
      minPrice: 'Bei ya Chini',
      maxPrice: 'Bei ya Juu',
      location: 'Mahali',
      verifiedOnly: 'Zilizothibitishwa Tu',
      clearAll: 'Futa Zote',
      apply: 'Tekeleza'
    }
  };

  const t = translations[language];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      category: 'all',
      minPrice: '',
      maxPrice: '',
      location: '',
      verifiedOnly: false
    };
    onFiltersChange(clearedFilters);
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== '' && value !== 'all' && value !== false
  ).length;

  const SidebarContent = () => (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-semibold">{t.filters}</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Tag className="w-4 h-4" />
            {t.category}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.category || "all"}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t.allCategories} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allCategories}</SelectItem>
              <SelectItem value="cattle">🐄 {t.cattle}</SelectItem>
              <SelectItem value="goat">🐐 {t.goat}</SelectItem>
              <SelectItem value="sheep">🐑 {t.sheep}</SelectItem>
              <SelectItem value="poultry">🐔 {t.poultry}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Price Range Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            {t.priceRange}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder={t.minPrice}
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          />
          <Input
            placeholder={t.maxPrice}
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Location Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t.location}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder={t.location}
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Verified Only Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t.verifiedOnly}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              checked={filters.verifiedOnly}
              onCheckedChange={(checked) => handleFilterChange('verifiedOnly', checked)}
            />
            <span className="text-sm text-gray-600">{t.verifiedOnly}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          disabled={activeFilterCount === 0}
          className="flex-1"
        >
          <X className="w-4 h-4 mr-1" />
          {t.clearAll}
        </Button>
      </div>
    </div>
  );

  // Mobile Sheet
  if (isOpen && window.innerWidth < 1024) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:w-96">
          <SheetHeader>
            <SheetTitle>{t.filters}</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop Sidebar
  if (!isOpen && window.innerWidth >= 1024) {
    return null;
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <SidebarContent />
    </div>
  );
};
