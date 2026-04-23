// Farm Team Management Types

export type FarmRole = 'owner' | 'worker';

export interface Farm {
  id: string;
  name: string;
  owner_id: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface FarmMember {
  id: string;
  farm_id: string;
  user_id: string;
  role: FarmRole;
  can_view_financials: boolean;
  invited_by?: string;
  joined_at: string;
  is_active: boolean;
  created_at: string;
  // Joined data
  profile?: {
    farmer_name: string;
    phone?: string;
  };
}

export interface FarmInvitation {
  id: string;
  farm_id: string;
  phone: string;
  role: 'worker';
  invited_by: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface ActivityLogEntry {
  id: string;
  farm_id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
  // Joined data
  profile?: {
    farmer_name: string;
  };
}

export interface FarmWithMembers extends Farm {
  members: FarmMember[];
}

export interface InvitationResult {
  has_invitation: boolean;
  already_member?: boolean;
  farm_id?: string;
  farm_name?: string;
  role?: FarmRole;
}
