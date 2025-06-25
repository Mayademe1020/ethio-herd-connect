
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '@/types';

interface AdvancedSearchFiltersProps {
  language: Language;
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  filterCount: number;
  resultCount: number;
  isLoading?: boolean;
  context?: 'animals' | 'market';
}

export const AdvancedSearchFilters = ({
  language,
  onFiltersChange,
  onClearFilters,
  filterCount,
  resultCount,
  isLoading = false,
  context = 'animals'
}: AdvancedSearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    animalType: 'all',
    healthStatus: 'all',
    location: '',
    isVetVerified: 'all',
    dateRange: { from: '', to: '' },
    priceRange: { min: '', max: '' },
    ageRange: { min: '', max: '' },
    weightRange: { min: '', max: '' }
  });

  const translations = {
    am: {
      advancedFilters: 'የላቀ ማጣሪያዎች',
      animalType: 'የእንስሳ ዓይነት',
      healthStatus: 'የጤንነት ሁኔታ',
      location: 'አካባቢ',
      vetVerified: 'የተረጋገጠ በዓይነ ሐኪም',
      dateRange: 'የቀን ክልል',
      priceRange: 'የዋጋ ክልል',
      ageRange: 'የእድሜ ክልል',
      weightRange: 'የክብደት ክልል',
      from: 'ከ',
      to: 'እስከ',
      min: 'ዝቅተኛ',
      max: 'ከፍተኛ',
      clearAll: 'ሁሉንም አጽዳ',
      apply: 'ተግብር',
      results: 'ውጤቶች',
      activeFilters: 'ንቁ ማጣሪያዎች',
      all: 'ሁሉም',
      verified: 'የተረጋገጠ',
      notVerified: 'ያልተረጋገጠ'
    },
    en: {
      advancedFilters: 'Advanced Filters',
      animalType: 'Animal Type',
      healthStatus: 'Health Status',
      location: 'Location',
      vetVerified: 'Vet Verified',
      dateRange: 'Date Range',
      priceRange: 'Price Range',
      ageRange: 'Age Range',
      weightRange: 'Weight Range',
      from: 'From',
      to: 'To',
      min: 'Min',
      max: 'Max',
      clearAll: 'Clear All',
      apply: 'Apply',
      results: 'Results',
      activeFilters: 'Active Filters',
      all: 'All',
      verified: 'Verified',
      notVerified: 'Not Verified'
    },
    or: {
      advancedFilters: 'Calaqqisiisa Olaanaa',
      animalType: 'Gosa Horii',
      healthStatus: 'Haala Fayyaa',
      location: 'Bakka',
      vetVerified: 'Hakiimaan Mirkaneesse',
      dateRange: 'Daangaa Guyyaa',
      priceRange: 'Daangaa Gatii',
      ageRange: 'Daangaa Umurii',
      weightRange: 'Daangaa Ulfaatinaa',
      from: 'Irraa',
      to: 'Hanga',
      min: 'Gadaanaa',
      max: 'Olaanaa',
      clearAll: 'Hundaa Qulqulleessi',
      apply: 'Hojiirra Oolchi',
      results: 'Bu\'aa',
      activeFilters: 'Calaqqisiisa Ka\'aa',
      all: 'Hundaa',
      verified: 'Mirkaneeffame',
      notVerified: 'Hin Mirkaneeffamne'
    },
    sw: {
      advancedFilters: 'Vichuja vya Hali ya Juu',
      animalType: 'Aina ya Mnyama',
      healthStatus: 'Hali ya Afya',
      location: 'Mahali',
      vetVerified: 'Imethibitishwa na Daktari',
      dateRange: 'Mipaka ya Tarehe',
      priceRange: 'Mipaka ya Bei',
      ageRange: 'Mipaka ya Umri',
      weightRange: 'Mipaka ya Uzito',
      from: 'Kutoka',
      to: 'Hadi',
      min: 'Chini',
      max: 'Juu',
      clearAll: 'Futa Zote',
      apply: 'Tekeleza',
      results: 'Matokeo',
      activeFilters: 'Vichuja Vinavyofanya Kazi',
      all: 'Zote',
      verified: 'Imethibitishwa',
      notVerified: 'Haijathibitishwa'
    }
  };

  const t = translations[language];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      animalType: 'all',
      healthStatus: 'all',
      location: '',
      isVetVerified: 'all',
      dateRange: { from: '', to: '' },
      priceRange: { min: '', max: '' },
      ageRange: { min: '', max: '' },
      weightRange: { min: '', max: '' }
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  return (
    <Card className="border-dashed border-2 border-gray-200">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>{t.advancedFilters}</span>
            {filterCount > 0 && (
              <Badge variant="secondary">{filterCount}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {resultCount} {t.results}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Animal Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.animalType}</label>
              <Select
                value={filters.animalType}
                onValueChange={(value) => handleFilterChange('animalType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="cattle">🐄 Cattle</SelectItem>
                  <SelectItem value="goat">🐐 Goat</SelectItem>
                  <SelectItem value="sheep">🐑 Sheep</SelectItem>
                  <SelectItem value="poultry">🐔 Poultry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Health Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.healthStatus}</label>
              <Select
                value={filters.healthStatus}
                onValueChange={(value) => handleFilterChange('healthStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="healthy">✅ Healthy</SelectItem>
                  <SelectItem value="sick">🤒 Sick</SelectItem>
                  <SelectItem value="attention">⚠️ Attention</SelectItem>
                  <SelectItem value="critical">🚨 Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.location}</label>
              <Input
                placeholder={t.location}
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Vet Verified */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.vetVerified}</label>
              <Select
                value={filters.isVetVerified}
                onValueChange={(value) => handleFilterChange('isVetVerified', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="verified">{t.verified}</SelectItem>
                  <SelectItem value="not-verified">{t.notVerified}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.ageRange}</label>
              <div className="flex space-x-2">
                <Input
                  placeholder={t.min}
                  type="number"
                  value={filters.ageRange.min}
                  onChange={(e) => handleFilterChange('ageRange', {
                    ...filters.ageRange,
                    min: e.target.value
                  })}
                />
                <Input
                  placeholder={t.max}
                  type="number"
                  value={filters.ageRange.max}
                  onChange={(e) => handleFilterChange('ageRange', {
                    ...filters.ageRange,
                    max: e.target.value
                  })}
                />
              </div>
            </div>

            {/* Weight Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.weightRange}</label>
              <div className="flex space-x-2">
                <Input
                  placeholder={t.min}
                  type="number"
                  value={filters.weightRange.min}
                  onChange={(e) => handleFilterChange('weightRange', {
                    ...filters.weightRange,
                    min: e.target.value
                  })}
                />
                <Input
                  placeholder={t.max}
                  type="number"
                  value={filters.weightRange.max}
                  onChange={(e) => handleFilterChange('weightRange', {
                    ...filters.weightRange,
                    max: e.target.value
                  })}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={filterCount === 0}
            >
              <X className="w-4 h-4 mr-1" />
              {t.clearAll}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
