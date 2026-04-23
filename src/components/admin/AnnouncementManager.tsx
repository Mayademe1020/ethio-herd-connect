import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import {
  Megaphone,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  AlertTriangle,
  Info,
  Wrench,
  Star,
  ChevronLeft,
  ChevronRight,
  Flag,
} from 'lucide-react';
import { 
  Announcement, 
  CreateAnnouncementDTO,
  AnnouncementType,
  AnnouncementAudience,
  AnnouncementFilters,
} from '@/types/admin';
import { announcementService } from '@/services/announcementService';
import { format } from 'date-fns';

const ANNOUNCEMENT_TYPE_CONFIG: Record<AnnouncementType, { label: string; color: string; icon: React.ReactNode }> = {
  info: { label: 'Info', color: 'text-blue-600', icon: <Info className="h-4 w-4" /> },
  warning: { label: 'Warning', color: 'text-yellow-600', icon: <AlertTriangle className="h-4 w-4" /> },
  alert: { label: 'Alert', color: 'text-red-600', icon: <AlertTriangle className="h-4 w-4" /> },
  maintenance: { label: 'Maintenance', color: 'text-orange-600', icon: <Wrench className="h-4 w-4" /> },
  new_feature: { label: 'New Feature', color: 'text-green-600', icon: <Star className="h-4 w-4" /> },
};

const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  all: 'All Users',
  farmers: 'Farmers Only',
  buyers: 'Buyers Only',
  new_users: 'New Users',
};

interface AnnouncementManagerProps {
  className?: string;
}

export const AnnouncementManager: React.FC<AnnouncementManagerProps> = ({ className }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<AnnouncementFilters>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<Partial<CreateAnnouncementDTO>>({
    type: 'info',
    target_audience: 'all',
    priority: 0,
    is_active: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const result = await announcementService.getAnnouncements(
        filters,
        pagination.page,
        pagination.pageSize
      );
      setAnnouncements(result.data);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  useEffect(() => {
    loadAnnouncements();
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnnouncements();
  };

  const handleFilterChange = (key: keyof AnnouncementFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all') {
      delete newFilters[key];
    } else if (key === 'is_active') {
      newFilters.is_active = value === 'true';
    } else if (key === 'type') {
      newFilters.type = [value as AnnouncementType];
    } else if (key === 'target_audience') {
      newFilters.target_audience = [value as AnnouncementAudience];
    }
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.content) return;

    setFormLoading(true);
    try {
      await announcementService.createAnnouncement(formData as CreateAnnouncementDTO);
      setShowCreateDialog(false);
      setFormData({
        type: 'info',
        target_audience: 'all',
        priority: 0,
        is_active: true,
      });
      loadAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedAnnouncement || !formData.title || !formData.content) return;

    setFormLoading(true);
    try {
      await announcementService.updateAnnouncement(selectedAnnouncement.id, formData);
      setShowEditDialog(false);
      setSelectedAnnouncement(null);
      loadAnnouncements();
    } catch (error) {
      console.error('Error updating announcement:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      await announcementService.toggleAnnouncementActive(announcement.id, !announcement.is_active);
      loadAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await announcementService.deleteAnnouncement(id);
      loadAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const openEditDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      title_am: announcement.title_am,
      content: announcement.content,
      content_am: announcement.content_am,
      type: announcement.type,
      target_audience: announcement.target_audience,
      priority: announcement.priority,
      is_active: announcement.is_active,
      starts_at: announcement.starts_at,
      expires_at: announcement.expires_at,
    });
    setShowEditDialog(true);
  };

  const getTypeBadge = (type: AnnouncementType) => {
    const config = ANNOUNCEMENT_TYPE_CONFIG[type];
    return (
      <Badge variant="outline" className={`${config.color} border-current`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const filteredAnnouncements = searchQuery
    ? announcements.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : announcements;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="bg-blue-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-blue-600">
              {announcements.filter(a => a.is_active).length}
            </div>
            <div className="text-xs text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold">
              {announcements.filter(a => !a.is_active).length}
            </div>
            <div className="text-xs text-muted-foreground">Inactive</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select 
                value={filters.type?.[0] || 'all'} 
                onValueChange={(v) => handleFilterChange('type', v)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="new_feature">New Feature</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.target_audience?.[0] || 'all'} 
                onValueChange={(v) => handleFilterChange('target_audience', v)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Audiences</SelectItem>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="farmers">Farmers</SelectItem>
                  <SelectItem value="buyers">Buyers</SelectItem>
                  <SelectItem value="new_users">New Users</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.is_active === undefined ? 'all' : filters.is_active ? 'true' : 'false'} 
                onValueChange={(v) => handleFilterChange('is_active', v)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>
            {pagination.total} total announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-2 text-muted-foreground">No announcements found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`p-4 border rounded-lg ${announcement.is_active ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeBadge(announcement.type)}
                        <Badge variant="outline">
                          {AUDIENCE_LABELS[announcement.target_audience]}
                        </Badge>
                        {!announcement.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold">{announcement.title}</h3>
                      {announcement.title_am && (
                        <p className="text-sm text-muted-foreground">{announcement.title_am}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created: {format(new Date(announcement.created_at), 'MMM d, yyyy')}
                        </span>
                        {announcement.starts_at && (
                          <span>Starts: {format(new Date(announcement.starts_at), 'MMM d')}</span>
                        )}
                        {announcement.expires_at && (
                          <span>Expires: {format(new Date(announcement.expires_at), 'MMM d')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(announcement)}
                      >
                        {announcement.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.pageSize && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page * pagination.pageSize >= pagination.total}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
            <DialogDescription>
              Create a new announcement to notify users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title (English)</label>
                <Input
                  placeholder="Announcement title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title (Amharic)</label>
                <Input
                  placeholder="ማስታወቂያ ርእስ"
                  value={formData.title_am || ''}
                  onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as AnnouncementType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="new_feature">New Feature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Target Audience</label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(v) => setFormData({ ...formData, target_audience: v as AnnouncementAudience })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="farmers">Farmers Only</SelectItem>
                    <SelectItem value="buyers">Buyers Only</SelectItem>
                    <SelectItem value="new_users">New Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Content (English)</label>
              <Textarea
                placeholder="Announcement content..."
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content (Amharic)</label>
              <Textarea
                placeholder="ማስታወቂያ ይዘት..."
                value={formData.content_am || ''}
                onChange={(e) => setFormData({ ...formData, content_am: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date (optional)</label>
                <Input
                  type="datetime-local"
                  value={formData.starts_at || ''}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date (optional)</label>
                <Input
                  type="datetime-local"
                  value={formData.expires_at || ''}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Input
                type="number"
                value={formData.priority || 0}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.title || !formData.content || formLoading}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title (English)</label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title (Amharic)</label>
                <Input
                  value={formData.title_am || ''}
                  onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Content (English)</label>
              <Textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content (Amharic)</label>
              <Textarea
                value={formData.content_am || ''}
                onChange={(e) => setFormData({ ...formData, content_am: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <label htmlFor="is_active" className="text-sm font-medium">Active</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={!formData.title || !formData.content || formLoading}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementManager;
