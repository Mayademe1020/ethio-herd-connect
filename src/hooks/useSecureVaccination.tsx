
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useAuth } from '@/contexts/AuthContext';

export const useSecureVaccination = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();
  const { user } = useAuth();

  const recordVaccination = async (vaccinationData: {
    animal_id: string;
    medicine_name: string;
    administered_date: string;
    notes?: string;
    photo_url?: string;
  }) => {
    if (!user) {
      showError('Authentication Required', 'Please sign in to record vaccinations.');
      return { error: new Error('User not authenticated') };
    }

    setLoading(true);
    
    try {
      // Input validation
      if (!vaccinationData.animal_id || !vaccinationData.medicine_name || !vaccinationData.administered_date) {
        throw new Error('Animal ID, medicine name, and date are required');
      }

      // Validate date is not in future
      const adminDate = new Date(vaccinationData.administered_date);
      if (adminDate > new Date()) {
        throw new Error('Vaccination date cannot be in the future');
      }

      // Sanitize inputs
      const sanitizedData = {
        user_id: user.id,
        animal_id: vaccinationData.animal_id,
        record_type: 'vaccination',
        medicine_name: vaccinationData.medicine_name.trim().substring(0, 200),
        administered_date: vaccinationData.administered_date,
        notes: vaccinationData.notes?.trim().substring(0, 1000) || null,
        photo_url: vaccinationData.photo_url || null,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('health_records')
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
          table_name: 'health_records',
          record_id: data.id,
          new_values: sanitizedData
        });

      showSuccess('Vaccination Recorded', 'Vaccination has been recorded successfully.');
      return { data, error: null };
    } catch (error: any) {
      console.error('Vaccination recording error:', error);
      showError('Recording Failed', error.message || 'Failed to record vaccination');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    recordVaccination,
    loading
  };
};
