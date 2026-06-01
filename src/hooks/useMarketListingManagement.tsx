import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { toast } from 'sonner';
import type { MarketListing } from '@/types/marketplace';

type MarketListingUpdates = Partial<Omit<MarketListing, 'id' | 'user_id' | 'created_at'>>;

export const useMarketListingManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Update listing mutation
  const updateListingMutation = useMutation({
    mutationFn: async ({ listingId, updates }: { listingId: string; updates: MarketListingUpdates }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('market_listings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', listingId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['public-marketplace'] });
      toast.success('Success', {
        description: 'Listing updated successfully',
      });
    },
    onError: (error: Error) => {
      toast.error('Error', {
        description: error.message || 'Failed to update listing',
      });
    },
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('market_listings')
        .delete()
        .eq('id', listingId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['public-marketplace'] });
      toast.success('Success', {
        description: 'Listing deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast.error('Error', {
        description: error.message || 'Failed to delete listing',
      });
    },
  });

  // Update listing status (active, sold, inactive)
  const updateStatus = async (listingId: string, status: 'active' | 'sold' | 'inactive') => {
    return updateListingMutation.mutateAsync({ 
      listingId, 
      updates: { status } 
    });
  };

  return {
    updateListing: updateListingMutation.mutate,
    deleteListing: deleteListingMutation.mutate,
    updateStatus,
    isUpdating: updateListingMutation.isPending,
    isDeleting: deleteListingMutation.isPending,
    loading: updateListingMutation.isPending || deleteListingMutation.isPending,
  };
};
