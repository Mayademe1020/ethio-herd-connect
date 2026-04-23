// src/contexts/OnboardingContext.tsx
// Single context handles: Tour + Wizard + Help
// Smart detection: No DB changes needed!
// OPTIMIZED: Removed unnecessary useCallback hooks

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { 
  tourSteps, 
  wizardSteps, 
  STORAGE_KEYS
} from '@/config/onboarding.config';

interface OnboardingState {
  // Tour state
  isTourActive: boolean;
  currentTourStep: number;
  hasCompletedTour: boolean;
  hasSkippedTour: boolean;
  
  // Wizard state
  isWizardActive: boolean;
  currentWizardStep: number;
  hasCompletedWizard: boolean;
  wizardData: Record<string, any>;
  
  // Help state
  dismissedHelp: string[];
}

interface OnboardingContextType extends OnboardingState {
  // Tour actions
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  
  // Wizard actions
  startWizard: () => void;
  nextWizardStep: () => void;
  prevWizardStep: () => void;
  updateWizardData: (data: Record<string, any>) => void;
  completeWizard: () => void;
  
  // Help actions
  dismissHelp: (key: string) => void;
  isHelpDismissed: (key: string) => boolean;
  resetOnboarding: () => void;
  
  // Detection
  shouldShowOnboarding: boolean;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Load initial state from localStorage - extracted for SSR safety
const loadInitialState = (): OnboardingState => {
  if (typeof window === 'undefined') {
    return {
      isTourActive: false,
      currentTourStep: 0,
      hasCompletedTour: false,
      hasSkippedTour: false,
      isWizardActive: false,
      currentWizardStep: 0,
      hasCompletedWizard: false,
      wizardData: {},
      dismissedHelp: []
    };
  }
  
  return {
    isTourActive: false,
    currentTourStep: 0,
    hasCompletedTour: localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true',
    hasSkippedTour: localStorage.getItem(STORAGE_KEYS.ONBOARDING_SKIPPED) === 'true',
    isWizardActive: false,
    currentWizardStep: 0,
    hasCompletedWizard: localStorage.getItem(STORAGE_KEYS.WIZARD_COMPLETED) === 'true',
    wizardData: {},
    dismissedHelp: JSON.parse(localStorage.getItem(STORAGE_KEYS.HELP_DISMISSED) || '[]')
  };
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>(loadInitialState);

  // Fetch animal count for smart detection
  const { data: animalCount = 0, isLoading: isCountLoading } = useQuery({
    queryKey: ['animal-count-onboarding', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { count, error } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching animal count:', error);
        return 0;
      }
      
      return count || 0;
    },
    enabled: !!user,
    staleTime: 60000 // 1 minute
  });

  // Smart detection: Should we show onboarding?
  const shouldShowOnboarding = !state.hasCompletedTour && 
                                !state.hasSkippedTour && 
                                !state.hasCompletedWizard &&
                                animalCount === 0 &&
                                !isCountLoading;

  // Tour Actions - No useCallback needed as these are passed to context
  const startTour = () => {
    setState(prev => ({
      ...prev,
      isTourActive: true,
      isWizardActive: false,
      currentTourStep: 0
    }));
  };

  const nextTourStep = () => {
    setState(prev => {
      const nextStep = prev.currentTourStep + 1;
      if (nextStep >= tourSteps.length) {
        localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
        return {
          ...prev,
          isTourActive: false,
          hasCompletedTour: true,
          currentTourStep: 0
        };
      }
      return { ...prev, currentTourStep: nextStep };
    });
  };

  const prevTourStep = () => {
    setState(prev => ({
      ...prev,
      currentTourStep: Math.max(0, prev.currentTourStep - 1)
    }));
  };

  const skipTour = () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_SKIPPED, 'true');
    setState(prev => ({
      ...prev,
      isTourActive: false,
      hasSkippedTour: true
    }));
  };

  const completeTour = () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    setState(prev => ({
      ...prev,
      isTourActive: false,
      hasCompletedTour: true
    }));
  };

  // Wizard Actions
  const startWizard = () => {
    setState(prev => ({
      ...prev,
      isWizardActive: true,
      isTourActive: false,
      currentWizardStep: 0,
      wizardData: {}
    }));
  };

  const nextWizardStep = () => {
    setState(prev => {
      const nextStep = prev.currentWizardStep + 1;
      if (nextStep >= wizardSteps.length) {
        return prev;
      }
      return { ...prev, currentWizardStep: nextStep };
    });
  };

  const prevWizardStep = () => {
    setState(prev => ({
      ...prev,
      currentWizardStep: Math.max(0, prev.currentWizardStep - 1)
    }));
  };

  const updateWizardData = (data: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      wizardData: { ...prev.wizardData, ...data }
    }));
  };

  const completeWizard = () => {
    localStorage.setItem(STORAGE_KEYS.WIZARD_COMPLETED, 'true');
    setState(prev => ({
      ...prev,
      isWizardActive: false,
      hasCompletedWizard: true
    }));
  };

  // Help Actions
  const dismissHelp = (key: string) => {
    setState(prev => {
      const newDismissed = [...prev.dismissedHelp, key];
      localStorage.setItem(STORAGE_KEYS.HELP_DISMISSED, JSON.stringify(newDismissed));
      return { ...prev, dismissedHelp: newDismissed };
    });
  };

  const isHelpDismissed = (key: string) => {
    return state.dismissedHelp.includes(key);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_SKIPPED);
    localStorage.removeItem(STORAGE_KEYS.WIZARD_COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.HELP_DISMISSED);
    setState({
      isTourActive: false,
      currentTourStep: 0,
      hasCompletedTour: false,
      hasSkippedTour: false,
      isWizardActive: false,
      currentWizardStep: 0,
      hasCompletedWizard: false,
      wizardData: {},
      dismissedHelp: []
    });
  };

  // Auto-start wizard for first-time users with no animals
  useEffect(() => {
    if (shouldShowOnboarding && !state.isWizardActive && !state.isTourActive) {
      const timer = setTimeout(() => {
        startWizard();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowOnboarding, state.isWizardActive, state.isTourActive]);

  const value: OnboardingContextType = {
    ...state,
    startTour,
    nextTourStep,
    prevTourStep,
    skipTour,
    completeTour,
    startWizard,
    nextWizardStep,
    prevWizardStep,
    updateWizardData,
    completeWizard,
    dismissHelp,
    isHelpDismissed,
    resetOnboarding,
    shouldShowOnboarding,
    isLoading: isCountLoading
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
