/**
 * Calendar Preference Context
 * Manages user's calendar system preference (Gregorian or Ethiopian)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

  // Load user's calendar preference from database
  useEffect(() => {
    const loadCalendarPreference = async () => {
      if (!user) {
        // Default to Gregorian for non-authenticated users
        setCalendarSystemState('gregorian');
        setIsLoading(false);
        return;
      }

      try {
        // Try to get from farm_profiles first
        const { data: profile, error } = await supabase
          .from('farm_profiles')
          .select('calendar_preference')
          .eq('user_id', user.id)
          .single();

        if (error) {
          logger.debug('No calendar preference found, using default');
          setCalendarSystemState('gregorian');
        } else if (profile?.calendar_preference) {
          setCalendarSystemState(profile.calendar_preference as CalendarSystem);
        }
      } catch (error) {
        logger.error('Error loading calendar preference', error);
        setCalendarSystemState('gregorian');
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendarPreference();
  }, [user]);

  // Save calendar preference to database
  const setCalendarSystem = async (system: CalendarSystem) => {
    if (!user) {
      // For non-authenticated users, just update local state
      setCalendarSystemState(system);
      localStorage.setItem('calendar_preference', system);
      return;
    }

    try {
      setCalendarSystemState(system);

      // Update in database
      const { error } = await supabase
        .from('farm_profiles')
        .update({ calendar_preference: system })
        .eq('user_id', user.id);

      if (error) {
        logger.error('Error saving calendar preference', error);
        throw error;
      }

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
