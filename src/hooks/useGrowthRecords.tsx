import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { buildGrowthRecordQuery, GROWTH_RECORD_FIELDS } from '@/lib/queryBuilders';
import { logger } from '@/utils/logger';

interface GrowthRecord {
  id: string;
  animal_id: string;
  user_id: string;
  weight: number;
  height?: number;
  recorded_date: string;
  notes?: string;
  created_at: string;
}

interface GrowthRecordInput {
  animal_id: string;
  weight: number;
  height?: number;
  recorded_date?: string;
  notes?: string;
}

export const useGrowthRecords = (animalId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // OPTIMIZED: Fetch growth records with specific field selection
  const { data: growthRecords = [], isLoading } = useQuery({
    queryKey: ['growth-records', user?.id, animalId],
    queryFn: async () => {
      if (!user) return [];
      
      const startTime = performance.now();
      
      // Use query builder for optimized field selection
      let query = buildGrowthRecordQuery(supabase, user.id, 'list')
        .order('recorded_date', { ascending: false });

      // Add animal filter if specified
      if (animalId) {
        query = query.eq('animal_id', animalId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      const duration = performance.now() - startTime;
      logger.debug(`Query Performance: Growth records${animalId ? ' (filtered)' : ''}: ${duration.toFixed(2)}ms`);
      
      return (data || []) as GrowthRecord[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // OPTIMIZED: Add growth record mutation with specific field selection
  const addRecordMutation = useMutation({
    mutationFn: async (record: GrowthRecordInput) => {
      if (!user) throw new Error('User not authenticated');

      const startTime = performance.now();

      // Insert with specific field selection for response
      const { data, error } = await supabase
        .from('growth_records')
        .insert([{
          ...record,
          user_id: user.id,
          recorded_date: record.recorded_date || new Date().toISOString().split('T')[0],
        }])
        .select(GROWTH_RECORD_FIELDS.detail) // Return detail fields for the new record
        .single();

      if (error) throw error;
      
      const duration = performance.now() - startTime;
      logger.debug(`Query Performance: Add growth record: ${duration.toFixed(2)}ms`);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['growth-records'] });
      toast({
        title: 'Success',
        description: 'Weight record added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add weight record',
        variant: 'destructive',
      });
    },
  });

  // Delete growth record mutation
  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('growth_records')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['growth-records'] });
      toast({
        title: 'Success',
        description: 'Record deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete record',
        variant: 'destructive',
      });
    },
  });

  // Calculate growth statistics
  const calculateGrowthStats = () => {
    if (growthRecords.length === 0) return null;

    const sortedRecords = [...growthRecords].sort(
      (a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime()
    );

    const latestRecord = sortedRecords[sortedRecords.length - 1];
    const firstRecord = sortedRecords[0];
    
    const totalWeightGain = latestRecord.weight - firstRecord.weight;
    const daysBetween = Math.floor(
      (new Date(latestRecord.recorded_date).getTime() - new Date(firstRecord.recorded_date).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    const averageDailyGain = daysBetween > 0 ? totalWeightGain / daysBetween : 0;

    return {
      currentWeight: latestRecord.weight,
      startWeight: firstRecord.weight,
      totalGain: totalWeightGain,
      averageDailyGain: Number(averageDailyGain.toFixed(2)),
      totalRecords: growthRecords.length,
      latestDate: latestRecord.recorded_date,
    };
  };

  return {
    growthRecords,
    isLoading,
    addRecord: addRecordMutation.mutate,
    deleteRecord: deleteRecordMutation.mutate,
    isAdding: addRecordMutation.isPending,
    isDeleting: deleteRecordMutation.isPending,
    stats: calculateGrowthStats(),
  };
};
