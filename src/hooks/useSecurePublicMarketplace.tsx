
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
      
      // Use the public_market_listings table with RLS policies handling the security
      const { data, error } = await supabase
        .from('public_market_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: SecurePublicListing[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title || '',
        description: item.description,
        location: item.location,
        photos: item.photos,
        created_at: item.created_at,
        status: item.status,
        is_vet_verified: item.is_vet_verified,
        price: user ? item.price : null, // Hide price for non-authenticated users
        contact_method: user ? item.contact_method : null, // Hide contact for non-authenticated users
        contact_value: user ? item.contact_value : null, // Hide contact for non-authenticated users
        user_id: item.user_id,
        animal_id: item.animal_id,
        weight: item.weight,
        age: item.age,
        updated_at: item.updated_at
      }));

      setListings(transformedData);
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
