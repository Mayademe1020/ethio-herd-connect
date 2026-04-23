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
  Flag,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShoppingBag,
  User,
  PawPrint,
  MessageSquare,
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { 
  ReportedContent, 
  ReportStatus,
  ContentType,
  ReportReason,
  ContentModerationStats,
} from '@/types/admin';
import { announcementService } from '@/services/announcementService';
import { format } from 'date-fns';

const CONTENT_TYPE_CONFIG: Record<ContentType, { label: string; color: string; icon: React.ReactNode }> = {
  listing: { label: 'Listing', color: 'text-blue-600', icon: <ShoppingBag className="h-4 w-4" /> },
  user: { label: 'User', color: 'text-purple-600', icon: <User className="h-4 w-4" /> },
  animal: { label: 'Animal', color: 'text-green-600', icon: <PawPrint className="h-4 w-4" /> },
  message: { label: 'Message', color: 'text-orange-600', icon: <MessageSquare className="h-4 w-4" /> },
  review: { label: 'Review', color: 'text-yellow-600', icon: <Star className="h-4 w-4" /> },
};

const REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam',
  inappropriate: 'Inappropriate Content',
  fraud: 'Fraud',
  scam: 'Scam',
  duplicate: 'Duplicate',
  misleading: 'Misleading',
  other: 'Other',
};

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  reviewed: { label: 'Reviewed', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  action_taken: { label: 'Action Taken', color: 'text-red-600', bgColor: 'bg-red-100' },
  dismissed: { label: 'Dismissed', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

interface ContentModerationProps {
  className?: string;
}

export const ContentModeration: React.FC<ContentModerationProps> = ({ className }) => {
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [stats, setStats] = useState<ContentModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<{ status?: ReportStatus[]; content_type?: ContentType[] }>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [selectedReport, setSelectedReport] = useState<ReportedContent | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showDismissDialog, setShowDismissDialog] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const result = await announcementService.getReports(
        filters,
        pagination.page,
        pagination.pageSize
      );
      setReports(result.data);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  const loadStats = async () => {
    try {
      const data = await announcementService.getModerationStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadReports();
    loadStats();
  }, [filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadReports();
    loadStats();
  };

  const handleFilterChange = (key: 'status' | 'content_type', value: string) => {
    const newFilters = { ...filters };
    if (value === 'all') {
      delete newFilters[key];
    } else {
      newFilters[key] = [value as ReportStatus | ContentType];
    }
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTakeAction = async () => {
    if (!selectedReport || !actionNotes) return;

    setActionLoading(true);
    try {
      await announcementService.takeActionOnReport(selectedReport.id, actionNotes);
      setShowActionDialog(false);
      setActionNotes('');
      setSelectedReport(null);
      loadReports();
      loadStats();
    } catch (error) {
      console.error('Error taking action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!selectedReport) return;

    setActionLoading(true);
    try {
      await announcementService.dismissReport(selectedReport.id, actionNotes);
      setShowDismissDialog(false);
      setActionNotes('');
      setSelectedReport(null);
      loadReports();
      loadStats();
    } catch (error) {
      console.error('Error dismissing report:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getContentTypeBadge = (type: ContentType) => {
    const config = CONTENT_TYPE_CONFIG[type];
    return (
      <Badge variant="outline" className={`${config.color} border-current`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: ReportStatus) => {
    const config = STATUS_CONFIG[status];
    return (
      <Badge className={`${config.bgColor} ${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const filteredReports = reports;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Card className="bg-yellow-50">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
              <div className="text-xs text-muted-foreground">Reviewed</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-red-600">{stats.action_taken}</div>
              <div className="text-xs text-muted-foreground">Action Taken</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-50">
            <CardContent className="p-3">
              <div className="text-2xl font-bold">{stats.dismissed}</div>
              <div className="text-xs text-muted-foreground">Dismissed</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex gap-2 flex-wrap">
              <Select 
                value={filters.status?.[0] || 'all'} 
                onValueChange={(v) => handleFilterChange('status', v)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="action_taken">Action Taken</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.content_type?.[0] || 'all'} 
                onValueChange={(v) => handleFilterChange('content_type', v)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="listing">Listing</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="animal">Animal</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Reported Content</CardTitle>
          <CardDescription>
            {pagination.total} total reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <Flag className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-2 text-muted-foreground">No reports found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getContentTypeBadge(report.content_type)}
                        <Badge variant="outline">{REASON_LABELS[report.reason]}</Badge>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="font-medium">
                        Content ID: {report.content_id}
                      </div>
                      {report.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {report.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Reported: {format(new Date(report.created_at), 'MMM d, yyyy h:mm a')}</span>
                        {report.reporter && (
                          <span>By: {report.reporter.full_name || report.reporter.email}</span>
                        )}
                      </div>
                      {report.resolution_notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Resolution: </span>
                          {report.resolution_notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {report.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReport(report);
                              setShowDismissDialog(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Dismiss
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReport(report);
                              setShowActionDialog(true);
                            }}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Take Action
                          </Button>
                        </>
                      )}
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

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Action</DialogTitle>
            <DialogDescription>
              Describe the action taken against this content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Content ID: {selectedReport?.content_id}</AlertTitle>
              <AlertDescription>
                Type: {selectedReport?.content_type} | Reason: {selectedReport?.reason}
              </AlertDescription>
            </Alert>
            <div>
              <label className="text-sm font-medium">Action Notes</label>
              <Textarea
                placeholder="Describe the action taken (e.g., removed listing, banned user, etc.)..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleTakeAction} 
              disabled={!actionNotes || actionLoading}
              variant="destructive"
            >
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dismiss Dialog */}
      <Dialog open={showDismissDialog} onOpenChange={setShowDismissDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dismiss Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to dismiss this report?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for dismissal (optional)</label>
              <Textarea
                placeholder="Why is this report being dismissed?"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDismissDialog(false)}>Cancel</Button>
            <Button onClick={handleDismiss} disabled={actionLoading}>
              Dismiss Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentModeration;
