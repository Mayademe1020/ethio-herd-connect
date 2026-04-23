/**
 * useDeviceCapability Hook
 * 
 * Detects device capabilities for muzzle identification ML inference.
 * Determines whether to run ML locally or fall back to server-side processing.
 * 
 * Requirements: 9.1, 9.2, 9.4
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DeviceCapability, InferenceMode } from '@/types/muzzle';

// Minimum requirements for local ML inference
const MIN_RAM_FOR_LOCAL_ML = 2; // GB
const MIN_RAM_FOR_OPTIMAL_ML = 4; // GB

// Battery thresholds
const LOW_BATTERY_THRESHOLD = 0.2; // 20%
const CRITICAL_BATTERY_THRESHOLD = 0.1; // 10%

export interface UseDeviceCapabilityReturn {
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
  /** Whether device can run ML locally */
  canRunLocally: boolean;
  /** Error during assessment, if any */
  error: string | null;
}

/**
 * Detect WebGL availability and version
 */
function detectWebGL(): { available: boolean; version: number } {
  try {
    const canvas = document.createElement('canvas');
    
    // Try WebGL 2 first
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      return { available: true, version: 2 };
    }
    
    // Fall back to WebGL 1
    const gl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl1) {
      return { available: true, version: 1 };
    }
    
    return { available: false, version: 0 };
  } catch {
    return { available: false, version: 0 };
  }
}

/**
 * Estimate device RAM using navigator.deviceMemory
 * Falls back to heuristics if not available
 */
function estimateDeviceRAM(): number {
  // Use deviceMemory API if available (Chrome, Edge, Opera)
  if ('deviceMemory' in navigator) {
    return (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 2;
  }
  
  // Heuristic based on hardware concurrency
  const cores = navigator.hardwareConcurrency || 2;
  
  // Rough estimation: more cores usually means more RAM
  if (cores >= 8) return 4;
  if (cores >= 4) return 3;
  if (cores >= 2) return 2;
  return 1;
}

/**
 * Determine GPU tier based on WebGL capabilities
 */
function detectGPUTier(): 'low' | 'medium' | 'high' {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) return 'low';
    
    // Get renderer info
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      const rendererLower = renderer?.toLowerCase() || '';
      
      // High-end GPU indicators
      if (
        rendererLower.includes('nvidia') ||
        rendererLower.includes('geforce') ||
        rendererLower.includes('radeon') ||
        rendererLower.includes('adreno 6') ||
        rendererLower.includes('mali-g7') ||
        rendererLower.includes('apple')
      ) {
        return 'high';
      }
      
      // Medium GPU indicators
      if (
        rendererLower.includes('adreno 5') ||
        rendererLower.includes('mali-g5') ||
        rendererLower.includes('mali-t') ||
        rendererLower.includes('intel')
      ) {
        return 'medium';
      }
    }
    
    // Check max texture size as a capability indicator
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (maxTextureSize >= 16384) return 'high';
    if (maxTextureSize >= 8192) return 'medium';
    
    return 'low';
  } catch {
    return 'low';
  }
}

/**
 * Get battery level and charging status
 */
async function getBatteryInfo(): Promise<{ level: number; isCharging: boolean } | null> {
  try {
    if ('getBattery' in navigator) {
      const battery = await (navigator as Navigator & { 
        getBattery: () => Promise<{ level: number; charging: boolean }> 
      }).getBattery();
      
      return {
        level: battery.level,
        isCharging: battery.charging
      };
    }
  } catch {
    // Battery API not available or failed
  }
  return null;
}

/**
 * Detect if device is in low power mode
 * Uses various heuristics since there's no direct API
 */
function detectLowPowerMode(batteryLevel: number | undefined, isCharging: boolean): boolean {
  // If battery is low and not charging, assume low power mode
  if (batteryLevel !== undefined && !isCharging) {
    if (batteryLevel < CRITICAL_BATTERY_THRESHOLD) return true;
    if (batteryLevel < LOW_BATTERY_THRESHOLD) return true;
  }
  
  // Check for reduced motion preference (often enabled in low power mode)
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return true;
  }
  
  return false;
}

/**
 * Determine recommended inference mode based on device capabilities
 */
function determineRecommendedMode(
  hasWebGL: boolean,
  estimatedRAM: number,
  gpuTier: 'low' | 'medium' | 'high',
  isLowPowerMode: boolean
): 'local' | 'server' | 'lite' {
  // If in low power mode, prefer server to save battery
  if (isLowPowerMode) {
    return 'server';
  }
  
  // No WebGL means we can't run TensorFlow.js efficiently
  if (!hasWebGL) {
    return 'server';
  }
  
  // Check RAM requirements
  if (estimatedRAM < MIN_RAM_FOR_LOCAL_ML) {
    return 'lite'; // Lite mode with reduced features
  }
  
  // Low GPU tier with minimal RAM
  if (gpuTier === 'low' && estimatedRAM < MIN_RAM_FOR_OPTIMAL_ML) {
    return 'lite';
  }
  
  // Good enough for local inference
  if (estimatedRAM >= MIN_RAM_FOR_LOCAL_ML && (gpuTier === 'medium' || gpuTier === 'high')) {
    return 'local';
  }
  
  // Default to local if we have WebGL and enough RAM
  if (hasWebGL && estimatedRAM >= MIN_RAM_FOR_LOCAL_ML) {
    return 'local';
  }
  
  return 'server';
}

/**
 * Hook for detecting device capabilities for ML inference
 */
export function useDeviceCapability(): UseDeviceCapabilityReturn {
  const [capability, setCapability] = useState<DeviceCapability>({
    canRunMLLocally: false,
    hasWebGL: false,
    estimatedRAM: 2,
    gpuTier: 'low',
    recommendedMode: 'server',
    batteryLevel: undefined,
    isLowPowerMode: false
  });
  
  const [isAssessing, setIsAssessing] = useState(true);
  const [inferenceMode, setInferenceModeState] = useState<InferenceMode>('server');
  const [error, setError] = useState<string | null>(null);
  
  // Track battery listener for cleanup
  const batteryRef = useRef<{ 
    battery: { 
      addEventListener: (event: string, handler: () => void) => void;
      removeEventListener: (event: string, handler: () => void) => void;
    } | null;
    handler: (() => void) | null;
  }>({ battery: null, handler: null });

  /**
   * Assess device capabilities
   */
  const assessCapabilities = useCallback(async (): Promise<DeviceCapability> => {
    // Detect WebGL
    const webglInfo = detectWebGL();
    const hasWebGL = webglInfo.available;
    
    // Estimate RAM
    const estimatedRAM = estimateDeviceRAM();
    
    // Detect GPU tier
    const gpuTier = detectGPUTier();
    
    // Get battery info
    const batteryInfo = await getBatteryInfo();
    const batteryLevel = batteryInfo?.level;
    const isCharging = batteryInfo?.isCharging ?? false;
    
    // Detect low power mode
    const isLowPowerMode = detectLowPowerMode(batteryLevel, isCharging);
    
    // Determine recommended mode
    const recommendedMode = determineRecommendedMode(
      hasWebGL,
      estimatedRAM,
      gpuTier,
      isLowPowerMode
    );
    
    // Can run locally if we have WebGL and enough RAM
    const canRunMLLocally = hasWebGL && estimatedRAM >= MIN_RAM_FOR_LOCAL_ML && !isLowPowerMode;
    
    return {
      canRunMLLocally,
      hasWebGL,
      estimatedRAM,
      gpuTier,
      recommendedMode,
      batteryLevel,
      isLowPowerMode
    };
  }, []);

  /**
   * Re-assess capabilities (useful when conditions change)
   */
  const reassess = useCallback(async () => {
    setIsAssessing(true);
    setError(null);
    
    try {
      const newCapability = await assessCapabilities();
      setCapability(newCapability);
      
      // Update inference mode based on new assessment
      if (newCapability.recommendedMode === 'lite') {
        setInferenceModeState('server'); // Lite mode uses server
      } else {
        setInferenceModeState(newCapability.recommendedMode as InferenceMode);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assess device capabilities');
    } finally {
      setIsAssessing(false);
    }
  }, [assessCapabilities]);

  /**
   * Set inference mode manually
   */
  const setInferenceMode = useCallback((mode: InferenceMode) => {
    // Only allow local mode if device supports it
    if (mode === 'local' && !capability.canRunMLLocally) {
      console.warn('Device cannot run ML locally, keeping server mode');
      return;
    }
    setInferenceModeState(mode);
  }, [capability.canRunMLLocally]);

  // Initial assessment on mount
  useEffect(() => {
    reassess();
  }, [reassess]);

  // Listen for battery changes
  useEffect(() => {
    const setupBatteryListener = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as Navigator & { 
            getBattery: () => Promise<{
              level: number;
              charging: boolean;
              addEventListener: (event: string, handler: () => void) => void;
              removeEventListener: (event: string, handler: () => void) => void;
            }> 
          }).getBattery();
          
          const handleBatteryChange = () => {
            reassess();
          };
          
          battery.addEventListener('levelchange', handleBatteryChange);
          battery.addEventListener('chargingchange', handleBatteryChange);
          
          batteryRef.current = { battery, handler: handleBatteryChange };
        }
      } catch {
        // Battery API not available
      }
    };
    
    setupBatteryListener();
    
    return () => {
      if (batteryRef.current.battery && batteryRef.current.handler) {
        batteryRef.current.battery.removeEventListener('levelchange', batteryRef.current.handler);
        batteryRef.current.battery.removeEventListener('chargingchange', batteryRef.current.handler);
      }
    };
  }, [reassess]);

  // Listen for reduced motion preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      reassess();
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [reassess]);

  return {
    capability,
    isAssessing,
    reassess,
    inferenceMode,
    setInferenceMode,
    canRunLocally: capability.canRunMLLocally,
    error
  };
}

export default useDeviceCapability;
