
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PublicListing {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  photos: string[] | null;
  created_at: string;
  status: string;
  is_vet_verified: boolean | null;
  price: number | null;
  contact_method: string | null;
  contact_value: string | null;
  user_id: string | null;
  animal_id: string | null;
  weight: number | null;
  age: number | null;
  updated_at: string | null;
}

export const usePublicMarketplace = () => {
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPublicListings = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('public_market_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setListings(data || []);
    } catch (err: any) {
      console.error('Error fetching public listings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicListings();
  }, [user]); // Refetch when auth state changes

  return {
    listings,
    loading,
    error,
    refetch: fetchPublicListings
  };
};
