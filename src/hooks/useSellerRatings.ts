// src/hooks/useSellerRatings.ts - Hook for seller/buyer ratings

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';

interface SellerRating {
  id: string;
  transaction_id: string;
  rater_id: string; // User who gave the rating
  rated_user_id: string; // User being rated
  rating: 'positive' | 'negative' | 'neutral';
  comment?: string;
  created_at: string;
  transaction?: {
    listing_id: string;
    price: number;
    completed_at: string;
    animal: { name: string; type: string };
  };
}

export const useSellerRatings = (userId?: string) => {
  const { user } = useAuth();
  
  // Fetch ratings given by current user
  const { data: ratingsGiven } = useQuery<SellerRating[]>({
    queryKey: ['seller-ratings-given', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('seller_ratings')
        .select('*')
        .eq('rater_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ratings given:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch ratings received by a user
  const { data: ratingsReceived } = useQuery<SellerRating[]>({
    queryKey: ['seller-ratings-received', userId || user?.id],
    queryFn: async () => {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from('seller_ratings')
        .select('*')
        .eq('rated_user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ratings received:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!userId || !!user,
  });

  // Calculate rating stats
  const ratingStats = ratingsReceived ? {
    total: ratingsReceived.length,
    positive: ratingsReceived.filter(r => r.rating === 'positive').length,
    negative: ratingsReceived.filter(r => r.rating === 'negative').length,
    neutral: ratingsReceived.filter(r => r.rating === 'neutral').length,
    score: ratingsReceived.filter(r => r.rating === 'positive').length - 
           ratingsReceived.filter(r => r.rating === 'negative').length
  } : null;

  return {
    ratingsGiven,
    ratingsReceived,
    ratingStats,
  };
};

// Submit a rating
export const useSubmitRating = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const submitRating = useMutation({
    mutationFn: async ({ 
      transactionId, 
      ratedUserId, 
      rating, 
      comment 
    }: { 
      transactionId: string;
      ratedUserId: string;
      rating: 'positive' | 'negative' | 'neutral';
      comment?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('seller_ratings')
        .insert({
          transaction_id: transactionId,
          rater_id: user.id,
          rated_user_id: ratedUserId,
          rating,
          comment: comment || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-ratings-given'] });
      queryClient.invalidateQueries({ queryKey: ['seller-ratings-received'] });
    },
  });

  return {
    submitRating: submitRating.mutateAsync,
    isSubmitting: submitRating.isPending,
  };
};

// Check if user can rate a transaction
export const useCanRate = (transactionId: string, ratedUserId: string) => {
  const { user } = useAuth();

  const { data: existingRating } = useQuery<SellerRating | null>({
    queryKey: ['seller-rating-check', transactionId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('seller_ratings')
        .select('*')
        .eq('transaction_id', transactionId)
        .eq('rater_id', user.id)
        .maybeSingle();

      if (error) return null;
      return data;
    },
    enabled: !!user && !!transactionId,
  });

  return {
    canRate: !existingRating && user?.id !== ratedUserId,
    hasRated: !!existingRating,
  };
};
