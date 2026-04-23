import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/text-area';
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
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert';
import {
  Search,
  RefreshCw,
  UserX,
  Unlock,
  Clock,
  AlertTriangle,
  Ban,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import { UserBanWithDetails, BanType } from '@/types/admin';
import { supportTicketService } from '@/services/supportTicketService';
import { format } from 'date-fns';

const BAN_TYPE_CONFIG: Record<BanType, { label: string; color: string; icon: React.ReactNode }> = {
  warning: { label: 'Warning', color: 'text-yellow-600', icon: <AlertTriangle className="h-4 w-4" /> },
  temporary: { label: 'Temporary', color: 'text-orange-600', icon: <Clock className="h-4 w-4" /> },
  permanent: { label: 'Permanent', color: 'text-red-600', icon: <Ban className="h-4 w-4" /> },
};

const BAN_DURATIONS = [
  { value: 1, label: '1 Hour' },
  { value: 6, label: '6 Hours' },
  { value: 24, label: '24 Hours' },
  { value: 72, label: '3 Days' },
  { value: 168, label: '7 Days' },
  { value: 336, label: '14 Days' },
  { value: 720, label: '30 Days' },
];

interface UserBanManagerProps {
  className?: string;
}

export const UserBanManager: React.FC<UserBanManagerProps> = ({ className }) => {
  const [activeBans, setActiveBans] = useState<UserBanWithDetails[]>([]);
  const [allBans, setAllBans] = useState<UserBanWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');

  // Dialog states
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [selectedUserBan, setSelectedUserBan] = useState<UserBanWithDetails | null>(null);
  
  // Form state
  const [banForm, setBanForm] = useState({
    user_id: '',
    ban_type: 'temporary' as BanType,
    duration: 24,
    reason: '',
  });

  const loadBans = useCallback(async () => {
    try {
      setLoading(true);
      let result;
      if (activeTab === 'active') {
        result = await supportTicketService.getActiveBans(pagination.page, pagination.pageSize);
        setActiveBans(result.data);
      } else {
        result = await supportTicketService.getAllBans(pagination.page, pagination.pageSize);
        setAllBans(result.data);
      }
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Error loading bans:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, pagination.page, pagination.pageSize]);

  useEffect(() => {
    loadBans();
  }, [activeTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBans();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadBans();
  };

  const handleCreateBan = async () => {
    if (!banForm.user_id || !banForm.reason) return;

    try {
      await supportTicketService.banUser(
        banForm.user_id,
        banForm.ban_type,
        banForm.reason,
        {},
        banForm.ban_type === 'temporary' ? banForm.duration : undefined
      );
      setShowBanDialog(false);
      setBanForm({
        user_id: '',
        ban_type: 'temporary',
        duration: 24,
        reason: '',
      });
      loadBans();
    } catch (error) {
      console.error('Error creating ban:', error);
    }
  };

  const handleUnban = async () => {
    if (!selectedUserBan) return;

    try {
      await supportTicketService.unbanUser(selectedUserBan.user_id);
      setShowUnbanDialog(false);
      setSelectedUserBan(null);
      loadBans();
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const openUnbanDialog = (ban: UserBanWithDetails) => {
    setSelectedUserBan(ban);
    setShowUnbanDialog(true);
  };

  const getBanTypeBadge = (banType: BanType) => {
    const config = BAN_TYPE_CONFIG[banType];
    return (
      <Badge variant="outline" className={`${config.color} border-current`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const formatTimeRemaining = (endTime: string | null, isActive: boolean) => {
    if (!isActive) return 'Inactive';
    if (!endTime) return 'Permanent';

    const endDate = new Date(endTime);
    const now = new Date();
    
    if (endDate <= now) return 'Expired';

    const diffMs = endDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h remaining`;
    return `${diffHours}h remaining`;
  };

  const currentBans = activeTab === 'active' ? activeBans : allBans;

  const filteredBans = searchQuery
    ? currentBans.filter(ban => 
        ban.banned_user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ban.banned_user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ban.reason.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentBans;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{activeBans.length}</div>
                <div className="text-xs text-muted-foreground">Active Bans</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {activeBans.filter(b => b.ban_type === 'temporary').length}
                </div>
                <div className="text-xs text-muted-foreground">Temporary</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {activeBans.filter(b => b.ban_type === 'warning').length}
                </div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-gray-600" />
              <div>
                <div className="text-2xl font-bold">{allBans.length}</div>
                <div className="text-xs text-muted-foreground">Total Bans</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user email or name..."
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

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
                <Button onClick={() => setShowBanDialog(true)}>
                  <Ban className="h-4 w-4 mr-2" />
                  Ban User
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ban User</DialogTitle>
                    <DialogDescription>
                      Restrict a user's access to the platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">User ID</label>
                      <Input
                        placeholder="Enter user UUID"
                        value={banForm.user_id}
                        onChange={(e) => setBanForm({ ...banForm, user_id: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ban Type</label>
                      <Select
                        value={banForm.ban_type}
                        onValueChange={(v) => setBanForm({ ...banForm, ban_type: v as BanType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="warning">Warning (No restriction)</SelectItem>
                          <SelectItem value="temporary">Temporary Ban</SelectItem>
                          <SelectItem value="permanent">Permanent Ban</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {banForm.ban_type === 'temporary' && (
                      <div>
                        <label className="text-sm font-medium">Duration</label>
                        <Select
                          value={banForm.duration.toString()}
                          onValueChange={(v) => setBanForm({ ...banForm, duration: parseInt(v) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BAN_DURATIONS.map(d => (
                              <SelectItem key={d.value} value={d.value.toString()}>
                                {d.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium">Reason</label>
                      <Textarea
                        placeholder="Reason for ban..."
                        value={banForm.reason}
                        onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBanDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleCreateBan}
                      disabled={!banForm.user_id || !banForm.reason}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('active')}
        >
          Active Bans ({activeBans.length})
        </Button>
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('all')}
        >
          All Bans
        </Button>
      </div>

      {/* Bans List */}
      <Card>
        <CardHeader>
          <CardTitle>{activeTab === 'active' ? 'Active Bans' : 'All Bans'}</CardTitle>
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
          ) : filteredBans.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-2 text-muted-foreground">No bans found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBans.map((ban) => (
                <div
                  key={ban.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getBanTypeBadge(ban.ban_type)}
                      {ban.is_active ? (
                        <Badge className="bg-green-100 text-green-600 border-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="font-medium">
                      {ban.banned_user?.full_name || ban.banned_user?.email || 'Unknown User'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>Reason: {ban.reason}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {ban.ban_type === 'permanent' 
                          ? 'Permanent' 
                          : ban.end_time 
                            ? formatTimeRemaining(ban.end_time, ban.is_active)
                            : 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Banned by {ban.banning_admin?.full_name || 'Admin'} on{' '}
                      {format(new Date(ban.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ban.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUnbanDialog(ban)}
                      >
                        <Unlock className="h-4 w-4 mr-2" />
                        Unban
                      </Button>
                    )}
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

      {/* Unban Confirmation Dialog */}
      <Dialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the ban for this user? They will regain access to the platform.
            </DialogDescription>
          </DialogHeader>
          {selectedUserBan && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>User Information</AlertTitle>
              <AlertDescription>
                <div>Name: {selectedUserBan.banned_user?.full_name || 'Unknown'}</div>
                <div>Email: {selectedUserBan.banned_user?.email || 'N/A'}</div>
                <div>Reason: {selectedUserBan.reason}</div>
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnbanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnban}>
              <Unlock className="h-4 w-4 mr-2" />
              Unban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserBanManager;
