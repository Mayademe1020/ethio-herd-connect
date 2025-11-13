/**
 * Calendar Preference Context
 * Manages user's calendar system preference (Gregorian or Ethiopian)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { logger } from '@/utils/logger';

export type CalendarSystem = 'gregorian' | 'ethiopian';

interface CalendarContextType {
  calendarSystem: CalendarSystem;
  setCalendarSystem: (system: CalendarSystem) => Promise<void>;
  isLoading: boolean;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [calendarSystem, setCalendarSystemState] = useState<CalendarSystem>('gregorian');
  const [isLoading, setIsLoading] = useState(true);

  // Load user's calendar preference from localStorage
  useEffect(() => {
    const loadCalendarPreference = () => {
      try {
        const saved = localStorage.getItem('calendar_preference');
        if (saved === 'gregorian' || saved === 'ethiopian') {
          setCalendarSystemState(saved);
        } else {
          // Default to Gregorian
          setCalendarSystemState('gregorian');
        }
      } catch (error) {
        logger.error('Error loading calendar preference', error);
        setCalendarSystemState('gregorian');
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendarPreference();
  }, []);

  // Save calendar preference to localStorage
  const setCalendarSystem = async (system: CalendarSystem) => {
    try {
      setCalendarSystemState(system);
      localStorage.setItem('calendar_preference', system);
      logger.info('Calendar preference updated', { system });
    } catch (error) {
      logger.error('Failed to save calendar preference', error);
      throw error;
    }
  };

  return (
    <CalendarContext.Provider
      value={{
        calendarSystem,
        setCalendarSystem,
        isLoading,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
