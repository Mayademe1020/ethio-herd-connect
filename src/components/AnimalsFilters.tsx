
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Language } from '@/types';

interface AnimalsFiltersProps {
  language: Language;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  healthFilter: string;
  onHealthFilterChange: (health: string) => void;
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
      allTypes: 'ሁሉም ዓይነቶች',
      allHealth: 'ሁሉም ጤንነት',
      cattle: 'ከብት',
      goat: 'ፍየል',
      sheep: 'በግ',
      poultry: 'ዶሮ',
      healthy: 'ጤናማ',
      sick: 'ታማሚ',
      attention: 'ትኩረት ያስፈልጋል',
      critical: 'አደገኛ'
    },
    en: {
      search: 'Search...',
      allTypes: 'All Types',
      allHealth: 'All Health',
      cattle: 'Cattle',
      goat: 'Goat',
      sheep: 'Sheep',
      poultry: 'Poultry',
      healthy: 'Healthy',
      sick: 'Sick',
      attention: 'Needs Attention',
      critical: 'Critical'
    },
    or: {
      search: 'Barbaadi...',
      allTypes: 'Gosa Hundaa',
      allHealth: 'Fayyaa Hundaa',
      cattle: 'Loon',
      goat: 'Re\'ee',
      sheep: 'Hoolaa',
      poultry: 'Lukku',
      healthy: 'Fayyaa',
      sick: 'Dhukkubsaa',
      attention: 'Xalayaa Barbaada',
      critical: 'Hamaa'
    },
    sw: {
      search: 'Tafuta...',
      allTypes: 'Aina Zote',
      allHealth: 'Afya Zote',
      cattle: 'Ng\'ombe',
      goat: 'Mbuzi',
      sheep: 'Kondoo',
      poultry: 'Kuku',
      healthy: 'Mzuri',
      sick: 'Mgonjwa',
      attention: 'Inahitaji Uangalifu',
      critical: 'Hatari'
    }
  };

  const t = translations[language];

  return (
    <div className="space-y-3">
      <Input
        placeholder={t.search}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
      />
      
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm">
            <SelectValue placeholder={t.allTypes} />
          </SelectTrigger>
          <SelectContent>
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
          <SelectContent>
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
