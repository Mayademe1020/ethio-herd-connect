import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextMVP';
import { validateAndSanitizeText, validateEmail, validateInput, sanitizeInput } from '@/utils/inputValidation';
import type { AnimalData } from '@/types';

export type UpdateAnimalInput = {
  name?: string;
  subtype?: string;
  photo_url?: string;
  breed?: string;
  color?: string;
  notes?: string;
};

export const useSecureAnimalRegistration = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const validateInput = (input: string, fieldName: string): boolean => {
    if (!input || input.trim().length === 0) {
      return false;
    }
    return input.length <= 100;
  };

  const sanitizeInput = (input: string): string => {
    return validateAndSanitizeText(input);
  };

  const registerAnimal = async (animalData: {
    name: string;
    type: string;
    breed: string;
    birth_date?: string;
    gender?: string;
    color?: string;
    weight?: number;
    health_status?: 'healthy' | 'sick' | 'attention' | 'critical';
    notes?: string;
    photo_url?: string;
  }) => {
    if (!user) {
      toast.error('Authentication Required');
      return { error: new Error('User not authenticated') };
    }

    setLoading(true);
    
    try {
      // Input validation
      if (!validateInput(animalData.name, 'name')) {
        throw new Error('Please provide a valid animal name');
      }

      if (!animalData.type) {
        throw new Error('Animal type is required');
      }

      // Get farm profile for prefix
      const { data: farmProfile } = await supabase
        .from('farm_profiles')
        .select('farm_prefix')
        .eq('user_id', user.id)
        .single();

      const farmPrefix = farmProfile?.farm_prefix || 'FARM';

      // Generate animal code using database function
      const { data: animalCode, error: codeError } = await supabase
        .rpc('generate_animal_code', {
          p_user_id: user.id,
          p_farm_prefix: farmPrefix,
          p_animal_type: animalData.type
        });

      if (codeError) throw codeError;

      // Sanitize inputs
      const sanitizedData = {
        user_id: user.id,
        animal_code: animalCode,
        name: sanitizeInput(animalData.name),
        type: animalData.type,
        breed: animalData.breed ? sanitizeInput(animalData.breed) : null,
        birth_date: animalData.birth_date || null,
        gender: animalData.gender || null,
        color: animalData.color ? sanitizeInput(animalData.color) : null,
        weight: animalData.weight || null,
        health_status: animalData.health_status || 'healthy',
        notes: animalData.notes ? sanitizeInput(animalData.notes) : null,
        photo_url: animalData.photo_url || null,
        is_vet_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('animals')
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
          table_name: 'animals',
          record_id: data.id,
          new_values: sanitizedData
        });

      toast.success(`${animalData.name} has been registered successfully with ID: ${animalCode}`);
      return { data, error: null };
    } catch (error: unknown) {
      console.error('Animal registration error:', error);
      toast.error('Registration Failed');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateAnimal = async (animalId: string, updateData: UpdateAnimalInput) => {
    if (!user) {
      toast.error('Authentication Required');
      return { error: new Error('User not authenticated') };
    }

    setLoading(true);
    
    try {
      // Get current animal data for audit log - select all fields we need
      const { data: currentAnimal } = await supabase
        .from('animals')
        .select('id, name, breed, color, notes, updated_at')
        .eq('id', animalId)
        .eq('user_id', user.id)
        .single();

      if (!currentAnimal) {
        throw new Error('Animal not found or you do not have permission to update it');
      }

      const typedCurrentAnimal = currentAnimal as AnimalData;

      // Sanitize update data with safe property access
      const sanitizedData = {
        ...updateData,
        name: updateData.name ? sanitizeInput(updateData.name) : currentAnimal.name,
        breed: updateData.breed ? sanitizeInput(updateData.breed) : currentAnimal.breed,
        color: updateData.color ? sanitizeInput(updateData.color) : typedCurrentAnimal.color || null,
        notes: updateData.notes ? sanitizeInput(updateData.notes) : typedCurrentAnimal.notes || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('animals')
        .update(sanitizedData)
        .eq('id', animalId)
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
          table_name: 'animals',
          record_id: animalId,
          old_values: currentAnimal,
          new_values: sanitizedData
        });

      toast.success('Animal information has been updated successfully.');
      return { data, error: null };
    } catch (error: unknown) {
      console.error('Animal update error:', error);
      toast.error('Update Failed');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    registerAnimal,
    updateAnimal,
    loading
  };
};
