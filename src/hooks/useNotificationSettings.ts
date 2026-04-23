import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { logger } from '@/utils/logger';

export interface NotificationSettings {
  push_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  telegram_notifications_enabled: boolean;
  telegram_chat_id: string | null;
  telegram_username: string | null;
}

export const useNotificationSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: ['notificationSettings', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('farm_profiles')
        .select(`
          push_notifications_enabled,
          email_notifications_enabled,
          telegram_notifications_enabled,
          telegram_chat_id,
          telegram_username
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching notification settings', error);
        throw error;
      }

      return (data || {
        push_notifications_enabled: true,
        email_notifications_enabled: false,
        telegram_notifications_enabled: false,
        telegram_chat_id: null,
        telegram_username: null,
      }) as NotificationSettings;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationSettings>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('farm_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating notification settings', error);
        throw error;
      }

      return data as NotificationSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings', user?.id] });
      logger.info('Notification settings updated successfully');
    },
  });

  const setPushNotifications = async (enabled: boolean) => {
    await updateSettingsMutation.mutateAsync({ push_notifications_enabled: enabled });
  };

  const setEmailNotifications = async (enabled: boolean) => {
    await updateSettingsMutation.mutateAsync({ email_notifications_enabled: enabled });
  };

  const setTelegramNotifications = async (enabled: boolean) => {
    await updateSettingsMutation.mutateAsync({ telegram_notifications_enabled: enabled });
  };

  const isTelegramConnected = !!settings?.telegram_chat_id;

  return {
    settings,
    isLoading,
    error,
    refetch,
    isUpdating: updateSettingsMutation.isPending,
    setPushNotifications,
    setEmailNotifications,
    setTelegramNotifications,
    isTelegramConnected,
    telegramUsername: settings?.telegram_username,
  };
};

export default useNotificationSettings;
