import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useListingFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
      toast({
        title: 'Added to favorites',
        description: 'Listing saved to your favorites',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add favorite',
        variant: 'destructive',
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
      toast({
        title: 'Removed from favorites',
        description: 'Listing removed from your favorites',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove favorite',
        variant: 'destructive',
      });
    },
  });

  const toggleFavorite = (listingId: string) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to save favorites',
        variant: 'destructive',
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
