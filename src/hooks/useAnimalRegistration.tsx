// src/hooks/useAnimalRegistration.tsx - Hook for animal registration with offline support

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { offlineQueue } from '@/lib/offlineQueue';
import { useToastContext } from '@/contexts/ToastContext';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/errorMessages';

// Animal short codes mapping
const ANIMAL_CODES: Record<string, string> = {
  'Cow': 'COW',
  'Bull': 'BUL',
  'Ox': 'OXX',
  'Calf': 'CAL',
  'Male': 'MGT', // Will be MGT for goat, RAM for sheep
  'Female': 'FGT', // Will be FGT for goat, EWE for sheep
  'Ram': 'RAM',
  'Ewe': 'EWE'
};

// Generate unique Animal ID
const generateAnimalId = async (
  type: string,
  subtype: string,
  userId: string
): Promise<string> => {
  try {
    // Get user profile for farm/farmer name
    const { data: profile } = await supabase
      .from('profiles' as any)
      .select('farm_name, farmer_name, phone')
      .eq('id', userId)
      .single();

    // Determine prefix (farm name > farmer name > last 6 digits of phone)
    const profileData = profile as any;
    let prefix = '';
    if (profileData?.farm_name) {
      prefix = profileData.farm_name.substring(0, 10).replace(/\s+/g, '');
    } else if (profileData?.farmer_name) {
      prefix = profileData.farmer_name.split(' ')[0].substring(0, 10);
    } else if (profileData?.phone) {
      prefix = profileData.phone.slice(-6);
    } else {
      prefix = userId.slice(0, 6);
    }

    // Get animal code
    let animalCode = ANIMAL_CODES[subtype] || 'ANM';
    
    // Special handling for Male/Female based on type
    if (subtype === 'Male') {
      animalCode = type === 'goat' ? 'MGT' : 'RAM';
    } else if (subtype === 'Female') {
      animalCode = type === 'goat' ? 'FGT' : 'EWE';
    }

    // Get current year
    const year = new Date().getFullYear();

    // Get count of user's animals of this type to generate sequence number
    const { count } = await supabase
      .from('animals' as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', type);

    const number = String((count || 0) + 1).padStart(3, '0');

    return `${prefix}-${animalCode}-${number}-${year}`;
  } catch (error) {
    console.error('Error generating animal ID:', error);
    // Fallback to simple ID
    return `ANM-${Date.now().toString().slice(-6)}`;
  }
};

export interface AnimalRegistrationData {
  name?: string;
  type: 'cattle' | 'goat' | 'sheep';
  subtype: string;
  photo_url?: string;
}

interface UseAnimalRegistrationReturn {
  registerAnimal: (data: AnimalRegistrationData) => Promise<{ id: string; success: boolean }>;
  isRegistering: boolean;
  error: Error | null;
}

export const useAnimalRegistration = (): UseAnimalRegistrationReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);
  const toastContext = useToastContext();

  const mutation = useMutation({
    mutationFn: async (data: AnimalRegistrationData) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const isOnline = navigator.onLine;
      const tempId = uuidv4();

      // Generate unique Animal ID
      const animalId = await generateAnimalId(data.type, data.subtype, user.id);

      const animalData = {
        id: tempId,
        user_id: user.id,
        animal_id: animalId,
        name: data.name || `${data.subtype}`,
        type: data.type,
        subtype: data.subtype,
        photo_url: data.photo_url,
        registration_date: new Date().toISOString(),
        is_active: true
      } as any; // Type assertion to bypass outdated Supabase types

      // Optimistic update - add to local cache immediately
      queryClient.setQueryData(['animals-count', user.id], (old: number = 0) => old + 1);

      if (!isOnline) {
        // Add to offline queue using IndexedDB
        await offlineQueue.addToQueue('animal_registration', animalData);

        const networkError = getUserFriendlyError({ message: 'network' }, 'amharic');
        toastContext.info(networkError.message, networkError.icon);

        return { id: tempId, offline: true };
      }

      // Online - save to Supabase
      const { data: savedAnimal, error: saveError } = await supabase
        .from('animals')
        .insert(animalData)
        .select()
        .single();

      if (saveError) {
        // If save fails, add to offline queue
        await offlineQueue.addToQueue('animal_registration', animalData);

        const errorMsg = getUserFriendlyError(saveError, 'amharic');
        toastContext.warning(errorMsg.message, errorMsg.icon);

        return { id: tempId, offline: true };
      }

      return { id: savedAnimal.id, offline: false };
    },
    onSuccess: (result) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['animals-count'] });
      queryClient.invalidateQueries({ queryKey: ['todays-tasks'] });

      if (!result.offline) {
        const successMsg = getSuccessMessage('animal_registered', 'amharic');
        toastContext.success(successMsg.message, successMsg.icon);
      }
    },
    onError: (err: Error) => {
      setError(err);
      const errorMsg = getUserFriendlyError(err, 'amharic');
      toastContext.error(errorMsg.message, errorMsg.icon);
    }
  });

  return {
    registerAnimal: async (data: AnimalRegistrationData) => {
      try {
        setError(null);
        const result = await mutation.mutateAsync(data);
        return { id: result.id, success: true };
      } catch (err) {
        setError(err as Error);
        return { id: '', success: false };
      }
    },
    isRegistering: mutation.isPending,
    error
  };
};
