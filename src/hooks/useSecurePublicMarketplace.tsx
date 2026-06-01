
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';

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
      setError(null);
      
      // Use secure view for anonymous users, main table for authenticated users
      const tableName = user ? 'public_market_listings' : 'public_market_view';
      const query = supabase
        .from(tableName)
        .select('id, title, description, location, photos, created_at, status, is_vet_verified, price, contact_method, contact_value, user_id, animal_id, weight, age, updated_at')
        .order('created_at', { ascending: false });
      
       // Only filter by status if using the main table (authenticated users)
       if (user) {
         query.eq('status', 'active');
       }
       
       const { data, error } = await query;
 
       if (error) {
         console.error('Database error fetching listings:', error.message);
         setError(error.message);
         // No fallback to mock data - show empty list or error
         setListings([]);
       } else {
         // Use only real data from database
         setListings(data || []);
       }
    } catch (err: unknown) {
      console.error('Error fetching secure public listings:', err);
      setError((err as Error).message || 'Failed to fetch listings');
      // Fallback to mock listings for preview when unauthenticated
      if (!user) {
        setListings(mockMarketplaceListings as unknown as SecurePublicListing[]);
      } else {
        setListings([]);
      }
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
