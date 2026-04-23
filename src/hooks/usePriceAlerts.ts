// src/hooks/usePriceAlerts.ts - Hook for price drop alerts

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PriceAlert {
  id: string;
  user_id: string;
  listing_id: string;
  target_price: number;
  original_price: number;
  status: 'active' | 'triggered' | 'cancelled';
  created_at: string;
  triggered_at?: string;
  listing?: {
    id: string;
    price: number;
    title: string;
    animal: { name: string; type: string; photo_url: string };
  };
}

export const usePriceAlerts = (listingId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's price alerts
  const { data: alerts, isLoading } = useQuery<PriceAlert[]>({
    queryKey: ['price-alerts', user?.id, listingId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (listingId) {
        query = query.eq('listing_id', listingId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching price alerts:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });

  // Check if alert exists for specific listing
  const hasAlert = alerts?.some(alert => 
    listingId ? alert.listing_id === listingId : false
  );

  // Create price alert mutation
  const createAlert = useMutation({
    mutationFn: async ({ listingId, targetPrice, originalPrice }: {
      listingId: string;
      targetPrice: number;
      originalPrice: number;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('price_alerts')
        .insert({
          user_id: user.id,
          listing_id: listingId,
          target_price: targetPrice,
          original_price: originalPrice,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });

  // Cancel price alert mutation
  const cancelAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('price_alerts')
        .update({ status: 'cancelled' })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
    },
  });

  return {
    alerts,
    isLoading,
    hasAlert,
    createAlert: createAlert.mutateAsync,
    cancelAlert: cancelAlert.mutateAsync,
    isCreating: createAlert.isPending,
    isCancelling: cancelAlert.isPending,
  };
};

// Hook to check and trigger price alerts (runs on listing price changes)
export const useCheckPriceAlerts = () => {
  const queryClient = useQueryClient();

  const checkAndTriggerAlerts = async (listingId: string, newPrice: number) => {
    try {
      // Get all active alerts for this listing
      const { data: alerts } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('listing_id', listingId)
        .eq('status', 'active')
        .lte('target_price', newPrice);

      if (!alerts || alerts.length === 0) return;

      // Trigger alerts
      for (const alert of alerts) {
        await supabase
          .from('price_alerts')
          .update({ 
            status: 'triggered',
            triggered_at: new Date().toISOString()
          })
          .eq('id', alert.id);

        // TODO: Send notification to user (push notification / in-app)
        console.log(`Price alert triggered for user ${alert.user_id}: ${alert.listing_id} dropped to ${newPrice}`);
      }

      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
    } catch (error) {
      console.error('Error checking price alerts:', error);
    }
  };

  return { checkAndTriggerAlerts };
};
