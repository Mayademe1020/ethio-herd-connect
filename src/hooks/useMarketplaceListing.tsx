// src/hooks/useMarketplaceListing.tsx - Hook for marketplace listing with offline support

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { offlineQueue } from '@/lib/offlineQueue';
import { v4 as uuidv4 } from 'uuid';
import { useToastContext } from '@/contexts/ToastContext';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/errorMessages';

interface CreateListingData {
  animal_id: string;
  price: number;
  is_negotiable?: boolean;
  location?: string;
  contact_phone?: string;
  photo_url?: string;
}

export const useMarketplaceListing = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toastContext = useToastContext();

  const createListing = useMutation({
    mutationFn: async (data: CreateListingData) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const isOnline = navigator.onLine;
      const tempId = uuidv4();

      const listingData = {
        id: tempId,
        user_id: user.id,
        animal_id: data.animal_id,
        title: `Animal for Sale`, // Default title
        price: data.price,
        is_negotiable: data.is_negotiable ?? true,
        location: data.location || null,
        contact_phone: data.contact_phone || null,
        photo_url: data.photo_url || null,
        status: 'active',
        views_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any;

      if (!isOnline) {
        // Add to offline queue
        await offlineQueue.addToQueue('listing_creation', listingData);
        
        const networkError = getUserFriendlyError({ message: 'network' }, 'amharic');
        toastContext.info(networkError.message, networkError.icon);

        return { id: tempId, offline: true };
      }

      // Try to save online
      try {
        const { data: savedListing, error } = await supabase
          .from('market_listings')
          .insert(listingData)
          .select()
          .single();

        if (error) {
          // If error, add to offline queue
          await offlineQueue.addToQueue('listing_creation', listingData);
          
          const errorMsg = getUserFriendlyError(error, 'amharic');
          toastContext.warning(errorMsg.message, errorMsg.icon);

          return { id: tempId, offline: true };
        }

        const successMsg = getSuccessMessage('listing_created', 'amharic');
        toastContext.success(successMsg.message, successMsg.icon);

        return { id: savedListing.id, offline: false };
      } catch (error) {
        // Fallback to offline queue
        await offlineQueue.addToQueue('listing_creation', listingData);
        
        const errorMsg = getUserFriendlyError(error, 'amharic');
        toastContext.warning(errorMsg.message, errorMsg.icon);

        return { id: tempId, offline: true };
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });

  const updateListingStatus = useMutation({
    mutationFn: async ({ listingId, status }: { listingId: string; status: 'active' | 'sold' | 'cancelled' }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('market_listings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      
      const successMsg = getSuccessMessage('listing_sold', 'amharic');
      toastContext.success(successMsg.message, successMsg.icon);
    },
    onError: (error) => {
      const errorMsg = getUserFriendlyError(error, 'amharic');
      toastContext.error(errorMsg.message, errorMsg.icon);
    },
  });

  return {
    createListing: createListing.mutateAsync,
    markAsSold: (listingId: string) => updateListingStatus.mutateAsync({ listingId, status: 'sold' }),
    cancelListing: (listingId: string) => updateListingStatus.mutateAsync({ listingId, status: 'cancelled' }),
    updateListingStatus: updateListingStatus.mutateAsync,
    isCreating: createListing.isPending,
    isUpdating: updateListingStatus.isPending,
  };
};
