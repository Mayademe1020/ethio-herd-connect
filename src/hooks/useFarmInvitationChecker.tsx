// src/hooks/useFarmInvitationChecker.tsx
// Checks for pending farm invitations after login and auto-joins

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContextMVP';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFarmInvitationChecker = () => {
  const { user } = useAuth();
  const checked = useRef(false);

  useEffect(() => {
    if (!user || checked.current) return;

    const checkInvitations = async () => {
      checked.current = true;

      try {
        // Get user's phone from profile
        const { data: profile } = await supabase
          .from('profiles' as any)
          .select('phone')
          .eq('id', user.id)
          .maybeSingle();

        const phone = (profile as any)?.phone;
        if (!phone) return;

        // Check for pending invitations
        const { data: invitation } = await supabase
          .from('farm_invitations' as any)
          .select('*')
          .eq('phone', phone)
          .is('accepted_at', null)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!invitation) return;

        const inv = invitation as any;

        // Check if already a member of this farm
        const { data: existingMember } = await supabase
          .from('farm_members' as any)
          .select('id')
          .eq('farm_id', inv.farm_id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingMember) {
          // Already a member, just mark invitation as accepted
          await (supabase as any)
            .from('farm_invitations')
            .update({ accepted_at: new Date().toISOString() })
            .eq('id', inv.id);
          return;
        }

        // Join the farm
        await (supabase as any)
          .from('farm_members')
          .insert({
            farm_id: inv.farm_id,
            user_id: user.id,
            role: inv.role,
            invited_by: inv.invited_by,
            is_active: true,
          });

        // Mark invitation as accepted
        await (supabase as any)
          .from('farm_invitations')
          .update({ accepted_at: new Date().toISOString() })
          .eq('id', inv.id);

        // Get farm name for toast
        const { data: farm } = await supabase
          .from('farms' as any)
          .select('name')
          .eq('id', inv.farm_id)
          .single();

        toast.success(
          `🎉 You've joined ${(farm as any)?.name || 'a farm'} team!`,
          { duration: 5000 }
        );
      } catch (err) {
        console.error('Invitation check error:', err);
      }
    };

    // Delay slightly to not block initial render
    const timer = setTimeout(checkInvitations, 1500);
    return () => clearTimeout(timer);
  }, [user?.id]);
};
