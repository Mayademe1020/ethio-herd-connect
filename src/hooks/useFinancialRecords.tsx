
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useAuth } from '@/contexts/AuthContext';

export interface FinancialRecord {
  id: string;
  user_id: string;
  transaction_date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  animal_id?: string;
  created_at: string;
  updated_at: string;
}

export const useFinancialRecords = () => {
  const { showSuccess, showError } = useToastNotifications();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: financialRecords, isLoading } = useQuery({
    queryKey: ['financial-records', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return data as FinancialRecord[];
    },
    enabled: !!user
  });

  const addFinancialRecord = useMutation({
    mutationFn: async (recordData: {
      transaction_date: string;
      type: 'income' | 'expense';
      category: string;
      amount: number;
      description?: string;
      animal_id?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('financial_records')
        .insert([{
          user_id: user.id,
          ...recordData
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-records'] });
      showSuccess('Financial Record Added', 'Transaction has been recorded successfully.');
    },
    onError: (error: any) => {
      showError('Recording Failed', error.message || 'Failed to record transaction');
    }
  });

  return {
    financialRecords: financialRecords || [],
    isLoading,
    addFinancialRecord: addFinancialRecord.mutate,
    isAdding: addFinancialRecord.isPending
  };
};
