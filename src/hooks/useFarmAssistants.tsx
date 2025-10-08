import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToastNotifications } from '@/hooks/useToastNotifications';

export interface FarmAssistant {
  id: string;
  farm_owner_id: string;
  assistant_user_id: string;
  permissions: {
    view_records?: boolean;
    update_health?: boolean;
    register_animals?: boolean;
  };
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const useFarmAssistants = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastNotifications();

  // Fetch all farm assistants for the current user
  const { data: assistants = [], isLoading } = useQuery({
    queryKey: ['farm-assistants', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('farm_assistants')
        .select('*')
        .eq('farm_owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FarmAssistant[];
    },
    enabled: !!user
  });

  // Add assistant mutation
  const addAssistantMutation = useMutation({
    mutationFn: async (assistantData: {
      assistant_user_id: string;
      permissions?: {
        view_records?: boolean;
        update_health?: boolean;
        register_animals?: boolean;
      };
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('farm_assistants')
        .insert([{
          farm_owner_id: user.id,
          assistant_user_id: assistantData.assistant_user_id,
          permissions: assistantData.permissions || {
            view_records: true,
            update_health: true,
            register_animals: true
          },
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-assistants'] });
      showSuccess('Success', 'Assistant invitation sent successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to add assistant');
    }
  });

  // Update assistant mutation
  const updateAssistantMutation = useMutation({
    mutationFn: async ({ 
      assistantId, 
      updates 
    }: { 
      assistantId: string; 
      updates: Partial<FarmAssistant> 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('farm_assistants')
        .update(updates)
        .eq('id', assistantId)
        .eq('farm_owner_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-assistants'] });
      showSuccess('Success', 'Assistant updated successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to update assistant');
    }
  });

  // Delete assistant mutation
  const deleteAssistantMutation = useMutation({
    mutationFn: async (assistantId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('farm_assistants')
        .delete()
        .eq('id', assistantId)
        .eq('farm_owner_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-assistants'] });
      showSuccess('Success', 'Assistant removed successfully');
    },
    onError: (error: any) => {
      showError('Error', error.message || 'Failed to remove assistant');
    }
  });

  // Update status
  const updateStatus = async (assistantId: string, status: 'active' | 'inactive' | 'pending') => {
    return updateAssistantMutation.mutateAsync({ 
      assistantId, 
      updates: { status } 
    });
  };

  return {
    assistants,
    isLoading,
    addAssistant: addAssistantMutation.mutate,
    updateAssistant: updateAssistantMutation.mutate,
    deleteAssistant: deleteAssistantMutation.mutate,
    updateStatus,
    isAdding: addAssistantMutation.isPending,
    isUpdating: updateAssistantMutation.isPending,
    isDeleting: deleteAssistantMutation.isPending
  };
};
