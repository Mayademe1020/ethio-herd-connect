import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Demo Mode Context for Exhibition Readiness
 *
 * Provides demo mode functionality to speed up demonstrations by:
 * - Pre-filling forms with realistic data
 * - Using placeholder images instead of uploads
 * - Speeding up animations and transitions
 * - Providing keyboard shortcut toggle (Ctrl+Shift+D)
 */

export type DemoDataType =
  | 'animal_name'
  | 'milk_amount'
  | 'listing_price'
  | 'listing_description'
  | 'location'
  | 'phone'
  | 'farm_name'
  | 'animal_type'
  | 'animal_subtype';

export interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  getDemoData: (type: DemoDataType) => any;
  getRandomDemoData: (type: DemoDataType) => any;
}

const DEMO_DATA_POOLS = {
  animal_name: [
    'Chaltu', 'Beza', 'Abebe', 'Tigist', 'Kebede', 'Mulu', 'Dawit', 'Hana',
    'Solomon', 'Marta', 'Yosef', 'Sara', 'Girma', 'Eleni', 'Tadesse', 'Meseret'
  ],
  milk_amount: [3, 5, 7, 4, 6, 8],
  listing_price: [15000, 25000, 35000, 20000, 30000, 40000],
  listing_description: [
    'Healthy dairy cow, good milk production',
    'Strong working ox for farming',
    'Young goat with excellent health',
    'Purebred sheep for breeding',
    'Well-trained calf ready for growth'
  ],
  location: [
    'Bahir Dar, Amhara',
    'Addis Ababa',
    'Hawassa, SNNPR',
    'Mekelle, Tigray',
    'Gondar, Amhara',
    'Dire Dawa',
    'Jimma, Oromia'
  ],
  phone: [
    '+251911111111',
    '+251922222222',
    '+251933333333',
    '+251944444444'
  ],
  farm_name: [
    'Green Valley Farm',
    'Mountain View Ranch',
    'River Bend Dairy',
    'Highland Pasture',
    'Sunrise Agriculture'
  ],
  animal_type: ['cattle', 'goat', 'sheep'],
  animal_subtype: ['Cow', 'Bull', 'Ox', 'Calf', 'Male', 'Female', 'Ewe', 'Ram', 'Lamb']
} as const;

const DEMO_MODE_STORAGE_KEY = 'ethio-herd-demo-mode';

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

interface DemoModeProviderProps {
  children: ReactNode;
}

export const DemoModeProvider: React.FC<DemoModeProviderProps> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Load demo mode state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    if (stored === 'true') {
      setIsDemoMode(true);
    }
  }, []);

  // Keyboard shortcut handler (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDemoMode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const toggleDemoMode = () => {
    const newState = !isDemoMode;
    setIsDemoMode(newState);

    // Persist to localStorage
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, newState.toString());

    // Log for debugging
    console.log(`Demo mode ${newState ? 'enabled' : 'disabled'}`);
  };

  const getDemoData = (type: DemoDataType): any => {
    const pool = DEMO_DATA_POOLS[type];
    if (!pool) return null;

    // Return first item as default
    return pool[0];
  };

  const getRandomDemoData = (type: DemoDataType): any => {
    const pool = DEMO_DATA_POOLS[type];
    if (!pool) return null;

    // Return random item from pool
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  };

  const value: DemoModeContextType = {
    isDemoMode,
    toggleDemoMode,
    getDemoData,
    getRandomDemoData
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = (): DemoModeContextType => {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};

export default DemoModeContext;