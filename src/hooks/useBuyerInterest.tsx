// src/hooks/useBuyerInterest.tsx - Hook for managing buyer interests

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { offlineQueue } from '@/lib/offlineQueue';
import { v4 as uuidv4 } from 'uuid';
import { useToastContext } from '@/contexts/ToastContext';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/errorMessages';
import { analytics, ANALYTICS_EVENTS } from '@/lib/analytics';

interface ExpressInterestParams {
  listingId: string;
  buyerId: string;
  message?: string;
}

interface UpdateInterestStatusParams {
  interestId: string;
  status: 'pending' | 'contacted' | 'closed';
}

export const useBuyerInterest = () => {
  const queryClient = useQueryClient();
  const toastContext = useToastContext();

  // Express interest mutation
  const expressInterest = useMutation({
    mutationFn: async ({ listingId, buyerId, message }: ExpressInterestParams) => {
      const isOnline = navigator.onLine;
      const tempId = uuidv4();

      const interestData = {
        id: tempId,
        listing_id: listingId,
        buyer_id: buyerId,
        message: message || null,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      if (!isOnline) {
        // Add to offline queue
        await offlineQueue.addToQueue('buyer_interest', interestData);
        return interestData;
      }

      // Try to save online
      try {
        const { data, error } = await supabase
          .from('buyer_interests')
          .insert(interestData as any)
          .select()
          .single();

        if (error) {
          // If error, add to offline queue
          await offlineQueue.addToQueue('buyer_interest', interestData);
          return interestData;
        }

        return data as any;
      } catch (error) {
        // Fallback to offline queue
        await offlineQueue.addToQueue('buyer_interest', interestData);
        return interestData;
      }
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-interest', variables.listingId, variables.buyerId] });
      queryClient.invalidateQueries({ queryKey: ['listing-interests', variables.listingId] });

      const successMsg = getSuccessMessage('interest_sent', 'amharic');
      toastContext.success(successMsg.message, successMsg.icon);

      // Track analytics event
      analytics.track(ANALYTICS_EVENTS.INTEREST_EXPRESSED, {
        listing_id: variables.listingId,
        has_message: !!variables.message,
        is_offline: !navigator.onLine,
      });
    },
    onError: (error) => {
      const errorMsg = getUserFriendlyError(error, 'amharic');
      toastContext.error(errorMsg.message, errorMsg.icon);
    },
  });

  // Update interest status mutation
  const updateInterestStatus = useMutation({
    mutationFn: async ({ interestId, status }: UpdateInterestStatusParams) => {
      const { data, error } = await supabase
        .from('buyer_interests')
        .update({ status } as any)
        .eq('id', interestId)
        .select()
        .single();

      if (error) throw error;
      return data as any;
    },
    onSuccess: (data: any) => {
      // Invalidate listing interests query
      queryClient.invalidateQueries({ queryKey: ['listing-interests', data.listing_id] });

      toastContext.success('ተሳክቷል! / Updated!', '✓');
    },
    onError: (error) => {
      const errorMsg = getUserFriendlyError(error, 'amharic');
      toastContext.error(errorMsg.message, errorMsg.icon);
    },
  });

  return {
    expressInterest: expressInterest.mutateAsync,
    markAsContacted: (interestId: string) => updateInterestStatus.mutateAsync({ interestId, status: 'contacted' }),
    updateInterestStatus: updateInterestStatus.mutateAsync,
    isExpressing: expressInterest.isPending,
    isUpdating: updateInterestStatus.isPending,
  };
};
