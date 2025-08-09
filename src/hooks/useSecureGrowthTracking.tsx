
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useAuth } from '@/contexts/AuthContext';

export const useSecureGrowthTracking = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();
  const { user } = useAuth();

  const recordWeight = async (weightData: {
    animal_id: string;
    weight: number;
    recorded_date?: string;
    notes?: string;
  }) => {
    if (!user) {
      showError('Authentication Required', 'Please sign in to record weight data.');
      return { error: new Error('User not authenticated') };
    }

    setLoading(true);
    
    try {
      // Input validation
      if (!weightData.animal_id || !weightData.weight || weightData.weight <= 0) {
        throw new Error('Animal ID and valid weight are required');
      }

      if (weightData.weight > 5000) {
        throw new Error('Weight seems unrealistic. Please check your entry.');
      }

      // Validate date is not in future
      const recordDate = weightData.recorded_date ? new Date(weightData.recorded_date) : new Date();
      if (recordDate > new Date()) {
        throw new Error('Recording date cannot be in the future');
      }

      // Sanitize inputs
      const sanitizedData = {
        user_id: user.id,
        animal_id: weightData.animal_id,
        weight: Math.round(weightData.weight * 100) / 100, // Round to 2 decimal places
        recorded_date: recordDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        notes: weightData.notes?.trim().substring(0, 500) || null,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('growth_records')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) throw error;

      // Update animal's current weight
      await supabase
        .from('animals')
        .update({ 
          weight: sanitizedData.weight,
          updated_at: new Date().toISOString()
        })
        .eq('id', weightData.animal_id)
        .eq('user_id', user.id);

      // Log the action for audit
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'CREATE',
          table_name: 'growth_records',
          record_id: data.id,
          new_values: sanitizedData
        });

      showSuccess('Weight Recorded', 'Weight has been recorded successfully.');
      return { data, error: null };
    } catch (error: any) {
      console.error('Weight recording error:', error);
      showError('Recording Failed', error.message || 'Failed to record weight');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    recordWeight,
    loading
  };
};
