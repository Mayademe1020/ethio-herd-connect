import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AnimalData } from '@/types';
import { buildAnimalQuery, ANIMAL_FIELDS } from '@/lib/queryBuilders';
import { logger } from '@/utils/logger';

export const useAnimalsDatabase = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch animals with React Query - OPTIMIZED with specific field selection
  const { data: animals = [], isLoading } = useQuery({
    queryKey: ['animals', user?.id, 'list'],
    queryFn: async () => {
      if (!user) return [];
      
      const startTime = performance.now();
      
      // Use query builder for optimized field selection
      const { data, error } = await buildAnimalQuery(supabase, user.id, 'list')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const duration = performance.now() - startTime;
      logger.debug(`Query Performance: Animals list: ${duration.toFixed(2)}ms`);
      
      return (data || []) as AnimalData[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const fetchAnimals = async (): Promise<AnimalData[]> => {
    if (!user) return [];
    
    try {
      setLoading(true);
      const startTime = performance.now();
      
      // Use query builder for optimized field selection
      const { data, error } = await buildAnimalQuery(supabase, user.id, 'list')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const duration = performance.now() - startTime;
      logger.debug(`Query Performance: Fetch animals: ${duration.toFixed(2)}ms`);
      
      return (data || []) as AnimalData[];
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch animals',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createAnimal = async (animalData: Omit<AnimalData, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add animals',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setLoading(true);
      const startTime = performance.now();
      
      // Insert with specific field selection for the response
      const { data, error } = await supabase
        .from('animals')
        .insert([{ ...animalData, user_id: user.id }])
        .select(ANIMAL_FIELDS.detail) // Return all fields for the created animal
        .single();

      if (error) throw error;

      const duration = performance.now() - startTime;
      logger.debug(`Query Performance: Create animal: ${duration.toFixed(2)}ms`);

      queryClient.invalidateQueries({ queryKey: ['animals'] });
      
      toast({
        title: 'Success',
        description: 'Animal registered successfully',
      });

      return data as AnimalData;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to register animal',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAnimal = async (animalId: string, updates: Partial<AnimalData>) => {
    if (!user) return null;

    try {
      setLoading(true);
      const startTime = performance.now();
      
      // Update with specific field selection for the response
      const { data, error } = await supabase
        .from('animals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', animalId)
        .eq('user_id', user.id)
        .select(ANIMAL_FIELDS.detail) // Return all fields for the updated animal
        .single();

      if (error) throw error;

      const duration = performance.now() - startTime;
      logger.debug(`Query Performance: Update animal: ${duration.toFixed(2)}ms`);

      queryClient.invalidateQueries({ queryKey: ['animals'] });
      
      toast({
        title: 'Success',
        description: 'Animal updated successfully',
      });

      return data as AnimalData;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update animal',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAnimal = async (animalId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', animalId)
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['animals'] });
      
      toast({
        title: 'Success',
        description: 'Animal deleted successfully',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete animal',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async (animalIds: string[]) => {
    if (!user || animalIds.length === 0) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('animals')
        .delete()
        .in('id', animalIds)
        .eq('user_id', user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['animals'] });
      
      toast({
        title: 'Success',
        description: `${animalIds.length} animals deleted successfully`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete animals',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    animals,
    isLoading,
    loading,
    fetchAnimals: async () => animals, // For backward compatibility
    createAnimal,
    updateAnimal,
    deleteAnimal,
    bulkDelete,
  };
};
