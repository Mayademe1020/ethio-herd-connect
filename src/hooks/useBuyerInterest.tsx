import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useBuyerInterest = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const expressInterest = async (listingId: string, sellerUserId: string, message?: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to express interest in listings.',
        variant: 'destructive',
      });
      return { error: new Error('User not authenticated') };
    }

    if (user.id === sellerUserId) {
      toast({
        title: 'Invalid Action',
        description: 'You cannot express interest in your own listing.',
        variant: 'destructive',
      });
      return { error: new Error('Cannot express interest in own listing') };
    }

    setLoading(true);
    
    try {
      // Check if interest already exists
      const { data: existingInterest } = await supabase
        .from('buyer_interests')
        .select('id, status')
        .eq('listing_id', listingId)
        .eq('buyer_user_id', user.id)
        .single();

      if (existingInterest) {
        toast({
          title: 'Interest Already Expressed',
          description: `Your interest is ${existingInterest.status}. You can send another message.`,
          variant: 'default',
        });
        return { data: existingInterest, error: null };
      }

      const { data, error } = await supabase
        .from('buyer_interests')
        .insert([{
          listing_id: listingId,
          buyer_user_id: user.id,
          seller_user_id: sellerUserId,
          message: message || 'I am interested in your listing.',
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Interest Expressed',
        description: 'Your interest has been sent to the seller. You will be notified when they respond.',
        variant: 'default',
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Express interest error:', error);
      toast({
        title: 'Failed to Express Interest',
        description: error.message || 'Failed to send interest. Please try again.',
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateInterestStatus = async (interestId: string, status: 'approved' | 'rejected') => {
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('buyer_interests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', interestId)
        .eq('seller_user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: status === 'approved' ? 'Interest Approved' : 'Interest Rejected',
        description: `You have ${status} the buyer's interest.`,
        variant: 'default',
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Update interest status error:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update interest status.',
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getInterestsForListing = async (listingId: string) => {
    if (!user) {
      return { data: [], error: new Error('User not authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from('buyer_interests')
        .select('*')
        .eq('listing_id', listingId)
        .eq('seller_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Get interests error:', error);
      return { data: [], error };
    }
  };

  const getMyInterests = async () => {
    if (!user) {
      return { data: [], error: new Error('User not authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from('buyer_interests')
        .select(`
          *,
          market_listings (
            id,
            title,
            price,
            photos,
            status
          )
        `)
        .eq('buyer_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Get my interests error:', error);
      return { data: [], error };
    }
  };

  return {
    expressInterest,
    updateInterestStatus,
    getInterestsForListing,
    getMyInterests,
    loading
  };
};