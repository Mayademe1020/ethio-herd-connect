
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Filter, X, Search, MapPin, Calendar } from 'lucide-react';

interface FilterState {
  animalType: string;
  healthStatus: string;
  breed: string;
  ageRange: [number, number];
  weightRange: [number, number];
  priceRange: [number, number];
  location: string;
  dateRange: {
    from: string;
    to: string;
  };
  isVetVerified: string;
}

interface AdvancedSearchFiltersProps {
  language: 'am' | 'en';
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  filterCount: number;
  resultCount?: number;
  isLoading?: boolean;
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  language,
  onFiltersChange,
  onClearFilters,
  filterCount,
  resultCount,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    animalType: 'all',
    healthStatus: 'all',
    breed: 'all',
    ageRange: [0, 20],
    weightRange: [0, 1000],
    priceRange: [0, 100000],
    location: '',
    dateRange: {
      from: '',
      to: ''
    },
    isVetVerified: 'all'
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const defaultFilters: FilterState = {
      animalType: 'all',
      healthStatus: 'all',
      breed: 'all',
      ageRange: [0, 20],
      weightRange: [0, 1000],
      priceRange: [0, 100000],
      location: '',
      dateRange: { from: '', to: '' },
      isVetVerified: 'all'
    };
    setFilters(defaultFilters);
    onClearFilters();
  };

  const getActiveFilterChips = () => {
    const chips: { key: string; label: string; value: string }[] = [];
    
    if (filters.animalType !== 'all') {
      chips.push({
        key: 'animalType',
        label: language === 'am' ? 'አይነት' : 'Type',
        value: filters.animalType
      });
    }
    
    if (filters.healthStatus !== 'all') {
      chips.push({
        key: 'healthStatus',
        label: language === 'am' ? 'ጤንነት' : 'Health',
        value: filters.healthStatus
      });
    }
    
    if (filters.location) {
      chips.push({
        key: 'location',
        label: language === 'am' ? 'ቦታ' : 'Location',
        value: filters.location
      });
    }
    
    return chips;
  };

  const removeFilterChip = (key: string) => {
    if (key === 'location') {
      updateFilter('location', '');
    } else {
      updateFilter(key as keyof FilterState, 'all');
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
        >
          <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          {language === 'am' ? 'ማጣሪያዎች' : 'Filters'}
          {filterCount > 0 && (
            <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs px-1 sm:px-2">
              {filterCount}
            </Badge>
          )}
        </Button>
        
        {/* Result Count */}
        {resultCount !== undefined && (
          <div className="text-xs sm:text-sm text-gray-600">
            {isLoading ? (
              language === 'am' ? 'እየፈለገ...' : 'Searching...'
            ) : (
              <>
                {resultCount} {language === 'am' ? 'ውጤቶች' : 'results'}
              </>
            )}
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {getActiveFilterChips().length > 0 && (
        <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
          <span className="text-xs sm:text-sm text-gray-600 mr-1 sm:mr-2">
            {language === 'am' ? 'ንቁ ማጣሪያዎች:' : 'Active filters:'}
          </span>
          {getActiveFilterChips().map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="text-xs px-2 py-1 flex items-center space-x-1"
            >
              <span>{chip.label}: {chip.value}</span>
              <X
                className="w-2 h-2 sm:w-3 sm:h-3 cursor-pointer hover:text-red-500"
                onClick={() => removeFilterChip(chip.key)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs sm:text-sm h-6 sm:h-8 px-2 sm:px-3 text-red-600 hover:text-red-700"
          >
            {language === 'am' ? 'ሁሉንም አጽዳ' : 'Clear All'}
          </Button>
        </div>
      )}

      {/* Filter Panel */}
      {isOpen && (
        <Card className="border-gray-200">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{language === 'am' ? 'የላቀ ፍለጋ' : 'Advanced Search'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
            {/* Type and Health Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">
                  {language === 'am' ? 'የእንስሳ አይነት' : 'Animal Type'}
                </label>
                <Select value={filters.animalType} onValueChange={(value) => updateFilter('animalType', value)}>
                  <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'am' ? 'ሁሉም' : 'All Types'}</SelectItem>
                    <SelectItem value="cattle">🐄 {language === 'am' ? 'ከብት' : 'Cattle'}</SelectItem>
                    <SelectItem value="poultry">🐔 {language === 'am' ? 'ዶሮ' : 'Poultry'}</SelectItem>
                    <SelectItem value="goat">🐐 {language === 'am' ? 'ፍየል' : 'Goat'}</SelectItem>
                    <SelectItem value="sheep">🐑 {language === 'am' ? 'በግ' : 'Sheep'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">
                  {language === 'am' ? 'የጤንነት ሁኔታ' : 'Health Status'}
                </label>
                <Select value={filters.healthStatus} onValueChange={(value) => updateFilter('healthStatus', value)}>
                  <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'am' ? 'ሁሉም' : 'All Status'}</SelectItem>
                    <SelectItem value="healthy">✅ {language === 'am' ? 'ጤነኛ' : 'Healthy'}</SelectItem>
                    <SelectItem value="attention">⚠️ {language === 'am' ? 'ትኩረት ይፈልጋል' : 'Needs Attention'}</SelectItem>
                    <SelectItem value="sick">🔴 {language === 'am' ? 'ታመመ' : 'Sick'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Age Range */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'የእድሜ ክልል' : 'Age Range'} ({filters.ageRange[0]} - {filters.ageRange[1]} {language === 'am' ? 'ዓመት' : 'years'})
              </label>
              <Slider
                value={filters.ageRange}
                onValueChange={(value) => updateFilter('ageRange', value as [number, number])}
                max={20}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Weight Range */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'የክብደት ክልል' : 'Weight Range'} ({filters.weightRange[0]} - {filters.weightRange[1]} kg)
              </label>
              <Slider
                value={filters.weightRange}
                onValueChange={(value) => updateFilter('weightRange', value as [number, number])}
                max={1000}
                min={0}
                step={10}
                className="w-full"
              />
            </div>

            {/* Price Range */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'የዋጋ ክልል' : 'Price Range'} (₹{filters.priceRange[0]} - ₹{filters.priceRange[1]})
              </label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                max={100000}
                min={0}
                step={1000}
                className="w-full"
              />
            </div>

            {/* Location */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{language === 'am' ? 'ቦታ' : 'Location'}</span>
              </label>
              <Input
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                placeholder={language === 'am' ? 'ቦታ ይፈልጉ...' : 'Search location...'}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium flex items-center space-x-1 sm:space-x-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{language === 'am' ? 'ከ ቀን' : 'From Date'}</span>
                </label>
                <Input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, from: e.target.value })}
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">
                  {language === 'am' ? 'እስከ ቀን' : 'To Date'}
                </label>
                <Input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, to: e.target.value })}
                  className="h-8 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Vet Verified */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">
                {language === 'am' ? 'የዶክተር ማረጋገጫ' : 'Veterinary Verification'}
              </label>
              <Select value={filters.isVetVerified} onValueChange={(value) => updateFilter('isVetVerified', value)}>
                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'am' ? 'ሁሉም' : 'All'}</SelectItem>
                  <SelectItem value="verified">✅ {language === 'am' ? 'የተረጋገጠ' : 'Verified'}</SelectItem>
                  <SelectItem value="unverified">❌ {language === 'am' ? 'ያልተረጋገጠ' : 'Not Verified'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 sm:space-x-3 pt-2 sm:pt-4 border-t">
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="flex-1 h-8 sm:h-10 text-xs sm:text-sm"
              >
                {language === 'am' ? 'ዳግም አስጀምር' : 'Reset Filters'}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-green-600 hover:bg-green-700 h-8 sm:h-10 text-xs sm:text-sm"
              >
                {language === 'am' ? 'ፍለጋ ተግብር' : 'Apply Filters'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
