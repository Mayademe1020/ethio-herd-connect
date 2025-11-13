// src/hooks/useMilkRecording.tsx
// Hook for recording milk production with offline support

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { offlineQueue } from '@/lib/offlineQueue';
import { useToastContext } from '@/contexts/ToastContext';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/errorMessages';
import { analytics, ANALYTICS_EVENTS } from '@/lib/analytics';
import { checkAndNotifyCompletion } from '@/services/milkCompletionService';

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

  // Update milk record mutation
  const updateMilkRecord = useMutation({
    mutationFn: async ({ 
      recordId, 
      amount, 
      session 
    }: { 
      recordId: string; 
      amount: number; 
      session: 'morning' | 'evening' 
    }): Promise<MilkRecord> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updates = {
        liters: amount,
        session: session,
        updated_at: new Date().toISOString(),
        edited_by: user.id,
        edit_count: 1 // Will be incremented by database trigger
      };

      // Check if online
      if (!navigator.onLine) {
        // Add to offline queue
        await offlineQueue.addToQueue('update_milk_record', {
          recordId,
          updates
        });

        const networkError = getUserFriendlyError({ message: 'network' }, 'amharic');
        toastContext.info(networkError.message, networkError.icon);

        // Return optimistic update
        return {
          id: recordId,
          user_id: user.id,
          animal_id: '', // Will be filled from cache
          liters: amount,
          recorded_at: new Date().toISOString(),
          session: session
        };
      }

      // First, get the current record to save in history
      const { data: currentRecord, error: fetchError } = await supabase
        .from('milk_production')
        .select('liters, session')
        .eq('id', recordId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current record:', fetchError);
        throw fetchError;
      }

      // Update in Supabase
      const { data, error } = await supabase
        .from('milk_production')
        .update(updates)
        .eq('id', recordId)
        .eq('user_id', user.id) // Ensure user owns the record
        .select()
        .single();

      if (error) {
        console.error('Error updating milk record:', error);
        throw error;
      }

      // Create edit history entry (after migration is run)
      try {
        // Use type assertion since table might not be in types yet
        await (supabase as any)
          .from('milk_edit_history')
          .insert({
            milk_record_id: recordId,
            previous_liters: currentRecord.liters,
            new_liters: amount,
            previous_session: currentRecord.session,
            new_session: session,
            edited_by: user.id,
            edited_at: new Date().toISOString()
          });
      } catch (historyError) {
        console.error('Error creating edit history:', historyError);
        // Don't fail the update if history fails (table might not exist yet)
      }

      return {
        id: data.id,
        user_id: data.user_id,
        animal_id: data.animal_id,
        liters: data.liters,
        recorded_at: data.recorded_at,
        session: data.session as 'morning' | 'evening'
      };
    },
    onSuccess: (data) => {
      // Invalidate all milk-related queries
      queryClient.invalidateQueries({ queryKey: ['milk-records'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-milk', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['milk-analytics', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['farmStats', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['paginated-milk-production'] });

      const successMsg = getSuccessMessage('milk_updated', 'amharic');
      toastContext.success(successMsg.message || 'Record updated successfully / መዝገብ በተሳካ ሁኔታ ተዘምኗል', '✓');

      // Track analytics event
      analytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {
        action: 'edit',
        amount: data.liters,
        session: data.session,
        animal_id: data.animal_id,
      });
    },
    onError: (error: any) => {
      console.error('Error updating milk record:', error);
      const errorMsg = getUserFriendlyError(error, 'amharic');
      toastContext.error(errorMsg.message, errorMsg.icon);
    }
  });

  const recordMilk = useMutation({
    mutationFn: async (input: MilkRecordInput): Promise<MilkRecord> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const session = input.session || detectSession();
      const recordedAt = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

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
          user_id: milkRecord.user_id,
          animal_id: milkRecord.animal_id,
          liters: input.liters,
          recorded_at: milkRecord.recorded_at,
          session: milkRecord.session
        };

        // Add to offline queue
        await addToOfflineQueue(milkRecord);

        const networkError = getUserFriendlyError({ message: 'network' }, 'amharic');
        toastContext.info(networkError.message, networkError.icon);

        return tempRecord;
      }

      // Try to save to Supabase
      try {
        // DUPLICATE CHECK: Check if record already exists for this animal, date, and session
        const { data: existingRecords, error: checkError } = await supabase
          .from('milk_production')
          .select('id, liters')
          .eq('animal_id', input.animal_id)
          .eq('session', session)
          .gte('recorded_at', `${today}T00:00:00`)
          .lte('recorded_at', `${today}T23:59:59`)
          .limit(1);

        if (checkError) {
          console.error('Error checking for duplicates:', checkError);
          // Continue with insert even if check fails
        }

        if (existingRecords && existingRecords.length > 0) {
          // Duplicate found - throw specific error
          const existingRecord = existingRecords[0];
          const error = new Error('DUPLICATE_MILK_RECORD');
          (error as any).existingRecord = existingRecord;
          (error as any).session = session;
          (error as any).date = today;
          throw error;
        }

        // No duplicate - proceed with insert
        const { data, error } = await supabase
          .from('milk_production')
          .insert(milkRecord as any)
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error; // Don't fallback to offline queue for now
        }

        // Map response to MilkRecord format (handle both old and new schema)
        const savedRecord: MilkRecord = {
          id: (data as any).id,
          user_id: (data as any).user_id,
          animal_id: (data as any).animal_id,
          liters: (data as any).amount || (data as any).liters || (data as any).total_yield || 0,
          recorded_at: (data as any).recorded_at || (data as any).created_at,
          session: (data as any).session || 'morning'
        };
        
        return savedRecord;
      } catch (error) {
        console.error('Error recording milk:', error);
        throw error; // Let the UI handle the error properly
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
    onError: (error: any, input, context) => {
      // Rollback on error
      if (context?.previousMilkRecords) {
        queryClient.setQueryData(['milk-records', input.animal_id], context.previousMilkRecords);
      }
      if (context?.previousWeeklyMilk !== undefined) {
        queryClient.setQueryData(['weekly-milk', user?.id], context.previousWeeklyMilk);
      }
      
      console.error('Error in milk recording mutation:', error);
      
      // Handle duplicate record error specially
      if (error.message === 'DUPLICATE_MILK_RECORD') {
        const session = error.session === 'morning' ? 'ጠዋት / morning' : 'ማታ / evening';
        const existingAmount = error.existingRecord?.liters || 0;
        toastContext.error(
          `⚠️ ቀድሞውኑ ተመዝግቧል / Already recorded for ${session} session (${existingAmount}L). Please edit the existing record instead.`,
          '⚠️'
        );
      } else {
        const errorMsg = getUserFriendlyError(error, 'amharic');
        toastContext.error(errorMsg.message, errorMsg.icon);
      }
    },
    onSuccess: async (data, input) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['milk-records', input.animal_id] });
      queryClient.invalidateQueries({ queryKey: ['weekly-milk', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['todays-tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['milk-analytics', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['animal-count', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['farmStats', user?.id] }); // Invalidate farm stats

      const successMsg = getSuccessMessage('milk_recorded', 'amharic');
      toastContext.success(successMsg.message, successMsg.icon);

      // Track analytics event
      const session = input.session || detectSession();
      analytics.track(ANALYTICS_EVENTS.MILK_RECORDED, {
        amount: input.liters,
        session: session,
        animal_id: input.animal_id,
        is_offline: data.id.startsWith('temp_'),
      });

      // Check for session completion and send achievement notification
      if (user?.id && !data.id.startsWith('temp_')) {
        // Only check completion for online records
        await checkAndNotifyCompletion(user.id, session as 'morning' | 'afternoon');
      }
    }
  });

  return {
    recordMilk: recordMilk.mutate,
    recordMilkAsync: recordMilk.mutateAsync,
    isRecording: recordMilk.isPending,
    error: recordMilk.error,
    isSuccess: recordMilk.isSuccess,
    updateMilkRecord: updateMilkRecord.mutate,
    updateMilkRecordAsync: updateMilkRecord.mutateAsync,
    isUpdating: updateMilkRecord.isPending,
    updateError: updateMilkRecord.error
  };
};

export default useMilkRecording;
