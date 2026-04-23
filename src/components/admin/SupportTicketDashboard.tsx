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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MoreVertical,
  Send,
  User,
  Tag,
  Flag,
  Eye,
  Lock,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare
} from 'lucide-react';
import { 
  SupportTicket, 
  SupportTicketWithDetails, 
  SupportCategory, 
  TicketStatus, 
  TicketPriority,
  TicketFilters,
  CreateTicketDTO,
  UserBanWithDetails
} from '@/types/admin';
import { supportTicketService } from '@/services/supportTicketService';
import { TicketDetailPanel } from './TicketDetailPanel';
import { UserBanManager } from './UserBanManager';

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bgColor: string }> = {
  open: { label: 'Open', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  in_progress: { label: 'In Progress', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  pending_user: { label: 'Pending User', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  resolved: { label: 'Resolved', color: 'text-green-600', bgColor: 'bg-green-100' },
  closed: { label: 'Closed', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  escalated: { label: 'Escalated', color: 'text-red-600', bgColor: 'bg-red-100' },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; icon: React.ReactNode }> = {
  critical: { label: 'Critical', color: 'text-red-600', icon: <AlertTriangle className="h-4 w-4" /> },
  high: { label: 'High', color: 'text-orange-600', icon: <Flag className="h-4 w-4" /> },
  medium: { label: 'Medium', color: 'text-yellow-600', icon: <Flag className="h-4 w-4" /> },
  low: { label: 'Low', color: 'text-green-600', icon: <Flag className="h-4 w-4" /> },
};

const CATEGORY_LABELS: Record<string, { en: string; am: string }> = {
  technical_issue: { en: 'Technical Issue', am: 'የስርዓት ችግር' },
  account_login: { en: 'Account & Login', am: 'መለያ እና መግቢያ' },
  animal_management: { en: 'Animal Management', am: 'እንስሳት አስተዳደር' },
  marketplace: { en: 'Marketplace', am: 'ገበያ' },
  milk_recording: { en: 'Milk Recording', am: 'የሚልክ መመዝገብ' },
  offline_sync: { en: 'Offline & Sync', am: 'ኦፍላይን እና ስንክሮክ' },
  data_export: { en: 'Data & Export', am: 'ውሂብ እና ማውጣት' },
  other: { en: 'Other', am: 'ሌላ' },
};

interface SupportTicketDashboardProps {
  className?: string;
}

export const SupportTicketDashboard: React.FC<SupportTicketDashboardProps> = ({ className }) => {
  const [tickets, setTickets] = useState<SupportTicketWithDetails[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketWithDetails | null>(null);
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TicketFilters>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [stats, setStats] = useState<Record<string, number>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateForUser, setShowCreateForUser] = useState(false);
  const [newTicket, setNewTicket] = useState<Partial<CreateTicketDTO>>({
    priority: 'medium',
    category: 'other',
  });

  const loadTickets = useCallback(async () => {
    try {
      const result = await supportTicketService.getTickets(
        { ...filters, search: searchQuery || undefined },
        pagination.page,
        pagination.pageSize
      );
      setTickets(result.data);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, pagination.page, pagination.pageSize, searchQuery]);

  const loadCategories = async () => {
    try {
      const data = await supportTicketService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await supportTicketService.getTicketStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadTickets();
    loadCategories();
    loadStats();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadTickets();
    }
  }, [filters, pagination.page]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTickets();
    loadStats();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadTickets();
  };

  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all') {
      delete newFilters[key];
    } else if (key === 'status' || key === 'priority' || key === 'category') {
      newFilters[key] = [value as TicketStatus | TicketPriority];
    }
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    try {
      await supportTicketService.updateStatus(ticketId, status);
      loadTickets();
      loadStats();
      if (selectedTicket?.id === ticketId) {
        const updated = await supportTicketService.getTicketById(ticketId);
        setSelectedTicket(updated);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.user_id || !newTicket.subject || !newTicket.description || !newTicket.category) {
      return;
    }

    try {
      await supportTicketService.createTicket(newTicket as CreateTicketDTO);
      setShowCreateDialog(false);
      setShowCreateForUser(false);
      setNewTicket({ priority: 'medium', category: 'other' });
      loadTickets();
      loadStats();
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const config = PRIORITY_CONFIG[priority];
    return (
      <Badge variant="outline" className={`${config.color} border-current`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: TicketStatus) => {
    const config = STATUS_CONFIG[status];
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

  if (loading && tickets.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="bans">User Bans</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <Card className="bg-blue-50">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-blue-600">{stats.open || 0}</div>
                <div className="text-xs text-muted-foreground">Open</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-yellow-600">{stats.in_progress || 0}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-orange-600">{stats.pending_user || 0}</div>
                <div className="text-xs text-muted-foreground">Pending User</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-red-600">{stats.escalated || 0}</div>
                <div className="text-xs text-muted-foreground">Escalated</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50">
              <CardContent className="p-3">
                <div className="text-2xl font-bold text-green-600">{stats.resolved || 0}</div>
                <div className="text-xs text-muted-foreground">Resolved</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50">
              <CardContent className="p-3">
                <div className="text-2xl font-bold">{stats.total || 0}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by ticket number or subject..."
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
                    value={filters.status?.[0] || 'all'} 
                    onValueChange={(v) => handleFilterChange('status', v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending_user">Pending User</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.priority?.[0] || 'all'} 
                    onValueChange={(v) => handleFilterChange('priority', v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <Flag className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.category?.[0] || 'all'} 
                    onValueChange={(v) => handleFilterChange('category', v)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <Tag className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>

                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Ticket
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Create Support Ticket</DialogTitle>
                        <DialogDescription>
                          Create a new support ticket on behalf of a user
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">User ID</label>
                          <Input
                            placeholder="Enter user UUID"
                            value={newTicket.user_id || ''}
                            onChange={(e) => setNewTicket({ ...newTicket, user_id: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Subject</label>
                          <Input
                            placeholder="Ticket subject"
                            value={newTicket.subject || ''}
                            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            placeholder="Describe the issue..."
                            value={newTicket.description || ''}
                            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Category</label>
                            <Select
                              value={newTicket.category}
                              onValueChange={(v) => setNewTicket({ ...newTicket, category: v as CreateTicketDTO['category'] })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name_en}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Priority</label>
                            <Select
                              value={newTicket.priority}
                              onValueChange={(v) => setNewTicket({ ...newTicket, priority: v as TicketPriority })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateTicket}>
                          Create Ticket
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket List */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Support Tickets</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {pagination.total} total tickets
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">No tickets found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">
                            {ticket.ticket_number}
                          </span>
                          {getPriorityBadge(ticket.priority)}
                          {getStatusBadge(ticket.status)}
                        </div>
                        <div className="font-medium truncate">{ticket.subject}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>{CATEGORY_LABELS[ticket.category]?.en || ticket.category}</span>
                          <span>•</span>
                          <span>{ticket.user?.full_name || ticket.user?.email || 'Unknown User'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(ticket.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(ticket);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(ticket.id, 'in_progress');
                            }}>
                              <Clock className="h-4 w-4 mr-2" />
                              Mark In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(ticket.id, 'escalated');
                            }}>
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Escalate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(ticket.id, 'resolved');
                            }}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Resolved
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

          {/* Ticket Detail Panel */}
          {selectedTicket && (
            <TicketDetailPanel
              ticket={selectedTicket}
              open={!!selectedTicket}
              onClose={() => setSelectedTicket(null)}
              onStatusChange={handleStatusChange}
              onTicketUpdate={loadTickets}
            />
          )}
        </TabsContent>

        <TabsContent value="bans">
          <UserBanManager />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Critical</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.critical || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">High Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats.high || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.resolved || 0}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportTicketDashboard;
