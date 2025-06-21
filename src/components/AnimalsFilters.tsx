
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnimalsFiltersProps {
  language: 'am' | 'en';
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
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          placeholder={language === 'am' ? 'እንስሳት ይፈልጉ...' : 'Search animals...'}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder={language === 'am' ? 'አይነት' : 'Type'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {language === 'am' ? 'ሁሉም' : 'All'}
            </SelectItem>
            <SelectItem value="cattle">
              {language === 'am' ? 'ከብት' : 'Cattle'}
            </SelectItem>
            <SelectItem value="poultry">
              {language === 'am' ? 'ዶሮ' : 'Poultry'}
            </SelectItem>
            <SelectItem value="goat">
              {language === 'am' ? 'ፍየል' : 'Goat'}
            </SelectItem>
            <SelectItem value="sheep">
              {language === 'am' ? 'በግ' : 'Sheep'}
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={healthFilter} onValueChange={onHealthFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder={language === 'am' ? 'ጤንነት' : 'Health'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {language === 'am' ? 'ሁሉም' : 'All'}
            </SelectItem>
            <SelectItem value="healthy">
              {language === 'am' ? 'ጤናማ' : 'Healthy'}
            </SelectItem>
            <SelectItem value="attention">
              {language === 'am' ? 'ትኩረት' : 'Attention'}
            </SelectItem>
            <SelectItem value="sick">
              {language === 'am' ? 'ታማሚ' : 'Sick'}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
