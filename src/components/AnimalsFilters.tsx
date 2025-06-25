
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
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
      search: 'ፈልግ...',
      allTypes: 'ሁሉም ዓይነቶች',
      cattle: 'ከብት',
      goat: 'ፍየል',
      sheep: 'በግ',
      poultry: 'ዶሮ',
      allHealth: 'ሁሉም ጤንነት',
      healthy: 'ጤናማ',
      sick: 'ታሞ',
      attention: 'ትኩረት ያስፈልጋል',
      critical: 'ወሳኝ'
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
      allTypes: 'Gosaalee Hundaa',
      cattle: 'Loon',
      goat: 'Re\'ee',
      sheep: 'Hoolaa',
      poultry: 'Lukku',
      allHealth: 'Fayyaa Hundaa',
      healthy: 'Fayyaa',
      sick: 'Dhukkuba',
      attention: 'Xiyyeeffannaa Barbaada',
      critical: 'Murteessaa'
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
      attention: 'Inahitaji Umakini',
      critical: 'Hatari'
    }
  };

  const t = translations[language];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger>
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
        <SelectTrigger>
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
  );
};
