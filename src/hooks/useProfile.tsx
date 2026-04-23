// src/hooks/useProfile.tsx - Hook to manage user profile

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';

export interface UserProfile {
  id: string;
  phone: string;
  farmer_name: string;
  farm_name: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
  farm_profile?: {
    location: string | null;
    farm_prefix: string | null;
  } | null;
}

interface UpdateProfileData {
  farmer_name: string;
  farm_name: string;
}

// Validation function for farmer name
const validateFarmerName = (name: string): { isValid: boolean; error?: string } => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'Farmer name is required' };
  }
  
  // Must have at least 2 words (first name + father's name)
  const words = trimmedName.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 2) {
    return { isValid: false, error: 'Please enter your full name (first name and father\'s name)' };
  }
  
  return { isValid: true };
};

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles' as any)
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          // Handle 406 Not Acceptable error specifically
          if (profileError.message?.includes('406') || profileError.code === '406') {
            console.error('Profile fetch 406 error:', {
              code: profileError.code,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint,
              userId: user.id
            });
            throw new Error('Unable to load profile. Please check your connection and try again.');
          }
          
          // Log other errors with details
          console.error('Profile fetch error:', {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            userId: user.id
          });
          
          throw profileError;
        }

        // maybeSingle() returns null if no row found (not an error)
        if (!profileData) {
          console.log('Profile not found for user:', user.id);
          return null;
        }

        // Fetch farm profile separately (if exists)
        const { data: farmProfileData } = await supabase
          .from('farm_profiles' as any)
          .select('location, farm_prefix')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('Profile loaded successfully for user:', user.id);
        
        // Merge profile data with auth email and farm profile
        const profileWithEmail = {
          ...profileData,
          email: user.email || profileData.phone, // Use auth email or fallback to phone
          farm_profile: farmProfileData || null
        } as unknown as UserProfile;
        
        return profileWithEmail;
      } catch (err) {
        console.error('Profile fetch exception:', err);
        throw err;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - cache persists for 24 hours (formerly cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const isProfileComplete = !!profile?.farmer_name;

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate farmer_name before update
      const validation = validateFarmerName(data.farmer_name);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Prepare update data
      const updateData = {
        farmer_name: data.farmer_name.trim(),
        farm_name: data.farm_name.trim() || null,
        updated_at: new Date().toISOString()
      };

      // Update profiles table via Supabase
      const { data: updatedProfile, error } = await supabase
        .from('profiles' as any)
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId: user.id
        });

        // Provide user-friendly error messages
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        
        if (error.code === 'PGRST116') {
          throw new Error('Profile not found. Please try logging in again.');
        }

        throw new Error('Failed to update profile. Please try again.');
      }

      return updatedProfile as unknown as UserProfile;
    },
    onSuccess: () => {
      // Invalidate profile query on success to refetch the data
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error: Error) => {
      console.error('Profile update mutation error:', error);
    }
  });

  return {
    profile,
    isProfileComplete,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error
  };
};
