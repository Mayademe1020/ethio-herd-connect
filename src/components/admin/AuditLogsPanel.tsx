import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  RefreshCw,
  Shield,
  Eye,
  Plus,
  Edit,
  Trash2,
  Ban,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  Settings,
  Globe,
  Server,
  Database,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  FileText,
} from 'lucide-react';
import { 
  AuditLog, 
  AuditAction,
  AuditResourceType,
  AuditSeverity,
  AuditLogFilters,
  AuditLogStats,
} from '@/types/admin';
import { auditLogService } from '@/services/auditLogService';
import { format } from 'date-fns';

const ACTION_CONFIG: Record<AuditAction, { label: string; color: string; icon: React.ReactNode }> = {
  login: { label: 'Login', color: 'text-green-600', icon: <User className="h-4 w-4" /> },
  logout: { label: 'Logout', color: 'text-gray-600', icon: <User className="h-4 w-4" /> },
  view: { label: 'View', color: 'text-blue-600', icon: <Eye className="h-4 w-4" /> },
  create: { label: 'Create', color: 'text-green-600', icon: <Plus className="h-4 w-4" /> },
  update: { label: 'Update', color: 'text-yellow-600', icon: <Edit className="h-4 w-4" /> },
  delete: { label: 'Delete', color: 'text-red-600', icon: <Trash2 className="h-4 w-4" /> },
  ban: { label: 'Ban', color: 'text-red-600', icon: <Ban className="h-4 w-4" /> },
  unban: { label: 'Unban', color: 'text-green-600', icon: <Unlock className="h-4 w-4" /> },
  suspend: { label: 'Suspend', color: 'text-orange-600', icon: <AlertTriangle className="h-4 w-4" /> },
  activate: { label: 'Activate', color: 'text-green-600', icon: <CheckCircle className="h-4 w-4" /> },
  approve: { label: 'Approve', color: 'text-green-600', icon: <CheckCircle className="h-4 w-4" /> },
  reject: { label: 'Reject', color: 'text-red-600', icon: <XCircle className="h-4 w-4" /> },
  escalate: { label: 'Escalate', color: 'text-orange-600', icon: <AlertTriangle className="h-4 w-4" /> },
  resolve: { label: 'Resolve', color: 'text-green-600', icon: <CheckCircle className="h-4 w-4" /> },
  export: { label: 'Export', color: 'text-blue-600', icon: <Download className="h-4 w-4" /> },
  import: { label: 'Import', color: 'text-purple-600', icon: <Upload className="h-4 w-4" /> },
  configure: { label: 'Configure', color: 'text-gray-600', icon: <Settings className="h-4 w-4" /> },
  deploy: { label: 'Deploy', color: 'text-purple-600', icon: <Globe className="h-4 w-4" /> },
  manual: { label: 'Manual', color: 'text-gray-600', icon: <FileText className="h-4 w-4" /> },
};

const RESOURCE_CONFIG: Record<AuditResourceType, { label: string; color: string; icon: React.ReactNode }> = {
  user: { label: 'User', color: 'text-blue-600', icon: <User className="h-4 w-4" /> },
  ticket: { label: 'Ticket', color: 'text-yellow-600', icon: <FileText className="h-4 w-4" /> },
  announcement: { label: 'Announcement', color: 'text-purple-600', icon: <Globe className="h-4 w-4" /> },
  report: { label: 'Report', color: 'text-red-600', icon: <AlertTriangle className="h-4 w-4" /> },
  animal: { label: 'Animal', color: 'text-green-600', icon: <Shield className="h-4 w-4" /> },
  listing: { label: 'Listing', color: 'text-orange-600', icon: <Database className="h-4 w-4" /> },
  milk_record: { label: 'Milk Record', color: 'text-blue-600', icon: <FileText className="h-4 w-4" /> },
  health_record: { label: 'Health Record', color: 'text-red-600', icon: <Shield className="h-4 w-4" /> },
  breeding_record: { label: 'Breeding Record', color: 'text-pink-600', icon: <Shield className="h-4 w-4" /> },
  system: { label: 'System', color: 'text-gray-600', icon: <Server className="h-4 w-4" /> },
  database: { label: 'Database', color: 'text-purple-600', icon: <Database className="h-4 w-4" /> },
  configuration: { label: 'Configuration', color: 'text-yellow-600', icon: <Settings className="h-4 w-4" /> },
};

const SEVERITY_CONFIG: Record<AuditSeverity, { label: string; color: string; bgColor: string }> = {
  debug: { label: 'Debug', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  info: { label: 'Info', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  warning: { label: 'Warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  critical: { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100' },
};

interface AuditLogsPanelProps {
  className?: string;
}

export const AuditLogsPanel: React.FC<AuditLogsPanelProps> = ({ className }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 50, total: 0 });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const result = await auditLogService.getLogs(
        { ...filters, search: searchQuery || undefined },
        pagination.page,
        pagination.pageSize
      );
      setLogs(result.data);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, pagination.page, pagination.pageSize, searchQuery]);

  const loadStats = async () => {
    try {
      const data = await auditLogService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLogs();
    loadStats();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadLogs();
  };

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all') {
      delete newFilters[key];
    } else if (key === 'action') {
      newFilters.action = [value as AuditAction];
    } else if (key === 'resource_type') {
      newFilters.resource_type = [value as AuditResourceType];
    } else if (key === 'severity') {
      newFilters.severity = [value as AuditSeverity];
    }
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getActionBadge = (action: AuditAction) => {
    const config = ACTION_CONFIG[action];
    return (
      <Badge variant="outline" className={`${config.color} border-current`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getResourceBadge = (resourceType: AuditResourceType) => {
    const config = RESOURCE_CONFIG[resourceType];
    return (
      <Badge variant="outline" className={`${config.color} border-current`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getSeverityBadge = (severity: AuditSeverity) => {
    const config = SEVERITY_CONFIG[severity];
    return (
      <Badge className={`${config.bgColor} ${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Card className="bg-blue-50">
                <CardContent className="p-3">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total Logs</div>
                </CardContent>
              </Card>
              <Card className="bg-yellow-50">
                <CardContent className="p-3">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.by_severity.warning || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Warnings</div>
                </CardContent>
              </Card>
              <Card className="bg-red-50">
                <CardContent className="p-3">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.by_severity.critical || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Critical</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50">
                <CardContent className="p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.by_admin.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Admins Active</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by admin, resource..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button type="submit" variant="secondary">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </form>

                <div className="flex gap-2 flex-wrap">
                  <Select 
                    value={filters.action?.[0] || 'all'} 
                    onValueChange={(v) => handleFilterChange('action', v)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="ban">Ban</SelectItem>
                      <SelectItem value="unban">Unban</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.resource_type?.[0] || 'all'} 
                    onValueChange={(v) => handleFilterChange('resource_type', v)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Resource" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="ticket">Ticket</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.severity?.[0] || 'all'} 
                    onValueChange={(v) => handleFilterChange('severity', v)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs List */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                {pagination.total} total records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">No audit logs found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getActionBadge(log.action)}
                            {getResourceBadge(log.resource_type)}
                            {getSeverityBadge(log.severity)}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{log.admin_email || 'Unknown Admin'}</span>
                            <span className="text-muted-foreground"> performed </span>
                            <span className="font-medium">{ACTION_CONFIG[log.action].label}</span>
                            <span className="text-muted-foreground"> on </span>
                            <span className="font-medium">{RESOURCE_CONFIG[log.resource_type].label}</span>
                            {log.resource_name && (
                              <>
                                <span className="text-muted-foreground"> (</span>
                                <span>{log.resource_name}</span>
                                <span className="text-muted-foreground">)</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(log.created_at)}
                            </span>
                            <span>{format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}</span>
                            {log.ip_address && <span>IP: {log.ip_address}</span>}
                          </div>
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
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Actions by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.by_action).slice(0, 10).map(([action, count]) => (
                        <div key={action} className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            {ACTION_CONFIG[action as AuditAction]?.icon}
                            <span>{ACTION_CONFIG[action as AuditAction]?.label || action}</span>
                          </span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Admins</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.by_admin.slice(0, 10).map((admin) => (
                        <div key={admin.admin_email} className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{admin.admin_email}</span>
                          </span>
                          <Badge variant="outline">{admin.count} actions</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedLog && (
            <>
              <DialogHeader>
                <DialogTitle>Audit Log Details</DialogTitle>
                <DialogDescription>
                  {selectedLog.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Admin</label>
                    <p className="font-medium">{selectedLog.admin_email}</p>
                    <p className="text-sm text-muted-foreground">{selectedLog.admin_role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                    <p className="font-medium">
                      {format(new Date(selectedLog.created_at), 'MMM d, yyyy h:mm:ss a')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeAgo(selectedLog.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {getActionBadge(selectedLog.action)}
                  {getResourceBadge(selectedLog.resource_type)}
                  {getSeverityBadge(selectedLog.severity)}
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Resource</label>
                  <p className="font-medium">{selectedLog.resource_name || 'N/A'}</p>
                  {selectedLog.resource_id && (
                    <p className="text-sm text-muted-foreground">ID: {selectedLog.resource_id}</p>
                  )}
                </div>

                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Details</label>
                    <pre className="mt-1 p-3 bg-gray-50 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.old_value && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Old Value</label>
                    <pre className="mt-1 p-3 bg-red-50 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.old_value, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_value && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">New Value</label>
                    <pre className="mt-1 p-3 bg-green-50 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.new_value, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedLog.ip_address && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                      <p>{selectedLog.ip_address}</p>
                    </div>
                  )}
                  {selectedLog.user_agent && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                      <p className="truncate">{selectedLog.user_agent}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogsPanel;
