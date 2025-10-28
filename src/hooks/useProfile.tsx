// src/hooks/useProfile.tsx - Hook to manage user profile

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';

export interface UserProfile {
  id: string;
  phone: string;
  farmer_name: string;
  farm_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles' as any)
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, return null (not an error)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as UserProfile;
    },
    enabled: !!user,
  });

  const isProfileComplete = !!profile?.farmer_name;

  return {
    profile,
    isProfileComplete,
    isLoading,
    error,
    refetch
  };
};
