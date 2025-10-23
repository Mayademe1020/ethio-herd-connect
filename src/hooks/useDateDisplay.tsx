/**
 * Date Display Hook
 * Automatically formats dates based on user's calendar preference
 * USE THIS EVERYWHERE you display dates!
 */

import { useCalendar } from '@/contexts/CalendarContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEthiopianDate } from '@/utils/ethiopianCalendar';
import { format } from 'date-fns';

export const useDateDisplay = () => {
  const { calendarSystem } = useCalendar();
  const { language } = useLanguage();

  /**
   * Format a date according to user's calendar preference
   * @param date - Date to format
   * @param formatStyle - 'short' (01/15/2023) or 'long' (January 15, 2023)
   */
  const formatDate = (
    date: Date | string | null | undefined,
    formatStyle: 'short' | 'long' = 'long'
  ): string => {
    if (!date) return '';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        return '';
      }

      if (calendarSystem === 'ethiopian') {
        const lang = language === 'am' ? 'am' : 'en';
        return formatEthiopianDate(dateObj, lang, formatStyle);
      }

      // Gregorian format
      if (formatStyle === 'short') {
        return format(dateObj, 'MM/dd/yyyy');
      }
      
      // Long format based on language
      switch (language) {
        case 'am':
          return format(dateObj, 'MMMM d, yyyy');
        case 'or':
          return format(dateObj, 'MMMM d, yyyy');
        case 'sw':
          return format(dateObj, 'd MMMM yyyy');
        default:
          return format(dateObj, 'MMMM d, yyyy');
      }
    } catch (error) {
      return '';
    }
  };

  /**
   * Format a date for display in lists (shorter format)
   */
  const formatDateShort = (date: Date | string | null | undefined): string => {
    return formatDate(date, 'short');
  };

  /**
   * Format a date with time
   */
  const formatDateTime = (date: Date | string | null | undefined): string => {
    if (!date) return '';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        return '';
      }

      const dateStr = formatDate(dateObj, 'long');
      const timeStr = format(dateObj, 'h:mm a');
      
      return `${dateStr} ${timeStr}`;
    } catch (error) {
      return '';
    }
  };

  /**
   * Format a date range
   */
  const formatDateRange = (
    startDate: Date | string | null | undefined,
    endDate: Date | string | null | undefined
  ): string => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    
    if (!start && !end) return '';
    if (!start) return end;
    if (!end) return start;
    
    return `${start} - ${end}`;
  };

  /**
   * Get relative time (e.g., "2 days ago", "in 3 days")
   */
  const formatRelativeTime = (date: Date | string | null | undefined): string => {
    if (!date) return '';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays === -1) return 'Tomorrow';
      if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < -1 && diffDays > -7) return `In ${Math.abs(diffDays)} days`;
      
      return formatDate(dateObj);
    } catch (error) {
      return '';
    }
  };

  /**
   * Get calendar system label for UI
   */
  const getCalendarLabel = (): string => {
    if (calendarSystem === 'ethiopian') {
      return language === 'am' ? 'የኢትዮጵያ ዘመን አቆጣጠር' : 'Ethiopian Calendar';
    }
    return language === 'am' ? 'ግሪጎሪያን ዘመን አቆጣጠር' : 'Gregorian Calendar';
  };

  return {
    formatDate,
    formatDateShort,
    formatDateTime,
    formatDateRange,
    formatRelativeTime,
    getCalendarLabel,
    calendarSystem,
  };
};
