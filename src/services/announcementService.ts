import { supabase } from '@/integrations/supabase/client';
import {
  Announcement,
  CreateAnnouncementDTO,
  AnnouncementFilters,
  ReportedContent,
  ReportStatus,
  ContentModerationStats,
  ContentType,
  ReportReason,
} from '@/types/admin';

class AnnouncementService {
  private readonly TABLE_NAME = 'announcements';
  private readonly REPORTS_TABLE = 'reported_content';

  async getAnnouncements(
    filters: AnnouncementFilters = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: Announcement[]; total: number }> {
    let query = supabase
      .from(this.TABLE_NAME)
      .select('*', { count: 'exact' });

    if (filters.type && filters.type.length > 0) {
      query = query.in('type', filters.type);
    }

    if (filters.target_audience && filters.target_audience.length > 0) {
      query = query.in('target_audience', filters.target_audience);
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
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
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
    };
  }

  async getAnnouncementById(id: string): Promise<Announcement | null> {
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

  async createAnnouncement(data: CreateAnnouncementDTO): Promise<Announcement> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: announcement, error } = await supabase
      .from(this.TABLE_NAME)
      .insert({
        ...data,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return announcement;
  }

  async updateAnnouncement(id: string, data: Partial<CreateAnnouncementDTO>): Promise<Announcement> {
    const { data: announcement, error } = await supabase
      .from(this.TABLE_NAME)
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return announcement;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async toggleAnnouncementActive(id: string, isActive: boolean): Promise<Announcement> {
    return this.updateAnnouncement(id, { is_active: isActive });
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', new Date().toISOString())
      .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Content Moderation Methods
  async getReports(
    filters: { status?: ReportStatus[]; content_type?: ContentType[] } = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: ReportedContent[]; total: number }> {
    let query = supabase
      .from(this.REPORTS_TABLE)
      .select(`
        *,
        reporter:reporter_id(id, email, raw_user_meta_data),
        content_owner:content_owner_id(id, email, raw_user_meta_data)
      `, { count: 'exact' });

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.content_type && filters.content_type.length > 0) {
      query = query.in('content_type', filters.content_type);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    const formattedData = (data || []).map((item: Record<string, unknown>) => ({
      ...item,
      reporter: item.reporter as ReportedContent['reporter'],
      content_owner: item.content_owner as ReportedContent['content_owner'],
    }));

    return {
      data: formattedData,
      total: count || 0,
    };
  }

  async getReportById(id: string): Promise<ReportedContent | null> {
    const { data, error } = await supabase
      .from(this.REPORTS_TABLE)
      .select(`
        *,
        reporter:reporter_id(id, email, raw_user_meta_data),
        content_owner:content_owner_id(id, email, raw_user_meta_data)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      reporter: data.reporter as ReportedContent['reporter'],
      content_owner: data.content_owner as ReportedContent['content_owner'],
    };
  }

  async createReport(data: {
    content_type: ContentType;
    content_id: string;
    content_owner_id?: string;
    reason: ReportReason;
    description?: string;
  }): Promise<ReportedContent> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: report, error } = await supabase
      .from(this.REPORTS_TABLE)
      .insert({
        ...data,
        reporter_id: user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return report;
  }

  async updateReportStatus(
    id: string,
    status: ReportStatus,
    resolutionNotes?: string
  ): Promise<ReportedContent> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: report, error } = await supabase
      .from(this.REPORTS_TABLE)
      .update({
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        resolution_notes: resolutionNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return report;
  }

  async getModerationStats(): Promise<ContentModerationStats> {
    const { data, error } = await supabase
      .from(this.REPORTS_TABLE)
      .select('status, content_type, reason');

    if (error) throw error;

    const stats: ContentModerationStats = {
      total: data.length,
      pending: 0,
      reviewed: 0,
      action_taken: 0,
      dismissed: 0,
      by_type: {
        listing: 0,
        user: 0,
        animal: 0,
        message: 0,
        review: 0,
      },
      by_reason: {
        spam: 0,
        inappropriate: 0,
        fraud: 0,
        scam: 0,
        duplicate: 0,
        misleading: 0,
        other: 0,
      },
    };

    data.forEach((item: { status: ReportStatus; content_type: ContentType; reason: ReportReason }) => {
      if (item.status in stats) {
        stats[item.status as keyof typeof stats]++;
      }
      if (item.content_type in stats.by_type) {
        stats.by_type[item.content_type]++;
      }
      if (item.reason in stats.by_reason) {
        stats.by_reason[item.reason]++;
      }
    });

    return stats;
  }

  async dismissReport(id: string, reason?: string): Promise<ReportedContent> {
    return this.updateReportStatus(id, 'dismissed', reason);
  }

  async takeActionOnReport(id: string, action: string): Promise<ReportedContent> {
    return this.updateReportStatus(id, 'action_taken', action);
  }
}

export const announcementService = new AnnouncementService();
