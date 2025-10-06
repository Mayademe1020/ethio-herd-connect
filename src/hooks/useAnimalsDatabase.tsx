import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AnimalData } from '@/types';

export const useAnimalsDatabase = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAnimals = async (): Promise<AnimalData[]> => {
    if (!user) return [];
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('animals')
        .insert([{ ...animalData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

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
      const { data, error } = await supabase
        .from('animals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', animalId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

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
    loading,
    fetchAnimals,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    bulkDelete,
  };
};
