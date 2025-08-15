
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
      
      // Use secure view for anonymous users, main table for authenticated users
      const tableName = user ? 'public_market_listings' : 'public_market_view';
      const query = supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });
      
      // Only filter by status if using the main table (authenticated users)
      if (user) {
        query.eq('status', 'active');
      }
      
      const { data, error } = await query;

      if (error) throw error;

      // Data is already secure at the database level, no need to filter here
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
