
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurePublicListing {
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

export const useSecurePublicMarketplace = () => {
  const [listings, setListings] = useState<SecurePublicListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSecurePublicListings = async () => {
    try {
      setLoading(true);
      
      // Use the secure view that automatically filters sensitive data based on auth status
      const { data, error } = await supabase
        .from('public_market_listings_safe')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setListings(data || []);
    } catch (err: any) {
      console.error('Error fetching secure public listings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurePublicListings();
  }, [user]); // Refetch when auth state changes to get updated data visibility

  return {
    listings,
    loading,
    error,
    refetch: fetchSecurePublicListings
  };
};
