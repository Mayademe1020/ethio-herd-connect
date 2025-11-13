import React from 'react';
import { useDemoMode } from '@/contexts/DemoModeContext';

/**
 * Demo Mode Indicator Component
 *
 * Shows a floating badge in the top-right corner when demo mode is enabled.
 * Provides visual feedback that the app is in demo mode for exhibitions.
 */

export const DemoModeIndicator: React.FC = () => {
  const { isDemoMode } = useDemoMode();

  if (!isDemoMode) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg border-2 border-yellow-500 animate-pulse">
      🎬 DEMO MODE
    </div>
  );
};

export default DemoModeIndicator;