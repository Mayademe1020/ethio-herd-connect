
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useAuth } from '@/contexts/AuthContext';

export const useSecureHealthSubmission = () => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToastNotifications();
  const { user } = useAuth();

  const submitHealthRecord = async (healthData: {
    animal_id: string;
    symptoms: string;
    description?: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    photo_url?: string;
  }) => {
    if (!user) {
      showError('Authentication Required', 'Please sign in to submit health records.');
      return { error: new Error('User not authenticated') };
    }

    setLoading(true);
    
    try {
      // Input validation
      if (!healthData.animal_id || !healthData.symptoms) {
        throw new Error('Animal ID and symptoms are required');
      }

      // Sanitize inputs
      const sanitizedData = {
        user_id: user.id,
        animal_id: healthData.animal_id.trim(),
        symptoms: healthData.symptoms.trim().substring(0, 1000),
        description: healthData.description?.trim().substring(0, 2000) || null,
        urgency: healthData.urgency,
        photo_url: healthData.photo_url || null,
        status: 'new',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('health_submissions')
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
          table_name: 'health_submissions',
          record_id: data.id,
          new_values: sanitizedData
        });

      showSuccess('Health Record Submitted', 'Your health submission has been recorded successfully.');
      return { data, error: null };
    } catch (error: any) {
      console.error('Health submission error:', error);
      showError('Submission Failed', error.message || 'Failed to submit health record');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    submitHealthRecord,
    loading
  };
};
