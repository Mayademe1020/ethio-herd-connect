import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { toast } from 'sonner';

export const useListingFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['listing-favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('listing_favorites')
        .select('listing_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []).map(f => f.listing_id);
    },
    enabled: !!user,
    staleTime: 30000,
  });

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('listing_favorites')
        .insert([{ user_id: user.id, listing_id: listingId }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-favorites'] });
      toast.success('Added to favorites', {
        description: 'Listing saved to your favorites',
      });
    },
    onError: (error: Error) => {
      toast.error('Error', {
        description: error.message || 'Failed to add favorite',
      });
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('listing_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-favorites'] });
      toast.success('Removed from favorites', {
        description: 'Listing removed from your favorites',
      });
    },
    onError: (error: Error) => {
      toast.error('Error', {
        description: error.message || 'Failed to remove favorite',
      });
    },
  });

  const toggleFavorite = (listingId: string) => {
    if (!user) {
      toast.error('Login required', {
        description: 'Please login to save favorites',
      });
      return;
    }

    if (favorites.includes(listingId)) {
      removeFavoriteMutation.mutate(listingId);
    } else {
      addFavoriteMutation.mutate(listingId);
    }
  };

  const isFavorite = (listingId: string) => favorites.includes(listingId);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    isToggling: addFavoriteMutation.isPending || removeFavoriteMutation.isPending,
  };
};
