import { supabase } from '@/integrations/supabase/client';
import {
  AuditLog,
  AuditAction,
  AuditResourceType,
  AuditSeverity,
  AuditLogFilters,
  PaginatedAuditLogs,
  AuditLogStats,
} from '@/types/admin';

class AuditLogService {
  private readonly TABLE_NAME = 'audit_logs';

  async getLogs(
    filters: AuditLogFilters = {},
    page: number = 1,
    pageSize: number = 50
  ): Promise<PaginatedAuditLogs> {
    let query = supabase
      .from(this.TABLE_NAME)
      .select('*', { count: 'exact' });

    if (filters.admin_id) {
      query = query.eq('admin_id', filters.admin_id);
    }

    if (filters.admin_email) {
      query = query.ilike('admin_email', `%${filters.admin_email}%`);
    }

    if (filters.action && filters.action.length > 0) {
      query = query.in('action', filters.action);
    }

    if (filters.resource_type && filters.resource_type.length > 0) {
      query = query.in('resource_type', filters.resource_type);
    }

    if (filters.severity && filters.severity.length > 0) {
      query = query.in('severity', filters.severity);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters.search) {
      query = query.or(
        `admin_email.ilike.%${filters.search}%,resource_name.ilike.%${filters.search}%,resource_id.ilike.%${filters.search}%`
      );
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      page_size: pageSize,
      total_pages: Math.ceil((count || 0) / pageSize),
    };
  }

  async getById(id: string): Promise<AuditLog | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async logAction(params: {
    action: AuditAction;
    resource_type: AuditResourceType;
    resource_id?: string;
    resource_name?: string;
    details?: Record<string, unknown>;
    old_value?: Record<string, unknown>;
    new_value?: Record<string, unknown>;
    severity?: AuditSeverity;
  }): Promise<AuditLog | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: admin } = await supabase
        .from('admin_users')
        .select('id, email, role')
        .eq('user_id', user.id)
        .single();

      if (!admin) return null;

      const { data: log, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          admin_id: admin.id,
          admin_email: admin.email,
          admin_role: admin.role,
          action: params.action,
          resource_type: params.resource_type,
          resource_id: params.resource_id,
          resource_name: params.resource_name,
          details: params.details || {},
          old_value: params.old_value,
          new_value: params.new_value,
          severity: params.severity || 'info',
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to log audit action:', error);
        return null;
      }

      return log;
    } catch (error) {
      console.error('Failed to log audit action:', error);
      return null;
    }
  }

  async getStats(): Promise<AuditLogStats> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('action, resource_type, severity, admin_email');

    if (error) throw error;

    const stats: AuditLogStats = {
      total: data.length,
      by_action: {} as Record<AuditAction, number>,
      by_resource: {} as Record<AuditResourceType, number>,
      by_severity: {} as Record<AuditSeverity, number>,
      by_admin: [],
    };

    const adminCounts: Record<string, number> = {};

    data.forEach((item: { 
      action: AuditAction; 
      resource_type: AuditResourceType; 
      severity: AuditSeverity;
      admin_email: string;
    }) => {
      // Count by action
      stats.by_action[item.action] = (stats.by_action[item.action] || 0) + 1;
      
      // Count by resource
      stats.by_resource[item.resource_type] = (stats.by_resource[item.resource_type] || 0) + 1;
      
      // Count by severity
      stats.by_severity[item.severity] = (stats.by_severity[item.severity] || 0) + 1;
      
      // Count by admin
      if (item.admin_email) {
        adminCounts[item.admin_email] = (adminCounts[item.admin_email] || 0) + 1;
      }
    });

    stats.by_admin = Object.entries(adminCounts)
      .map(([email, count]) => ({ admin_email: email, count }))
      .sort((a, b) => b.count - a.count);

    return stats;
  }

  async getRecentLogs(limit: number = 10): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getLogsByAdmin(adminId: string, limit: number = 50): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getLogsByResource(
    resourceType: AuditResourceType, 
    resourceId: string
  ): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async exportLogs(
    filters: AuditLogFilters = {}
  ): Promise<AuditLog[]> {
    let query = supabase
      .from(this.TABLE_NAME)
      .select('*');

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }
}

export const auditLogService = new AuditLogService();
