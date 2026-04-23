/**
 * DeviceCapabilityContext
 * 
 * Provides device capability information throughout the app for muzzle identification.
 * Stores capability assessment results and provides inference mode toggle.
 * Handles capability changes (battery, etc.) automatically.
 * 
 * Requirements: 9.3, 9.4
 */

import React, { createContext, useContext, useCallback, useMemo, ReactNode } from 'react';
import { useDeviceCapability, UseDeviceCapabilityReturn } from '@/hooks/useDeviceCapability';
import type { DeviceCapability, InferenceMode } from '@/types/muzzle';

// ============================================================================
// Context Types
// ============================================================================

export interface DeviceCapabilityContextValue {
  /** Current device capability assessment */
  capability: DeviceCapability;
  
  /** Whether capability assessment is in progress */
  isAssessing: boolean;
  
  /** Re-assess device capabilities */
  reassess: () => Promise<void>;
  
  /** Current inference mode (local or server) */
  inferenceMode: InferenceMode;
  
  /** Manually set inference mode */
  setInferenceMode: (mode: InferenceMode) => void;
  
  /** Toggle between local and server inference */
  toggleInferenceMode: () => void;
  
  /** Whether device can run ML locally */
  canRunLocally: boolean;
  
  /** Error during assessment, if any */
  error: string | null;
  
  /** Get human-readable capability summary */
  getCapabilitySummary: () => CapabilitySummary;
  
  /** Check if device meets minimum requirements */
  meetsMinimumRequirements: boolean;
}

export interface CapabilitySummary {
  /** Overall device tier */
  tier: 'low' | 'medium' | 'high';
  /** Human-readable description */
  description: string;
  /** Amharic description */
  descriptionAm: string;
  /** Recommendations for the user */
  recommendations: string[];
  /** Amharic recommendations */
  recommendationsAm: string[];
}

interface DeviceCapabilityProviderProps {
  children: ReactNode;
}

// ============================================================================
// Context Creation
// ============================================================================

const DeviceCapabilityContext = createContext<DeviceCapabilityContextValue | null>(null);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determine overall device tier based on capabilities
 */
function determineDeviceTier(capability: DeviceCapability): 'low' | 'medium' | 'high' {
  const { hasWebGL, estimatedRAM, gpuTier } = capability;
  
  // High tier: WebGL + 4GB+ RAM + medium/high GPU
  if (hasWebGL && estimatedRAM >= 4 && (gpuTier === 'medium' || gpuTier === 'high')) {
    return 'high';
  }
  
  // Medium tier: WebGL + 2GB+ RAM
  if (hasWebGL && estimatedRAM >= 2) {
    return 'medium';
  }
  
  // Low tier: everything else
  return 'low';
}

/**
 * Generate capability summary with descriptions
 */
function generateCapabilitySummary(
  capability: DeviceCapability,
  inferenceMode: InferenceMode
): CapabilitySummary {
  const tier = determineDeviceTier(capability);
  
  const summaries: Record<'low' | 'medium' | 'high', {
    description: string;
    descriptionAm: string;
    recommendations: string[];
    recommendationsAm: string[];
  }> = {
    high: {
      description: 'Your device has excellent capabilities for muzzle identification.',
      descriptionAm: 'መሳሪያዎ ለአፍንጫ መለያ በጣም ጥሩ አቅም አለው።',
      recommendations: [
        'Local processing is recommended for fastest results',
        'All features are available'
      ],
      recommendationsAm: [
        'ለፈጣን ውጤት የአካባቢ ሂደት ይመከራል',
        'ሁሉም ባህሪያት ይገኛሉ'
      ]
    },
    medium: {
      description: 'Your device can handle muzzle identification with good performance.',
      descriptionAm: 'መሳሪያዎ የአፍንጫ መለያን በጥሩ አፈጻጸም ማስተናገድ ይችላል።',
      recommendations: [
        'Local processing available but may be slower',
        'Consider server processing for better battery life'
      ],
      recommendationsAm: [
        'የአካባቢ ሂደት ይገኛል ግን ቀርፋፋ ሊሆን ይችላል',
        'ለተሻለ ባትሪ ህይወት የሰርቨር ሂደትን ያስቡ'
      ]
    },
    low: {
      description: 'Your device will use server processing for best results.',
      descriptionAm: 'መሳሪያዎ ለተሻለ ውጤት የሰርቨር ሂደትን ይጠቀማል።',
      recommendations: [
        'Server processing is recommended',
        'Ensure stable internet connection',
        'Captures will be queued when offline'
      ],
      recommendationsAm: [
        'የሰርቨር ሂደት ይመከራል',
        'የተረጋጋ የኢንተርኔት ግንኙነት ያረጋግጡ',
        'ከመስመር ውጭ ሲሆኑ ቀረጻዎች ወረፋ ይደረጋሉ'
      ]
    }
  };
  
  const summary = summaries[tier];
  
  // Add battery-specific recommendations
  if (capability.isLowPowerMode) {
    summary.recommendations.push('Low power mode detected - using server processing');
    summary.recommendationsAm.push('ዝቅተኛ ኃይል ሁነታ ተገኝቷል - የሰርቨር ሂደትን በመጠቀም ላይ');
  }
  
  if (capability.batteryLevel !== undefined && capability.batteryLevel < 0.2) {
    summary.recommendations.push('Battery is low - consider charging before capture');
    summary.recommendationsAm.push('ባትሪ ዝቅተኛ ነው - ከመቅረጽ በፊት መሙላት ያስቡ');
  }
  
  return {
    tier,
    ...summary
  };
}

// ============================================================================
// Provider Component
// ============================================================================

export function DeviceCapabilityProvider({ children }: DeviceCapabilityProviderProps) {
  const {
    capability,
    isAssessing,
    reassess,
    inferenceMode,
    setInferenceMode,
    canRunLocally,
    error
  }: UseDeviceCapabilityReturn = useDeviceCapability();

  /**
   * Toggle between local and server inference modes
   */
  const toggleInferenceMode = useCallback(() => {
    if (inferenceMode === 'local') {
      setInferenceMode('server');
    } else if (canRunLocally) {
      setInferenceMode('local');
    }
    // If can't run locally, stay on server
  }, [inferenceMode, canRunLocally, setInferenceMode]);

  /**
   * Get human-readable capability summary
   */
  const getCapabilitySummary = useCallback((): CapabilitySummary => {
    return generateCapabilitySummary(capability, inferenceMode);
  }, [capability, inferenceMode]);

  /**
   * Check if device meets minimum requirements for any muzzle features
   */
  const meetsMinimumRequirements = useMemo(() => {
    // Minimum: must have camera access capability (assumed if browser supports getUserMedia)
    // and either WebGL for local or network for server
    return typeof navigator !== 'undefined' && 
           typeof navigator.mediaDevices !== 'undefined' &&
           typeof navigator.mediaDevices.getUserMedia === 'function';
  }, []);

  const contextValue = useMemo<DeviceCapabilityContextValue>(() => ({
    capability,
    isAssessing,
    reassess,
    inferenceMode,
    setInferenceMode,
    toggleInferenceMode,
    canRunLocally,
    error,
    getCapabilitySummary,
    meetsMinimumRequirements
  }), [
    capability,
    isAssessing,
    reassess,
    inferenceMode,
    setInferenceMode,
    toggleInferenceMode,
    canRunLocally,
    error,
    getCapabilitySummary,
    meetsMinimumRequirements
  ]);

  return (
    <DeviceCapabilityContext.Provider value={contextValue}>
      {children}
    </DeviceCapabilityContext.Provider>
  );
}

// ============================================================================
// Hook for consuming context
// ============================================================================

/**
 * Hook to access device capability context
 * Must be used within DeviceCapabilityProvider
 */
export function useDeviceCapabilityContext(): DeviceCapabilityContextValue {
  const context = useContext(DeviceCapabilityContext);
  
  if (!context) {
    throw new Error(
      'useDeviceCapabilityContext must be used within a DeviceCapabilityProvider'
    );
  }
  
  return context;
}

// ============================================================================
// Utility Components
// ============================================================================

interface DeviceCapabilityGateProps {
  /** Content to show when device meets requirements */
  children: ReactNode;
  /** Content to show when device doesn't meet requirements */
  fallback?: ReactNode;
  /** Minimum tier required */
  minTier?: 'low' | 'medium' | 'high';
  /** Require local ML capability */
  requireLocalML?: boolean;
}

/**
 * Gate component that conditionally renders based on device capabilities
 */
export function DeviceCapabilityGate({
  children,
  fallback = null,
  minTier = 'low',
  requireLocalML = false
}: DeviceCapabilityGateProps) {
  const { capability, canRunLocally, isAssessing } = useDeviceCapabilityContext();
  
  if (isAssessing) {
    return null; // Or a loading indicator
  }
  
  const deviceTier = determineDeviceTier(capability);
  const tierOrder = { low: 0, medium: 1, high: 2 };
  
  const meetsTierRequirement = tierOrder[deviceTier] >= tierOrder[minTier];
  const meetsLocalMLRequirement = !requireLocalML || canRunLocally;
  
  if (meetsTierRequirement && meetsLocalMLRequirement) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

export default DeviceCapabilityContext;
