
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Language } from '@/types';

interface AnimalsFiltersProps {
  language: Language;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  healthFilter: string;
  onHealthFilterChange: (value: string) => void;
}

export const AnimalsFilters = ({
  language,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  healthFilter,
  onHealthFilterChange
}: AnimalsFiltersProps) => {
  const translations = {
    am: {
      search: 'ይፈልጉ...',
      allTypes: 'ሁሉም አይነቶች',
      cattle: 'ከብት',
      goat: 'ፍየል',
      sheep: 'በግ',
      poultry: 'ዶሮ',
      allHealth: 'ሁሉም ጤንነት',
      healthy: 'ጤናማ',
      sick: 'ህሙም',
      attention: 'ትኩረት ያስፈልገዋል',
      critical: 'ጣዳፊ'
    },
    en: {
      search: 'Search...',
      allTypes: 'All Types',
      cattle: 'Cattle',
      goat: 'Goat',
      sheep: 'Sheep',
      poultry: 'Poultry',
      allHealth: 'All Health',
      healthy: 'Healthy',
      sick: 'Sick',
      attention: 'Needs Attention',
      critical: 'Critical'
    },
    or: {
      search: 'Barbaadi...',
      allTypes: 'Gosootan Hundaa',
      cattle: 'Loon',
      goat: 'Re\'ee',
      sheep: 'Hoolaa',
      poultry: 'Lukku',
      allHealth: 'Fayyaa Hundaa',
      healthy: 'Fayyaa',
      sick: 'Dhukkubsaa',
      attention: 'Xiyyeeffannoo Barbaada',
      critical: 'Baay\'ee Hamaa'
    },
    sw: {
      search: 'Tafuta...',
      allTypes: 'Aina Zote',
      cattle: 'Ng\'ombe',
      goat: 'Mbuzi',
      sheep: 'Kondoo',
      poultry: 'Kuku',
      allHealth: 'Afya Zote',
      healthy: 'Mzuri',
      sick: 'Mgonjwa',
      attention: 'Anahitaji Umakini',
      critical: 'Hatari'
    }
  };

  const t = translations[language];

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm">
            <SelectValue placeholder={t.allTypes} />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="all">{t.allTypes}</SelectItem>
            <SelectItem value="cattle">{t.cattle}</SelectItem>
            <SelectItem value="goat">{t.goat}</SelectItem>
            <SelectItem value="sheep">{t.sheep}</SelectItem>
            <SelectItem value="poultry">{t.poultry}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={healthFilter} onValueChange={onHealthFilterChange}>
          <SelectTrigger className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm">
            <SelectValue placeholder={t.allHealth} />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-lg z-50">
            <SelectItem value="all">{t.allHealth}</SelectItem>
            <SelectItem value="healthy">{t.healthy}</SelectItem>
            <SelectItem value="sick">{t.sick}</SelectItem>
            <SelectItem value="attention">{t.attention}</SelectItem>
            <SelectItem value="critical">{t.critical}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
