// src/hooks/useFarm.tsx - Hook to manage farm and team members

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import type { Farm, FarmMember, FarmInvitation, InvitationResult } from '@/types/farm';

export const useFarm = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's farm (the farm they're a member of)
  const { data: farm, isLoading: farmLoading, error: farmError } = useQuery({
    queryKey: ['farm', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get the user's farm membership
      const { data: membership, error: membershipError } = await supabase
        .from('farm_members' as any)
        .select('farm_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('role', { ascending: true }) // owner first
        .limit(1)
        .maybeSingle();

      if (membershipError) {
        console.error('Farm membership fetch error:', membershipError);
        throw membershipError;
      }

      if (!membership) {
        return null;
      }

      // Fetch the farm details
      const { data: farmData, error: farmError } = await supabase
        .from('farms' as any)
        .select('*')
        .eq('id', (membership as any).farm_id)
        .single();

      if (farmError) {
        console.error('Farm fetch error:', farmError);
        throw farmError;
      }

      return {
        ...farmData,
        user_role: (membership as any).role,
      } as Farm & { user_role: string };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  // Fetch farm members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['farm-members', farm?.id],
    queryFn: async () => {
      if (!farm?.id) return [];

      const { data, error } = await supabase
        .from('farm_members' as any)
        .select('*')
        .eq('farm_id', farm.id)
        .eq('is_active', true)
        .order('role', { ascending: true });

      if (error) {
        console.error('Farm members fetch error:', error);
        throw error;
      }

      // Fetch profiles for all members
      const memberList = (data as any[]) || [];
      const userIds = memberList.map((m: any) => m.user_id);

      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles' as any)
        .select('id, farmer_name, phone')
        .in('id', userIds);

      const profileMap = new Map(
        ((profiles as any[]) || []).map((p: any) => [p.id, p])
      );

      return memberList.map((member: any) => ({
        ...member,
        profile: profileMap.get(member.user_id) || { farmer_name: 'Unknown', phone: '' },
      })) as FarmMember[];
    },
    enabled: !!farm?.id,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch pending invitations
  const { data: invitations, isLoading: invitationsLoading } = useQuery({
    queryKey: ['farm-invitations', farm?.id],
    queryFn: async () => {
      if (!farm?.id) return [];

      const { data, error } = await supabase
        .from('farm_invitations' as any)
        .select('*')
        .eq('farm_id', farm.id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Invitations fetch error:', error);
        throw error;
      }

      return (data || []) as FarmInvitation[];
    },
    enabled: !!farm?.id,
    staleTime: 2 * 60 * 1000,
  });

  // Check if current user is owner
  const isOwner = farm?.user_role === 'owner';

  // Create a farm
  const createFarmMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('User not authenticated');

      // Create the farm
      const { data: newFarm, error: farmError } = await (supabase as any)
        .from('farms')
        .insert({ name, owner_id: user.id })
        .select()
        .single();

      if (farmError) throw farmError;

      // Add user as owner member
      const { error: memberError } = await (supabase as any)
        .from('farm_members')
        .insert({
          farm_id: newFarm.id,
          user_id: user.id,
          role: 'owner',
          invited_by: user.id,
          can_view_financials: true,
        });

      if (memberError) throw memberError;

      return newFarm as Farm;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm', user?.id] });
    },
  });

  // Add a member by phone number
  const addMemberMutation = useMutation({
    mutationFn: async ({ phone, role }: { phone: string; role: 'worker' }) => {
      if (!farm?.id || !user) throw new Error('No farm or user');

      // Validate Ethiopian phone format
      const cleanPhone = phone.replace(/\D/g, '');
      if (!/^9\d{8}$/.test(cleanPhone)) {
        throw new Error('Invalid phone number. Use Ethiopian format: 9XXXXXXXX');
      }

      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles' as any)
        .select('id')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (existingProfile) {
        // User exists - add directly to farm_members
        const { error } = await (supabase as any)
          .from('farm_members')
          .upsert({
            farm_id: farm.id,
            user_id: (existingProfile as any).id,
            role,
            invited_by: user.id,
            is_active: true,
          }, { onConflict: 'farm_id,user_id' });

        if (error) throw error;

        return { type: 'added', phone: cleanPhone };
      } else {
        // User doesn't exist - create invitation
        const { error } = await (supabase as any)
          .from('farm_invitations')
          .insert({
            farm_id: farm.id,
            phone: cleanPhone,
            role,
            invited_by: user.id,
          });

        if (error) throw error;

        return { type: 'invited', phone: cleanPhone };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-members', farm?.id] });
      queryClient.invalidateQueries({ queryKey: ['farm-invitations', farm?.id] });
    },
  });

  // Toggle financial access for a member
  const toggleFinancialAccessMutation = useMutation({
    mutationFn: async ({ memberId, canView }: { memberId: string; canView: boolean }) => {
      const { error } = await (supabase as any)
        .from('farm_members')
        .update({ can_view_financials: canView })
        .eq('id', memberId)
        .eq('farm_id', farm?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-members', farm?.id] });
    },
  });

  // Remove a member
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await (supabase as any)
        .from('farm_members')
        .update({ is_active: false })
        .eq('id', memberId)
        .eq('farm_id', farm?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-members', farm?.id] });
    },
  });

  // Delete an invitation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await (supabase as any)
        .from('farm_invitations')
        .delete()
        .eq('id', invitationId)
        .eq('farm_id', farm?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm-invitations', farm?.id] });
    },
  });

  // Check for pending invitations on login
  const checkInvitations = async (phone: string): Promise<InvitationResult> => {
    const { data, error } = await supabase
      .rpc('accept_pending_invitation', { p_phone: phone });

    if (error) {
      console.error('Check invitations error:', error);
      return { has_invitation: false };
    }

    return (data as any) as InvitationResult;
  };

  return {
    // Data
    farm,
    members: members || [],
    invitations: invitations || [],

    // Loading states
    isLoading: farmLoading || membersLoading,
    isMembersLoading: membersLoading,
    isInvitationsLoading: invitationsLoading,

    // Errors
    error: farmError,

    // Permissions
    isOwner,

    // Mutations
    createFarm: createFarmMutation.mutateAsync,
    isCreating: createFarmMutation.isPending,

    addMember: addMemberMutation.mutateAsync,
    isAddingMember: addMemberMutation.isPending,

    toggleFinancialAccess: toggleFinancialAccessMutation.mutate,
    isTogglingFinancial: toggleFinancialAccessMutation.isPending,

    removeMember: removeMemberMutation.mutateAsync,
    isRemovingMember: removeMemberMutation.isPending,

    deleteInvitation: deleteInvitationMutation.mutateAsync,
    isDeletingInvitation: deleteInvitationMutation.isPending,

    // Utils
    checkInvitations,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['farm', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['farm-members', farm?.id] });
      queryClient.invalidateQueries({ queryKey: ['farm-invitations', farm?.id] });
    },
  };
};
