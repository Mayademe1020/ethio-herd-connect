// src/hooks/useMilkRecording.tsx
// Hook for recording milk production with offline support

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { offlineQueue } from '@/lib/offlineQueue';
import { useToastContext } from '@/contexts/ToastContext';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/errorMessages';

interface MilkRecordInput {
  animal_id: string;
  liters: number;
  session?: 'morning' | 'evening';
}

interface MilkRecord {
  id: string;
  user_id: string;
  animal_id: string;
  liters: number;
  recorded_at: string;
  session: 'morning' | 'evening';
}

// Detect session based on time of day
const detectSession = (): 'morning' | 'evening' => {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : 'evening';
};

// Generate temporary ID for optimistic updates
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

// Add to offline queue using IndexedDB
const addToOfflineQueue = async (payload: any) => {
  await offlineQueue.addToQueue('milk_record', payload);
};

export const useMilkRecording = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toastContext = useToastContext();

  const recordMilk = useMutation({
    mutationFn: async (input: MilkRecordInput): Promise<MilkRecord> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const session = input.session || detectSession();
      const recordedAt = new Date().toISOString();

      const milkRecord = {
        user_id: user.id,
        animal_id: input.animal_id,
        liters: input.liters,
        recorded_at: recordedAt,
        session: session
      };

      // Check if online
      if (!navigator.onLine) {
        // Create temporary record for optimistic UI
        const tempRecord: MilkRecord = {
          id: generateTempId(),
          ...milkRecord
        };

        // Add to offline queue
        await addToOfflineQueue(milkRecord);

        const networkError = getUserFriendlyError({ message: 'network' }, 'amharic');
        toastContext.info(networkError.message, networkError.icon);

        return tempRecord;
      }

      // Try to save to Supabase
      try {
        const { data, error } = await supabase
          .from('milk_production')
          .insert(milkRecord as any)
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          
          // If error, add to offline queue
          const tempRecord: MilkRecord = {
            id: generateTempId(),
            ...milkRecord
          };
          await addToOfflineQueue(milkRecord);
          
          return tempRecord;
        }

        // Map response to MilkRecord format (handle both old and new schema)
        const savedRecord: MilkRecord = {
          id: (data as any).id,
          user_id: (data as any).user_id,
          animal_id: (data as any).animal_id,
          liters: (data as any).liters || (data as any).total_yield || 0,
          recorded_at: (data as any).recorded_at || (data as any).created_at,
          session: (data as any).session || 'morning'
        };
        
        return savedRecord;
      } catch (error) {
        console.error('Error recording milk:', error);
        
        // Fallback to offline queue
        const tempRecord: MilkRecord = {
          id: generateTempId(),
          ...milkRecord
        };
        await addToOfflineQueue(milkRecord);
        
        return tempRecord;
      }
    },
    onMutate: async (input: MilkRecordInput) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['milk-records', input.animal_id] });
      await queryClient.cancelQueries({ queryKey: ['weekly-milk', user?.id] });

      // Snapshot previous values
      const previousMilkRecords = queryClient.getQueryData(['milk-records', input.animal_id]);
      const previousWeeklyMilk = queryClient.getQueryData(['weekly-milk', user?.id]);

      // Optimistically update milk records
      const tempRecord: MilkRecord = {
        id: generateTempId(),
        user_id: user?.id || '',
        animal_id: input.animal_id,
        liters: input.liters,
        recorded_at: new Date().toISOString(),
        session: input.session || detectSession()
      };

      queryClient.setQueryData(['milk-records', input.animal_id], (old: any) => {
        return old ? [tempRecord, ...old] : [tempRecord];
      });

      // Update weekly milk total
      queryClient.setQueryData(['weekly-milk', user?.id], (old: number = 0) => {
        return old + input.liters;
      });

      return { previousMilkRecords, previousWeeklyMilk };
    },
    onError: (error, input, context) => {
      // Rollback on error
      if (context?.previousMilkRecords) {
        queryClient.setQueryData(['milk-records', input.animal_id], context.previousMilkRecords);
      }
      if (context?.previousWeeklyMilk !== undefined) {
        queryClient.setQueryData(['weekly-milk', user?.id], context.previousWeeklyMilk);
      }
      
      console.error('Error in milk recording mutation:', error);
      const errorMsg = getUserFriendlyError(error, 'amharic');
      toastContext.error(errorMsg.message, errorMsg.icon);
    },
    onSuccess: (_data, input) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['milk-records', input.animal_id] });
      queryClient.invalidateQueries({ queryKey: ['weekly-milk', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['todays-tasks', user?.id] });

      const successMsg = getSuccessMessage('milk_recorded', 'amharic');
      toastContext.success(successMsg.message, successMsg.icon);
    }
  });

  return {
    recordMilk: recordMilk.mutate,
    recordMilkAsync: recordMilk.mutateAsync,
    isRecording: recordMilk.isPending,
    error: recordMilk.error,
    isSuccess: recordMilk.isSuccess
  };
};

export default useMilkRecording;
