
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '@/types';

interface AdvancedSearchFiltersProps {
  language: Language;
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  filterCount: number;
  resultCount: number;
  isLoading?: boolean;
  context?: string;
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
    weightRange: { min: '', max: '' },
    ageRange: { min: '', max: '' }
  });

  const translations = {
    am: {
      advancedFilters: 'የላቀ ማጣሪያዎች',
      results: 'ውጤቶች',
      clearAll: 'ሁሉንም አጽዳ',
      animalType: 'የእንስሳ ዓይነት',
      healthStatus: 'የጤንነት ሁኔታ',
      location: 'አካባቢ',
      vetVerified: 'በእንስሳት ሐኪም የተረጋገጠ',
      dateRange: 'የቀን ክልል',
      priceRange: 'የዋጋ ክልል',
      weightRange: 'የክብደት ክልል',
      ageRange: 'የእድሜ ክልል',
      from: 'ከ',
      to: 'እስከ',
      min: 'ዝቅተኛ',
      max: 'ከፍተኛ',
      all: 'ሁሉም',
      yes: 'አዎ',
      no: 'አይ'
    },
    en: {
      advancedFilters: 'Advanced Filters',
      results: 'Results',
      clearAll: 'Clear All',
      animalType: 'Animal Type',
      healthStatus: 'Health Status',
      location: 'Location',
      vetVerified: 'Vet Verified',
      dateRange: 'Date Range',
      priceRange: 'Price Range',
      weightRange: 'Weight Range',
      ageRange: 'Age Range',
      from: 'From',
      to: 'To',
      min: 'Min',
      max: 'Max',
      all: 'All',
      yes: 'Yes',
      no: 'No'
    },
    or: {
      advancedFilters: 'Calaqqisiisuu Olaanaa',
      results: 'Bu\'uura',
      clearAll: 'Hunda Haquu',
      animalType: 'Gosa Horii',
      healthStatus: 'Haala Fayyaa',
      location: 'Bakka',
      vetVerified: 'Hakimiin Mirkanaa\'e',
      dateRange: 'Daangaa Guyyaa',
      priceRange: 'Daangaa Gatii',
      weightRange: 'Daangaa Ulfaatina',
      ageRange: 'Daangaa Umurii',
      from: 'Irraa',
      to: 'Gara',
      min: 'Gadi',
      max: 'Olii',
      all: 'Hunda',
      yes: 'Eeyyee',
      no: 'Lakki'
    },
    sw: {
      advancedFilters: 'Vichujio vya Hali ya Juu',
      results: 'Matokeo',
      clearAll: 'Futa Yote',
      animalType: 'Aina ya Mnyama',
      healthStatus: 'Hali ya Afya',
      location: 'Mahali',
      vetVerified: 'Imethibitishwa na Daktari',
      dateRange: 'Muda wa Tarehe',
      priceRange: 'Kiwango cha Bei',
      weightRange: 'Kiwango cha Uzito',
      ageRange: 'Kiwango cha Umri',
      from: 'Kutoka',
      to: 'Hadi',
      min: 'Chini',
      max: 'Juu',
      all: 'Yote',
      yes: 'Ndio',
      no: 'Hapana'
    }
  };

  const t = translations[language];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRangeChange = (rangeKey: string, type: 'min' | 'max' | 'from' | 'to', value: string) => {
    const newFilters = {
      ...filters,
      [rangeKey]: {
        ...filters[rangeKey as keyof typeof filters],
        [type]: value
      }
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <Card className="border-gray-200">
      <CardContent className="p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="font-medium text-sm sm:text-base">{t.advancedFilters}</h3>
            {filterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filterCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-gray-500">
              {resultCount} {t.results}
            </span>
            
            {filterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-6 sm:h-7 px-2 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                {t.clearAll}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 sm:h-7 px-2"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-3 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Animal Type */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  {t.animalType}
                </label>
                <Select
                  value={filters.animalType}
                  onValueChange={(value) => handleFilterChange('animalType', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
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
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  {t.healthStatus}
                </label>
                <Select
                  value={filters.healthStatus}
                  onValueChange={(value) => handleFilterChange('healthStatus', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    <SelectItem value="healthy">✅ Healthy</SelectItem>
                    <SelectItem value="sick">🤒 Sick</SelectItem>
                    <SelectItem value="attention">⚠️ Needs Attention</SelectItem>
                    <SelectItem value="critical">🚨 Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  {t.location}
                </label>
                <Input
                  placeholder={t.location}
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Price Range (for market context) */}
            {context === 'market' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    {t.priceRange}
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder={t.min}
                      type="number"
                      value={filters.priceRange.min}
                      onChange={(e) => handleRangeChange('priceRange', 'min', e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={t.max}
                      type="number"
                      value={filters.priceRange.max}
                      onChange={(e) => handleRangeChange('priceRange', 'max', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Weight and Age Range (for animals context) */}
            {context === 'animals' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    {t.weightRange} (kg)
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder={t.min}
                      type="number"
                      value={filters.weightRange.min}
                      onChange={(e) => handleRangeChange('weightRange', 'min', e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={t.max}
                      type="number"
                      value={filters.weightRange.max}
                      onChange={(e) => handleRangeChange('weightRange', 'max', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    {t.ageRange} (years)
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder={t.min}
                      type="number"
                      value={filters.ageRange.min}
                      onChange={(e) => handleRangeChange('ageRange', 'min', e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder={t.max}
                      type="number"
                      value={filters.ageRange.max}
                      onChange={(e) => handleRangeChange('ageRange', 'max', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Vet Verified */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  {t.vetVerified}
                </label>
                <Select
                  value={filters.isVetVerified}
                  onValueChange={(value) => handleFilterChange('isVetVerified', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.all}</SelectItem>
                    <SelectItem value="verified">{t.yes}</SelectItem>
                    <SelectItem value="not-verified">{t.no}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
