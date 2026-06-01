
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextMVP';

export const useSecureMarketListing = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createListing = async (listingData: {
    animal_id: string;
    title: string;
    description?: string;
    price: number;
    weight?: number;
    age?: number;
    location?: string;
    contact_method?: string;
    contact_value?: string;
    photos?: string[];
  }) => {
    if (!user) {
      toast.error('Authentication Required');
      return { error: new Error('User not authenticated') };
    }

    setLoading(true);
    
    try {
      // Input validation
      if (!listingData.animal_id || !listingData.title || !listingData.price || listingData.price <= 0) {
        throw new Error('Animal ID, title, and valid price are required');
      }

      if (listingData.price > 1000000) {
        throw new Error('Price seems unrealistic. Please check your entry.');
      }

      // Verify user owns the animal
      const { data: animal, error: animalError } = await supabase
        .from('animals')
        .select('id, name, type, breed, weight, age')
        .eq('id', listingData.animal_id)
        .eq('user_id', user.id)
        .single();

      if (animalError || !animal) {
        throw new Error('Animal not found or you do not have permission to list it');
      }

      // Sanitize inputs
      const sanitizedData = {
        user_id: user.id,
        animal_id: listingData.animal_id,
        title: listingData.title.trim().substring(0, 100),
        description: listingData.description?.trim().substring(0, 1000) || null,
        price: Math.round(listingData.price * 100) / 100, // Round to 2 decimal places
        weight: listingData.weight ? Math.round(listingData.weight * 100) / 100 : animal.weight,
        age: listingData.age || animal.age,
        is_vet_verified: false, // Default to false, can be updated later
        location: listingData.location?.trim().substring(0, 200) || null,
        contact_method: listingData.contact_method || 'phone',
        contact_value: listingData.contact_value?.trim().substring(0, 100) || null,
        photos: listingData.photos || [],
        status: 'active',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('market_listings')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) throw error;

      // Log the action for audit
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'CREATE',
          table_name: 'market_listings',
          record_id: data.id,
          new_values: sanitizedData
        });

      toast.success('Your market listing has been created successfully.');
      return { data, error: null };
    } catch (error: unknown) {
      console.error('Market listing error:', error);
      toast.error('Listing Failed');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateListingStatus = async (listingId: string, status: 'active' | 'sold' | 'inactive') => {
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from('market_listings')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Log the action for audit
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'UPDATE',
          table_name: 'market_listings',
          record_id: data.id,
          new_values: { status }
        });

      toast.success('Listing status has been updated successfully.');
      return { data, error: null };
    } catch (error: unknown) {
      console.error('Listing update error:', error);
      toast.error('Update Failed');
      return { error };
    }
  };

  return {
    createListing,
    updateListingStatus,
    loading
  };
};
