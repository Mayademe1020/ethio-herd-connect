import { supabase } from '@/integrations/supabase/client';
import {
  SupportTicket,
  SupportTicketWithDetails,
  SupportTicketMessage,
  UserBan,
  UserBanWithDetails,
  SupportCategory,
  CreateTicketDTO,
  UpdateTicketDTO,
  TicketFilters,
  TicketStatus,
  TicketPriority,
  BanType,
  PaginatedTickets,
  DeviceInfo
} from '@/types/admin';

class SupportTicketService {
  private readonly TABLE_NAME = 'support_tickets';
  private readonly MESSAGES_TABLE = 'support_ticket_messages';
  private readonly BANS_TABLE = 'user_bans';
  private readonly CATEGORIES_TABLE = 'support_categories';

  async getTicketNumber(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_ticket_number');
    if (error) throw error;
    return data;
  }

  async calculateSlaDeadline(priority: TicketPriority): Promise<string> {
    const { data, error } = await supabase.rpc('calculate_sla_deadline', { priority });
    if (error) throw error;
    return data;
  }

  async createTicket(data: CreateTicketDTO): Promise<SupportTicket> {
    const ticketNumber = await this.getTicketNumber();
    const slaDeadline = await this.calculateSlaDeadline(data.priority);

    const ticketData = {
      user_id: data.user_id,
      ticket_number: ticketNumber,
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: 'open' as TicketStatus,
      sla_deadline: slaDeadline,
      related_animal_id: data.related_animal_id || null,
      related_listing_id: data.related_listing_id || null,
      user_region: data.user_region || null,
      user_device_info: data.user_device_info || {},
    };

    const { data: ticket, error } = await supabase
      .from(this.TABLE_NAME)
      .insert(ticketData)
      .select()
      .single();

    if (error) throw error;
    return ticket;
  }

  async getTickets(
    filters: TicketFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedTickets> {
    let query = supabase
      .from(this.TABLE_NAME)
      .select(`
        *,
        user:user_id(id, email, raw_user_meta_data),
        assigned_admin:assigned_admin_id(id, email, full_name)
      `, { count: 'exact' });

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }

    if (filters.category && filters.category.length > 0) {
      query = query.in('category', filters.category);
    }

    if (filters.assigned_admin_id) {
      query = query.eq('assigned_admin_id', filters.assigned_admin_id);
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.search) {
      query = query.or(`subject.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: tickets, count, error } = await query;

    if (error) throw error;

    const formattedTickets = (tickets || []).map((ticket: Record<string, unknown>) => ({
      ...ticket,
      user: ticket.user as { id: string; email: string; full_name: string; phone?: string } | undefined,
      assigned_admin: ticket.assigned_admin as SupportTicket['assigned_admin'],
    }));

    return {
      data: formattedTickets,
      total: count || 0,
      page,
      page_size: pageSize,
      total_pages: Math.ceil((count || 0) / pageSize),
    };
  }

  async getTicketById(id: string): Promise<SupportTicketWithDetails | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select(`
        *,
        user:user_id(id, email, raw_user_meta_data),
        assigned_admin:assigned_admin_id(id, email, full_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      user: data.user as { id: string; email: string; full_name: string; phone?: string } | undefined,
      assigned_admin: data.assigned_admin as SupportTicketWithDetails['assigned_admin'],
    };
  }

  async updateTicket(id: string, data: UpdateTicketDTO): Promise<SupportTicket> {
    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    if (data.status === 'in_progress' && !data.assigned_admin_id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: admin } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', user.id)
          .single();
        if (admin) {
          updateData.assigned_admin_id = admin.id;
          updateData.first_response_at = new Date().toISOString();
        }
      }
    }

    if (data.status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    if (data.status === 'closed') {
      updateData.closed_at = new Date().toISOString();
    }

    const { data: ticket, error } = await supabase
      .from(this.TABLE_NAME)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return ticket;
  }

  async assignTicket(ticketId: string, adminId: string): Promise<SupportTicket> {
    const { data: ticket, error } = await supabase
      .from(this.TABLE_NAME)
      .update({
        assigned_admin_id: adminId,
        status: 'in_progress' as TicketStatus,
        first_response_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return ticket;
  }

  async addMessage(
    ticketId: string,
    message: string,
    senderType: 'admin' | 'system' = 'admin',
    isInternal: boolean = false
  ): Promise<SupportTicketMessage> {
    let senderId: string;

    if (senderType === 'admin') {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      senderId = admin?.id || user.id;
    } else {
      senderId = 'system';
    }

    const { data: msg, error } = await supabase
      .from(this.MESSAGES_TABLE)
      .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        sender_type: senderType,
        message,
        is_internal: isInternal,
      })
      .select()
      .single();

    if (error) throw error;
    return msg;
  }

  async getTicketMessages(ticketId: string): Promise<SupportTicketMessage[]> {
    const { data, error } = await supabase
      .from(this.MESSAGES_TABLE)
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async updateStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket> {
    return this.updateTicket(ticketId, { status });
  }

  async escalateTicket(ticketId: string): Promise<SupportTicket> {
    return this.updateTicket(ticketId, { 
      status: 'escalated',
      priority: 'critical'
    });
  }

  async getCategories(): Promise<SupportCategory[]> {
    const { data, error } = await supabase
      .from(this.CATEGORIES_TABLE)
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // User Ban Methods
  async banUser(
    userId: string,
    banType: BanType,
    reason: string,
    evidence: Record<string, unknown> = {},
    durationHours?: number
  ): Promise<UserBan> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: admin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let endTime: string | null = null;
    if (banType === 'temporary' && durationHours) {
      endTime = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
    }

    const { data: ban, error } = await supabase
      .from(this.BANS_TABLE)
      .insert({
        user_id: userId,
        banned_by: admin?.id || user.id,
        ban_type: banType,
        reason,
        evidence,
        end_time: endTime,
        ban_type: banType === 'warning' ? 'temporary' : banType,
      })
      .select()
      .single();

    if (error) throw error;
    return ban;
  }

  async unbanUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from(this.BANS_TABLE)
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
  }

  async getUserBanStatus(userId: string): Promise<UserBan | null> {
    const { data, error } = await supabase
      .from(this.BANS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async getActiveBans(
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: UserBanWithDetails[]; total: number }> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: bans, count, error } = await supabase
      .from(this.BANS_TABLE)
      .select(`
        *,
        banned_user:user_id(id, email, raw_user_meta_data),
        banning_admin:banned_by(id, email, full_name)
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const formattedBans = (bans || []).map((ban: Record<string, unknown>) => ({
      ...ban,
      banned_user: ban.banned_user as { id: string; email: string; full_name: string; phone?: string } | undefined,
      banning_admin: ban.banning_admin as UserBanWithDetails['banning_admin'],
    }));

    return {
      data: formattedBans,
      total: count || 0,
    };
  }

  async getAllBans(
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: UserBanWithDetails[]; total: number }> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: bans, count, error } = await supabase
      .from(this.BANS_TABLE)
      .select(`
        *,
        banned_user:user_id(id, email, raw_user_meta_data),
        banning_admin:banned_by(id, email, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const formattedBans = (bans || []).map((ban: Record<string, unknown>) => ({
      ...ban,
      banned_user: ban.banned_user as { id: string; email: string; full_name: string; phone?: string } | undefined,
      banning_admin: ban.banning_admin as UserBanWithDetails['banning_admin'],
    }));

    return {
      data: formattedBans,
      total: count || 0,
    };
  }

  async getTicketStats(): Promise<{
    total: number;
    open: number;
    in_progress: number;
    pending_user: number;
    resolved: number;
    closed: number;
    escalated: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('status, priority');

    if (error) throw error;

    const stats = {
      total: data.length,
      open: 0,
      in_progress: 0,
      pending_user: 0,
      resolved: 0,
      closed: 0,
      escalated: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    data.forEach((ticket: { status: TicketStatus; priority: TicketPriority }) => {
      if (ticket.status in stats) {
        stats[ticket.status as keyof typeof stats]++;
      }
      if (ticket.priority in stats) {
        stats[ticket.priority as keyof typeof stats]++;
      }
    });

    return stats;
  }
}

export const supportTicketService = new SupportTicketService();
