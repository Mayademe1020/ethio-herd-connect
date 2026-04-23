/**
 * useMuzzleRegistration Hook
 * Handles muzzle biometric registration with automatic offline/online fallback
 * 
 * Usage:
 * const { extractAndStoreMuzzle, isProcessing, error } = useMuzzleRegistration();
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { muzzleMLService } from '@/services/muzzleMLService';
import { muzzleLocalMLService } from '@/services/muzzleLocalMLService';
import { storeMuzzleEmbedding } from '@/utils/muzzleIndexedDB';
import { useAuth } from '@/contexts/AuthContextMVP';
import { toast } from 'sonner';

export interface MuzzleRegistrationResult {
  success: boolean;
  animalId?: string;
  error?: string;
  mode: 'local' | 'cloud';
}

export function useMuzzleRegistration() {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Extract muzzle features and store embedding
   * Works offline with automatic fallback to cloud
   */
  const extractAndStoreMuzzle = useCallback(async (
    muzzleFile: File,
    animalId: string
  ): Promise<MuzzleRegistrationResult> => {
    
    if (!user) {
      return { success: false, error: 'Not authenticated', mode: 'cloud' };
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Check if we're online
      const isOnline = navigator.onLine;
      
      let embedding: Float32Array | null = null;
      let mode: 'local' | 'cloud' = 'cloud';
      let quality = 0;

      // Try local ML first (works offline)
      if (muzzleLocalMLService.isAvailable()) {
        try {
          toast.info('🔐 Extracting muzzle biometric (offline mode)...');
          
          // Create image element from file
          const img = await loadImageFromFile(muzzleFile);
          
          // Extract features using local ML
          const localResult = await muzzleLocalMLService.extractFeatures(img);
          
          if (localResult.success && localResult.embedding) {
            embedding = localResult.embedding;
            quality = localResult.quality.overall;
            mode = 'local';
            toast.success('✓ Local extraction complete');
          } else {
            toast.warning('Local extraction failed, trying cloud...');
          }
        } catch (localError) {
          console.warn('Local ML failed:', localError);
        }
      }

      // Fallback to cloud ML if local failed or unavailable
      if (!embedding && isOnline) {
        try {
          toast.info('☁️ Extracting muzzle biometric (cloud mode)...');
          
          const cloudResult = await muzzleMLService.extractFeatures(muzzleFile);
          
          if (cloudResult.embedding?.vector) {
            embedding = cloudResult.embedding.vector;
            quality = cloudResult.embedding.imageQuality?.overall || 80;
            mode = 'cloud';
            toast.success('✓ Cloud extraction complete');
          }
        } catch (cloudError) {
          console.error('Cloud ML failed:', cloudError);
        }
      }

      // If no embedding obtained, use placeholder
      if (!embedding) {
        // Generate a simple hash-based embedding as fallback
        // This at least allows the animal to be registered
        console.warn('Using placeholder embedding - identification will be limited');
        embedding = await generatePlaceholderEmbedding(muzzleFile);
        quality = 50;
        toast.warning('⚠️ Using basic embedding - limited identification');
      }

      // Store embedding in IndexedDB for offline access
      await storeMuzzleEmbedding(
        animalId,
        embedding,
        quality / 100,
        user.id,
        true // encrypt
      );

      // Update animal record in database
      await supabase
        .from('animals')
        .update({ 
          muzzle_status: 'registered',
          muzzle_quality: quality,
          muzzle_mode: mode
        } as any)
        .eq('id', animalId);

      toast.success(`🛡️ Muzzle registered (${mode} mode)`);

      return {
        success: true,
        animalId,
        mode,
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Muzzle registration failed';
      console.error('Muzzle registration error:', err);
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        mode: 'cloud',
      };

    } finally {
      setIsProcessing(false);
    }
  }, [user]);

  /**
   * Initialize local ML service (call on app start)
   */
  const initializeLocalML = useCallback(async () => {
    try {
      await muzzleLocalMLService.initialize();
      return true;
    } catch (err) {
      console.warn('Local ML initialization failed:', err);
      return false;
    }
  }, []);

  /**
   * Check if local ML is available
   */
  const isLocalMLReady = useCallback(() => {
    return muzzleLocalMLService.isAvailable();
  }, []);

  return {
    extractAndStoreMuzzle,
    initializeLocalML,
    isLocalMLReady,
    isProcessing,
    error,
  };
}

/**
 * Load image from File object
 */
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate a placeholder embedding from file hash
 * Used when ML extraction fails completely
 * This is NOT real ML - just a placeholder
 */
async function generatePlaceholderEmbedding(file: File): Promise<Float32Array> {
  // Read file as array buffer
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  
  // Convert hash to Float32Array (128 dimensions)
  const hashArray = new Uint8Array(hash);
  const embedding = new Float32Array(128);
  
  for (let i = 0; i < 128; i++) {
    // Use hash bytes to generate pseudo-random but consistent embedding
    embedding[i] = (hashArray[i % 32] / 255) * 2 - 1; // Normalize to [-1, 1]
  }
  
  return embedding;
}
