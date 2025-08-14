
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
      apply: 'ተግብር',
      activeFilters: 'ንቁ ማጣሪያዎች'
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
      apply: 'Apply',
      activeFilters: 'Active Filters'
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
      apply: 'Hojiirra Oolchi',
      activeFilters: 'Calaqqisiisa Sochii'
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
      apply: 'Tekeleza',
      activeFilters: 'Vichuja Hai'
    }
  };

  const t = translations[language];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      category: '',
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

  const handleClose = () => {
    // Preserve scroll position by not forcing any scroll behavior
    onClose();
  };

  const SidebarContent = () => (
    <div className="space-y-4 p-4 h-full overflow-y-auto">
      {/* Header with close button */}
      <div className="flex items-center justify-between sticky top-0 bg-white pb-2 border-b">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-semibold">{t.filters}</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {activeFilterCount} {t.activeFilters}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </Button>
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
            value={filters.category || ""}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t.allCategories} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t.allCategories}</SelectItem>
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
            className="h-10"
          />
          <Input
            placeholder={t.maxPrice}
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="h-10"
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
            className="h-10"
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
      <div className="flex gap-2 pt-4 border-t sticky bottom-0 bg-white">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          disabled={activeFilterCount === 0}
          className="flex-1 h-10"
        >
          <X className="w-4 h-4 mr-1" />
          {t.clearAll}
        </Button>
      </div>
    </div>
  );

  // Mobile Sheet
  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-96 p-0"
        onInteractOutside={handleClose}
      >
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
};
