// src/hooks/useAnimalUpdate.tsx - Hook for updating animal details with offline support

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { offlineQueue } from '@/lib/offlineQueue';
import { useToastContext } from '@/contexts/ToastContext';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/errorMessages';

export interface AnimalUpdateData {
  name?: string;
  subtype?: string;
  photo_url?: string;
}

interface UseAnimalUpdateReturn {
  updateAnimal: (animalId: string, updates: AnimalUpdateData) => Promise<boolean>;
  isUpdating: boolean;
}

export const useAnimalUpdate = (): UseAnimalUpdateReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toastContext = useToastContext();

  const mutation = useMutation({
    mutationFn: async ({ animalId, updates }: { animalId: string; updates: AnimalUpdateData }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const isOnline = navigator.onLine;

      // Prepare update data with edit tracking
      const updateData = {
        ...updates,
        last_edited_at: new Date().toISOString(),
        // Increment edit_count - we'll use a database function or handle it in the query
      };

      if (!isOnline) {
        // Add to offline queue
        await offlineQueue.addToQueue('animal_update', {
          animalId,
          updates: updateData,
          user_id: user.id
        });

        const networkError = getUserFriendlyError({ message: 'network' }, 'amharic');
        toastContext.info(networkError.message, networkError.icon);

        return { success: true, offline: true };
      }

      // Online - update in Supabase
      // First, get current edit_count
      const { data: currentAnimal, error: fetchError } = await supabase
        .from('animals')
        .select('edit_count')
        .eq('id', animalId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const currentEditCount = currentAnimal?.edit_count || 0;

      // Update with incremented edit_count
      const { data, error: updateError } = await supabase
        .from('animals')
        .update({
          ...updateData,
          edit_count: currentEditCount + 1
        })
        .eq('id', animalId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        // If update fails, add to offline queue
        await offlineQueue.addToQueue('animal_update', {
          animalId,
          updates: updateData,
          user_id: user.id
        });

        const errorMsg = getUserFriendlyError(updateError, 'amharic');
        toastContext.warning(errorMsg.message, errorMsg.icon);

        return { success: true, offline: true };
      }

      return { success: true, offline: false, data };
    },
    onSuccess: (result, variables) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['animal', variables.animalId] });
      queryClient.invalidateQueries({ queryKey: ['animals'] });

      if (!result.offline) {
        const successMsg = getSuccessMessage('changes_saved', 'amharic');
        toastContext.success(successMsg.message, successMsg.icon);
      }
    },
    onError: (err: Error) => {
      const errorMsg = getUserFriendlyError(err, 'amharic');
      toastContext.error(errorMsg.message, errorMsg.icon);
    }
  });

  return {
    updateAnimal: async (animalId: string, updates: AnimalUpdateData) => {
      try {
        const result = await mutation.mutateAsync({ animalId, updates });
        return result.success;
      } catch (err) {
        console.error('Error updating animal:', err);
        return false;
      }
    },
    isUpdating: mutation.isPending
  };
};
