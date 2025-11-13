// src/hooks/useMarketplaceListing.tsx - Hook for marketplace listing with offline support

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { offlineQueue } from '@/lib/offlineQueue';
import { v4 as uuidv4 } from 'uuid';
import { useToastContext } from '@/contexts/ToastContext';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/errorMessages';
import { analytics, ANALYTICS_EVENTS } from '@/lib/analytics';

interface FemaleAnimalData {
  pregnancyStatus?: string;
  lactationStatus?: string;
  milkProductionPerDay?: number;
  expectedDeliveryDate?: string;
}

interface CreateListingData {
  animal_id: string;
  price: number;
  is_negotiable?: boolean;
  location?: string;
  contact_phone?: string;
  photo_url?: string;
  video_url?: string;
  video_thumbnail?: string;
  femaleAnimalData?: FemaleAnimalData;
  healthDisclaimerChecked: boolean;
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
        video_url: data.video_url || null,
        pregnancy_status: data.femaleAnimalData?.pregnancyStatus || null,
        lactation_status: data.femaleAnimalData?.lactationStatus || null,
        milk_production_per_day: data.femaleAnimalData?.milkProductionPerDay || null,
        expected_delivery_date: data.femaleAnimalData?.expectedDeliveryDate || null,
        health_disclaimer_accepted: data.healthDisclaimerChecked,
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
    onSuccess: (result, variables) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });

      // Track analytics event
      analytics.track(ANALYTICS_EVENTS.LISTING_CREATED, {
        price: variables.price,
        is_negotiable: variables.is_negotiable ?? true,
        has_photo: !!variables.photo_url,
        has_video: !!variables.video_url,
        has_location: !!variables.location,
        has_female_data: !!(variables.femaleAnimalData?.pregnancyStatus || variables.femaleAnimalData?.lactationStatus),
        is_offline: result.offline,
      });
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

  const updateListing = useMutation({
    mutationFn: async ({ 
      listingId, 
      updates 
    }: { 
      listingId: string; 
      updates: {
        price?: number;
        is_negotiable?: boolean;
        description?: string;
        photo_url?: string;
        video_url?: string;
        video_thumbnail?: string;
      }
    }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const isOnline = navigator.onLine;

      // First, get current edit_count
      const { data: currentListing, error: fetchError } = await supabase
        .from('market_listings')
        .select('edit_count, created_at')
        .eq('id', listingId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const currentEditCount = currentListing?.edit_count || 0;

      // Prepare update data with edit tracking
      const updateData = {
        ...updates,
        last_edited_at: new Date().toISOString(),
        edit_count: currentEditCount + 1,
        updated_at: new Date().toISOString()
        // Note: created_at is NOT updated - it's preserved
      };

      if (!isOnline) {
        // Add to offline queue
        await offlineQueue.addToQueue('listing_update', {
          listingId,
          updates: updateData,
          user_id: user.id
        });

        const networkError = getUserFriendlyError({ message: 'network' }, 'amharic');
        toastContext.info(networkError.message, networkError.icon);

        return { success: true, offline: true };
      }

      // Online - update in Supabase
      const { data, error: updateError } = await supabase
        .from('market_listings')
        .update(updateData)
        .eq('id', listingId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        // If update fails, add to offline queue
        await offlineQueue.addToQueue('listing_update', {
          listingId,
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
      queryClient.invalidateQueries({ queryKey: ['market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', variables.listingId] });

      if (!result.offline) {
        const successMsg = getSuccessMessage('changes_saved', 'amharic');
        toastContext.success(successMsg.message, successMsg.icon);
      }
    },
    onError: (error) => {
      const errorMsg = getUserFriendlyError(error, 'amharic');
      toastContext.error(errorMsg.message, errorMsg.icon);
    },
  });

  return {
    createListing: createListing.mutateAsync,
    updateListing: async (listingId: string, updates: any) => {
      const result = await updateListing.mutateAsync({ listingId, updates });
      return result.success;
    },
    markAsSold: (listingId: string) => updateListingStatus.mutateAsync({ listingId, status: 'sold' }),
    cancelListing: (listingId: string) => updateListingStatus.mutateAsync({ listingId, status: 'cancelled' }),
    updateListingStatus: updateListingStatus.mutateAsync,
    isCreating: createListing.isPending,
    isUpdating: updateListingStatus.isPending || updateListing.isPending,
  };
};
