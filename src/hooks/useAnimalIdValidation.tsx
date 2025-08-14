
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { supabase } from '@/integrations/supabase/client';

interface AnimalIdValidationResult {
  isValid: boolean;
  animalId?: string;
  animalName?: string;
  needsCreation: boolean;
}

export const useAnimalIdValidation = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showError, showSuccess } = useToastNotifications();

  const validateAnimalId = useCallback(async (animalId: string): Promise<AnimalIdValidationResult> => {
    if (!user) {
      return { isValid: false, needsCreation: true };
    }

    if (!animalId || animalId.trim() === '') {
      return { isValid: false, needsCreation: true };
    }

    setLoading(true);
    try {
      const { data: animal, error } = await supabase
        .from('animals')
        .select('id, name, animal_code')
        .eq('animal_code', animalId)
        .eq('user_id', user.id)
        .single();

      if (error || !animal) {
        return { isValid: false, needsCreation: true };
      }

      return {
        isValid: true,
        animalId: animal.id,
        animalName: animal.name,
        needsCreation: false
      };
    } catch (error) {
      console.error('Animal ID validation error:', error);
      return { isValid: false, needsCreation: true };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const requireAnimalId = useCallback((feature: string): boolean => {
    const featuresRequiringAnimalId = [
      'vaccination',
      'medical',
      'milk-production',
      'breeding',
      'health-records',
      'growth-tracking',
      'internal-sales'
    ];

    return featuresRequiringAnimalId.includes(feature);
  }, []);

  const promptAnimalIdCreation = useCallback((feature: string) => {
    const featureNames = {
      'vaccination': 'Vaccination Records',
      'medical': 'Medical History',
      'milk-production': 'Milk Production',
      'breeding': 'Breeding Records',
      'health-records': 'Health Records',
      'growth-tracking': 'Growth Tracking',
      'internal-sales': 'Internal Sales'
    };

    const featureName = featureNames[feature as keyof typeof featureNames] || feature;
    
    showError(
      'Animal ID Required',
      `${featureName} requires an Animal ID. Please register your animal first or select an existing animal.`
    );
  }, [showError]);

  return {
    validateAnimalId,
    requireAnimalId,
    promptAnimalIdCreation,
    loading
  };
};
