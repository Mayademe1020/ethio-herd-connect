// src/hooks/useAnimalDeletion.tsx - Hook for soft deleting animals with offline support

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { toast } from 'sonner';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/errorMessages';
import type { AnimalData } from '@/types';

interface UseAnimalDeletionReturn {
  deleteAnimal: (animalId: string) => Promise<boolean>;
  isDeleting: boolean;
}

export const useAnimalDeletion = (): UseAnimalDeletionReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (animalId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const isOnline = navigator.onLine;

      // Optimistic update - remove from local cache immediately
      queryClient.setQueryData(['animals', user.id], (old: AnimalData[] = []) => 
        old.filter(animal => animal.id !== animalId)
      );

      if (!isOnline) {
        // Store in offline queue (simplified - in production use IndexedDB)
        const offlineQueue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
        offlineQueue.push({
          id: animalId,
          action_type: 'animal_deletion',
          payload: { animal_id: animalId },
          status: 'pending',
          created_at: new Date().toISOString()
        });
        localStorage.setItem('offline_queue', JSON.stringify(offlineQueue));

        const networkError = getUserFriendlyError({ message: 'network' }, 'amharic');
        toast.info(networkError.message, networkError.icon ? { icon: networkError.icon } : undefined);

        return { success: true, offline: true };
      }

      // Online - hard delete (until migration adds is_active column)
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', animalId)
        .eq('user_id', user.id);

      if (error) {
        // If delete fails, add to offline queue
        const offlineQueue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
        offlineQueue.push({
          id: animalId,
          action_type: 'animal_deletion',
          payload: { animal_id: animalId },
          status: 'pending',
          created_at: new Date().toISOString()
        });
        localStorage.setItem('offline_queue', JSON.stringify(offlineQueue));

        const errorMsg = getUserFriendlyError(error, 'amharic');
        toast.warning(errorMsg.message, errorMsg.icon ? { icon: errorMsg.icon } : undefined);

        return { success: true, offline: true };
      }

      return { success: true, offline: false };
    },
    onSuccess: (result) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animals-count'] });

      if (!result.offline) {
        const successMsg = getSuccessMessage('animal_deleted', 'amharic');
        toast.success(successMsg.message, successMsg.icon ? { icon: successMsg.icon } : undefined);
      }
    },
    onError: (error: Error) => {
      const errorMsg = getUserFriendlyError(error, 'amharic');
      toast.error(errorMsg.message, errorMsg.icon ? { icon: errorMsg.icon } : undefined);
      
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['animals'] });
    }
  });

  return {
    deleteAnimal: async (animalId: string) => {
      try {
        const result = await mutation.mutateAsync(animalId);
        return result.success;
      } catch (error) {
        return false;
      }
    },
    isDeleting: mutation.isPending
  };
};
