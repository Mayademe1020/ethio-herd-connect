
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useAuth } from '@/contexts/AuthContext';

export interface MilkProductionRecord {
  id: string;
  user_id: string;
  animal_id: string;
  production_date: string;
  morning_yield?: number;
  evening_yield?: number;
  total_yield: number;
  quality_grade?: 'A' | 'B' | 'C';
  fat_content?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useMilkProduction = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: milkRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['milk-production', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('milk_production')
        .select('*')
        .eq('user_id', user.id)
        .order('production_date', { ascending: false });
      
      if (error) throw error;
      return data as MilkProductionRecord[];
    },
    enabled: !!user
  });

  const recordMilkProduction = useMutation({
    mutationFn: async (productionData: {
      animal_id: string;
      production_date: string;
      morning_yield?: number;
      evening_yield?: number;
      total_yield: number;
      quality_grade?: 'A' | 'B' | 'C';
      fat_content?: number;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('milk_production')
        .insert([{
          user_id: user.id,
          ...productionData
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milk-production'] });
      showSuccess('Milk Production Recorded', 'Daily milk production has been recorded successfully.');
    },
    onError: (error: any) => {
      showError('Recording Failed', error.message || 'Failed to record milk production');
    }
  });

  return {
    milkRecords: milkRecords || [],
    isLoadingRecords,
    recordMilkProduction: recordMilkProduction.mutate,
    isRecording: recordMilkProduction.isPending
  };
};
