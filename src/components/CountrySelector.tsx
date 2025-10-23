import React from 'react';
import { useCountry } from '@/contexts/CountryContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const CountrySelector: React.FC = () => {
  const { country, setCountry, getCountryFlag, getCountryName } = useCountry();
  const options: Array<'ET' | 'KE' | 'UG' | 'TZ' | 'RW'> = ['ET', 'KE', 'UG', 'TZ', 'RW'];

  return (
    <Select value={country} onValueChange={(val) => setCountry(val as any)}>
      <SelectTrigger className="w-auto min-w-[170px] h-9 border-emerald-200 bg-white/90">
        <SelectValue>
          <div className="flex items-center space-x-2">
            <span className="text-lg leading-none">{getCountryFlag(country)}</span>
            <span className="text-sm font-medium text-gray-700">{getCountryName(country)}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((code) => (
          <SelectItem key={code} value={code}>
            <div className="flex items-center space-x-2">
              <span className="text-lg leading-none">{getCountryFlag(code)}</span>
              <span className="text-sm font-medium">{getCountryName(code)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};