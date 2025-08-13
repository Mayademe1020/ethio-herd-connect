
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';

interface EthiopianDatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
}

// Ethiopian calendar conversion utilities
const convertToEthiopian = (gregorianDate: Date) => {
  const greg = new Date(gregorianDate);
  const year = greg.getFullYear();
  const month = greg.getMonth() + 1;
  const day = greg.getDate();
  
  // Basic Ethiopian calendar conversion (simplified)
  // Ethiopian year starts on September 11 (or 12 in leap years)
  let ethYear = year - 7;
  let ethMonth = month + 4;
  let ethDay = day;
  
  if (ethMonth > 13) {
    ethMonth -= 13;
    ethYear += 1;
  }
  
  if (ethMonth > 12) {
    ethMonth = 13;
    ethDay = Math.min(ethDay, 5); // 13th month has only 5-6 days
  }
  
  return { year: ethYear, month: ethMonth, day: ethDay };
};

const formatEthiopianDate = (date: Date) => {
  const eth = convertToEthiopian(date);
  const months = [
    'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
    'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
  ];
  
  return `${eth.day} ${months[eth.month - 1]} ${eth.year}`;
};

export const EthiopianDatePicker: React.FC<EthiopianDatePickerProps> = ({
  date,
  onDateChange,
  placeholder
}) => {
  const { language } = useLanguage();
  
  const getDisplayDate = () => {
    if (!date) return null;
    
    if (language === 'am') {
      return formatEthiopianDate(date);
    }
    
    return format(date, "PPP");
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    switch (language) {
      case 'am':
        return 'ቀን ይምረጡ';
      case 'or':
        return 'Guyyaa filadhu';
      case 'sw':
        return 'Chagua tarehe';
      default:
        return 'Pick a date';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? getDisplayDate() : (
            <span>{getPlaceholder()}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};
