// src/hooks/useHealthRecords.ts
// React Query hooks for health record management

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useToastContext } from '@/contexts/ToastContext';
import { getUserFriendlyError, getSuccessMessage } from '@/lib/errorMessages';
import { analytics, ANALYTICS_EVENTS } from '@/lib/analytics';
import {
  createHealthRecord,
  getHealthRecordsByAnimal,
  updateHealthRecord,
  deleteHealthRecord,
  getHealthRecordStats,
  getRecentVaccinations
} from '@/services/healthRecordService';
import type { 
  HealthRecord, 
  CreateHealthRecordInput, 
  UpdateHealthRecordInput 
} from '@/types/healthRecord';

const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

export const useHealthRecords = (animalId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toastContext = useToastContext();

  // Query to fetch health records
  const healthRecordsQuery = useQuery({
    queryKey: ['health-records', animalId],
    queryFn: () => getHealthRecordsByAnimal(animalId),
    enabled: !!animalId && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query to fetch health record stats
  const statsQuery = useQuery({
    queryKey: ['health-records-stats', animalId],
    queryFn: () => getHealthRecordStats(animalId),
    enabled: !!animalId && !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Query to fetch recent vaccinations
  const vaccinationsQuery = useQuery({
    queryKey: ['vaccinations', animalId],
    queryFn: () => getRecentVaccinations(animalId, 5),
    enabled: !!animalId && !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (input: CreateHealthRecordInput): Promise<HealthRecord> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await createHealthRecord(input);
      return result;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['health-records', animalId] });
      await queryClient.cancelQueries({ queryKey: ['health-records-stats', animalId] });

      const previousRecords = queryClient.getQueryData(['health-records', animalId]);

      const tempRecord: HealthRecord = {
        id: generateTempId(),
        user_id: user?.id || '',
        animal_id: input.animal_id,
        record_type: input.record_type,
        medicine_name: input.medicine_name || null,
        symptoms: input.symptoms || null,
        severity: input.severity || null,
        notes: input.notes || null,
        photo_url: input.photo_url || null,
        administered_date: input.administered_date,
        created_at: new Date().toISOString()
      };

      queryClient.setQueryData(['health-records', animalId], (old: HealthRecord[] | undefined) => {
        return old ? [tempRecord, ...old] : [tempRecord];
      });

      return { previousRecords };
    },
    onError: (error, input, context) => {
      if (context?.previousRecords) {
        queryClient.setQueryData(['health-records', animalId], context.previousRecords);
      }

      console.error('Error creating health record:', error);
      const errorMsg = getUserFriendlyError(error, 'amharic');
      toastContext.error(errorMsg.message, errorMsg.icon);
    },
    onSuccess: (data, input) => {
      queryClient.invalidateQueries({ queryKey: ['health-records', animalId] });
      queryClient.invalidateQueries({ queryKey: ['health-records-stats', animalId] });
      queryClient.invalidateQueries({ queryKey: ['vaccinations', animalId] });

      const successMsg = getSuccessMessage('health_record_created', 'amharic');
      toastContext.success(successMsg.message || 'Health record created successfully', successMsg.icon);

      analytics.track(ANALYTICS_EVENTS.HEALTH_RECORDED, {
        record_type: input.record_type,
        animal_id: input.animal_id,
        is_offline: data.id.startsWith('temp_')
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (input: UpdateHealthRecordInput): Promise<HealthRecord> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      return await updateHealthRecord(input);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['health-records', animalId] });
      const previousRecords = queryClient.getQueryData(['health-records', animalId]);

      queryClient.setQueryData(['health-records', animalId], (old: HealthRecord[] | undefined) => {
        if (!old) return old;
        return old.map(record => 
          record.id === input.id 
            ? { ...record, ...input }
            : record
        );
      });

      return { previousRecords };
    },
    onError: (error, input, context) => {
      if (context?.previousRecords) {
        queryClient.setQueryData(['health-records', animalId], context.previousRecords);
      }

      console.error('Error updating health record:', error);
      const errorMsg = getUserFriendlyError(error, 'amharic');
      toastContext.error(errorMsg.message, errorMsg.icon);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records', animalId] });
      queryClient.invalidateQueries({ queryKey: ['health-records-stats', animalId] });
      queryClient.invalidateQueries({ queryKey: ['vaccinations', animalId] });

      const successMsg = getSuccessMessage('health_record_updated', 'amharic');
      toastContext.success(successMsg.message || 'Health record updated successfully', successMsg.icon);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (recordId: string): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      await deleteHealthRecord(recordId);
    },
    onMutate: async (recordId) => {
      await queryClient.cancelQueries({ queryKey: ['health-records', animalId] });
      const previousRecords = queryClient.getQueryData(['health-records', animalId]);

      queryClient.setQueryData(['health-records', animalId], (old: HealthRecord[] | undefined) => {
        if (!old) return old;
        return old.filter(record => record.id !== recordId);
      });

      return { previousRecords };
    },
    onError: (error, recordId, context) => {
      if (context?.previousRecords) {
        queryClient.setQueryData(['health-records', animalId], context.previousRecords);
      }

      console.error('Error deleting health record:', error);
      const errorMsg = getUserFriendlyError(error, 'amharic');
      toastContext.error(errorMsg.message, errorMsg.icon);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records', animalId] });
      queryClient.invalidateQueries({ queryKey: ['health-records-stats', animalId] });
      queryClient.invalidateQueries({ queryKey: ['vaccinations', animalId] });

      const successMsg = getSuccessMessage('health_record_deleted', 'amharic');
      toastContext.success(successMsg.message || 'Health record deleted successfully', successMsg.icon);
    }
  });

  return {
    // Queries
    healthRecords: healthRecordsQuery.data || [],
    isLoading: healthRecordsQuery.isLoading,
    error: healthRecordsQuery.error,
    stats: statsQuery.data,
    isStatsLoading: statsQuery.isLoading,
    vaccinations: vaccinationsQuery.data || [],
    isVaccinationsLoading: vaccinationsQuery.isLoading,
    
    // Mutations
    createHealthRecord: createMutation.mutate,
    createHealthRecordAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    
    updateHealthRecord: updateMutation.mutate,
    updateHealthRecordAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    
    deleteHealthRecord: deleteMutation.mutate,
    deleteHealthRecordAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    
    // Refetch
    refetch: healthRecordsQuery.refetch
  };
};

export default useHealthRecords;
