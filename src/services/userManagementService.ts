import { supabase } from '@/integrations/supabase/client';
import {
  ManagedUser,
  UserFilters,
  PaginatedUsers,
  UserStats,
  UserActivity,
  UserAnimals,
  UserListings,
  UserTransactions,
} from '@/types/admin';
import { supportTicketService } from './supportTicketService';

class UserManagementService {
  private readonly USERS_TABLE = 'users';

  async getUsers(
    filters: UserFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedUsers> {
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        farm_name,
        location,
        created_at,
        updated_at,
        email_verified,
        phone_verified,
        last_login
      `, { count: 'exact' });

    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    if (filters.region) {
      query = query.eq('region', filters.region);
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

    const { data: users, count, error } = await query;

    if (error) throw error;

    const userIds = (users || []).map(u => u.id);
    
    const [banStatuses, animalCounts, listingCounts] = await Promise.all([
      this.getBanStatuses(userIds),
      this.getAnimalCounts(userIds),
      this.getListingCounts(userIds),
    ]);

    const formattedUsers: ManagedUser[] = (users || []).map((user: Record<string, unknown>) => {
      const userId = user.id as string;
      return {
        ...user,
        email_verified: user.email_verified ?? false,
        phone_verified: user.phone_verified ?? false,
        is_banned: banStatuses[userId]?.is_banned ?? false,
        ban_reason: banStatuses[userId]?.reason,
        animal_count: animalCounts[userId] ?? 0,
        listing_count: listingCounts[userId] ?? 0,
      } as ManagedUser;
    });

    let filteredUsers = formattedUsers;
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'banned') {
        filteredUsers = formattedUsers.filter(u => u.is_banned);
      } else if (filters.status === 'suspended') {
        filteredUsers = formattedUsers.filter(u => !u.is_banned && false);
      } else if (filters.status === 'active') {
        filteredUsers = formattedUsers.filter(u => !u.is_banned);
      }
    }

    return {
      data: filteredUsers,
      total: count || 0,
      page,
      page_size: pageSize,
      total_pages: Math.ceil((count || 0) / pageSize),
    };
  }

  private async getBanStatuses(userIds: string[]): Promise<Record<string, { is_banned: boolean; reason?: string }>> {
    if (userIds.length === 0) return {};

    const { data: bans } = await supabase
      .from('user_bans')
      .select('user_id, reason, is_active')
      .in('user_id', userIds)
      .eq('is_active', true);

    const result: Record<string, { is_banned: boolean; reason?: string }> = {};
    (bans || []).forEach(ban => {
      result[ban.user_id] = { is_banned: true, reason: ban.reason };
    });
    return result;
  }

  private async getAnimalCounts(userIds: string[]): Promise<Record<string, number>> {
    if (userIds.length === 0) return {};

    const { data } = await supabase
      .from('animals')
      .select('user_id')
      .in('user_id', userIds);

    const counts: Record<string, number> = {};
    (data || []).forEach(item => {
      counts[item.user_id] = (counts[item.user_id] || 0) + 1;
    });
    return counts;
  }

  private async getListingCounts(userIds: string[]): Promise<Record<string, number>> {
    if (userIds.length === 0) return {};

    const { data } = await supabase
      .from('market_listings')
      .select('user_id')
      .in('user_id', userIds);

    const counts: Record<string, number> = {};
    (data || []).forEach(item => {
      counts[item.user_id] = (counts[item.user_id] || 0) + 1;
    });
    return counts;
  }

  async getUserById(userId: string): Promise<ManagedUser | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    const [banStatus, animalCount, listingCount] = await Promise.all([
      this.getBanStatuses([userId]),
      this.getAnimalCounts([userId]),
      this.getListingCounts([userId]),
    ]);

    return {
      ...user,
      email_verified: user.email_verified ?? false,
      phone_verified: user.phone_verified ?? false,
      is_banned: banStatus[userId]?.is_banned ?? false,
      ban_reason: banStatus[userId]?.reason,
      animal_count: animalCount[userId] ?? 0,
      listing_count: listingCount[userId] ?? 0,
    };
  }

  async getUserStats(): Promise<UserStats> {
    const { data: users, count: totalCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [{ data: bannedUsers }, { count: newToday }, { count: newWeek }, { count: newMonth }] = await Promise.all([
      supabase.from('user_bans').select('user_id', { count: 'exact' }).eq('is_active', true),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString()),
    ]);

    const bannedIds = new Set((bannedUsers || []).map(b => b.user_id));
    const activeCount = (totalCount || 0) - bannedIds.size;

    return {
      total: totalCount || 0,
      active: activeCount,
      suspended: 0,
      banned: bannedIds.size,
      new_today: newToday || 0,
      new_this_week: newWeek || 0,
      new_this_month: newMonth || 0,
    };
  }

  async getUserActivities(userId: string, limit: number = 50): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getUserAnimals(userId: string): Promise<UserAnimals[]> {
    const { data, error } = await supabase
      .from('animals')
      .select('id, animal_code, name, type, breed, gender, birth_date, health_status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(animal => ({
      ...animal,
      age: this.calculateAge(animal.birth_date),
    }));
  }

  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  async getUserListings(userId: string): Promise<UserListings[]> {
    const { data, error } = await supabase
      .from('market_listings')
      .select('id, title, type, price, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserTransactions(userId: string): Promise<UserTransactions[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, type, amount, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  async banUser(userId: string, reason: string, banType: 'temporary' | 'permanent' = 'temporary', durationHours?: number): Promise<void> {
    await supportTicketService.banUser(userId, banType, reason, {}, durationHours);
  }

  async unbanUser(userId: string): Promise<void> {
    await supportTicketService.unbanUser(userId);
  }

  async getUserBanStatus(userId: string): Promise<{ is_banned: boolean; reason?: string; ban_type?: string; end_time?: string } | null> {
    const ban = await supportTicketService.getUserBanStatus(userId);
    if (!ban) return null;
    return {
      is_banned: ban.is_active,
      reason: ban.reason,
      ban_type: ban.ban_type,
      end_time: ban.end_time || undefined,
    };
  }
}

export const userManagementService = new UserManagementService();
