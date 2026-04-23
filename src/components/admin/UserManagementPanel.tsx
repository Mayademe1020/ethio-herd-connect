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
  Search,
  RefreshCw,
  User,
  Users,
  Ban,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  PawPrint,
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
} from 'lucide-react';
import { 
  ManagedUser, 
  UserFilters, 
  UserStats,
  UserAnimals,
  UserListings,
  UserTransactions,
} from '@/types/admin';
import { userManagementService } from '@/services/userManagementService';
import { format } from 'date-fns';

const REGIONS = [
  'Oromia',
  'Amhara',
  'SNNPR',
  'Tigray',
  'Afar',
  'Somali',
  'Benishangul',
  'Gambella',
  'Harari',
  'Addis Ababa',
  'Dire Dawa',
];

interface UserManagementPanelProps {
  className?: string;
}

export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ className }) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [userAnimals, setUserAnimals] = useState<UserAnimals[]>([]);
  const [userListings, setUserListings] = useState<UserListings[]>([]);
  const [userTransactions, setUserTransactions] = useState<UserTransactions[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    suspended: 0,
    banned: 0,
    new_today: 0,
    new_this_week: 0,
    new_this_month: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState(24);
  const [banActionLoading, setBanActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await userManagementService.getUsers(
        { ...filters, search: searchQuery || undefined },
        pagination.page,
        pagination.pageSize
      );
      setUsers(result.data);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, pagination.page, pagination.pageSize, searchQuery]);

  const loadStats = async () => {
    try {
      const data = await userManagementService.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUserDetails = async (user: ManagedUser) => {
    try {
      const [animals, listings, transactions] = await Promise.all([
        userManagementService.getUserAnimals(user.id),
        userManagementService.getUserListings(user.id),
        userManagementService.getUserTransactions(user.id),
      ]);
      setUserAnimals(animals);
      setUserListings(listings);
      setUserTransactions(transactions);
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadUsers();
    loadStats();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadUsers();
    }
  }, [filters, pagination.page]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
    loadStats();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadUsers();
  };

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all') {
      delete newFilters[key];
    } else {
      (newFilters as Record<string, string>)[key] = value;
    }
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewUser = async (user: ManagedUser) => {
    setSelectedUser(user);
    await loadUserDetails(user);
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason) return;

    setBanActionLoading(true);
    try {
      await userManagementService.banUser(selectedUser.id, banReason, 'temporary', banDuration);
      setShowBanDialog(false);
      setBanReason('');
      loadUsers();
      loadStats();
      if (selectedUser) {
        const updated = await userManagementService.getUserById(selectedUser.id);
        setSelectedUser(updated);
      }
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      setBanActionLoading(false);
    }
  };

  const handleUnbanUser = async () => {
    if (!selectedUser) return;

    setBanActionLoading(true);
    try {
      await userManagementService.unbanUser(selectedUser.id);
      setShowUnbanDialog(false);
      loadUsers();
      loadStats();
      if (selectedUser) {
        const updated = await userManagementService.getUserById(selectedUser.id);
        setSelectedUser(updated);
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
    } finally {
      setBanActionLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <Card className="bg-blue-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-red-600">{stats.banned}</div>
            <div className="text-xs text-muted-foreground">Banned</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-purple-600">{stats.new_today}</div>
            <div className="text-xs text-muted-foreground">New Today</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-orange-600">{stats.new_this_week}</div>
            <div className="text-xs text-muted-foreground">New This Week</div>
          </CardContent>
        </Card>
        <Card className="bg-teal-50">
          <CardContent className="p-3">
            <div className="text-2xl font-bold text-teal-600">{stats.new_this_month}</div>
            <div className="text-xs text-muted-foreground">New This Month</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
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
                value={filters.status || 'all'} 
                onValueChange={(v) => handleFilterChange('status', v)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.region || 'all'} 
                onValueChange={(v) => handleFilterChange('region', v)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {pagination.total} total users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-2 text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleViewUser(user)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {user.is_banned ? (
                        <Badge className="bg-red-100 text-red-600 border-0">
                          <Ban className="h-3 w-3 mr-1" />
                          Banned
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-600 border-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                      {user.email_verified && (
                        <Badge variant="outline" className="text-xs">Email Verified</Badge>
                      )}
                    </div>
                    <div className="font-medium">{user.full_name || 'No Name'}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                      {user.phone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        </>
                      )}
                      {user.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {user.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <PawPrint className="h-4 w-4" />
                      {user.animal_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4" />
                      {user.listing_count || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(user.created_at), 'MMM d')}
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

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Details
                </DialogTitle>
                <DialogDescription>
                  Full information about {selectedUser.full_name || selectedUser.email}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="animals">Animals ({userAnimals.length})</TabsTrigger>
                  <TabsTrigger value="listings">Listings ({userListings.length})</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions ({userTransactions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="font-medium">{selectedUser.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="font-medium">{selectedUser.location || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Farm Name</label>
                      <p className="font-medium">{selectedUser.farm_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                      <p className="font-medium">{format(new Date(selectedUser.created_at), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                      <p className="font-medium">{selectedUser.last_login ? format(new Date(selectedUser.last_login), 'MMM d, yyyy h:mm a') : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        {selectedUser.is_banned ? (
                          <Badge className="bg-red-100 text-red-600">
                            <Ban className="h-3 w-3 mr-1" />
                            Banned
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedUser.is_banned && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>User is Banned</AlertTitle>
                      <AlertDescription>Reason: {selectedUser.ban_reason || 'No reason provided'}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    {selectedUser.is_banned ? (
                      <Button onClick={() => setShowUnbanDialog(true)}>
                        <Unlock className="h-4 w-4 mr-2" />
                        Unban User
                      </Button>
                    ) : (
                      <Button variant="destructive" onClick={() => setShowBanDialog(true)}>
                        <Ban className="h-4 w-4 mr-2" />
                        Ban User
                      </Button>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="animals">
                  {userAnimals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <PawPrint className="h-12 w-12 mx-auto opacity-50" />
                      <p>No animals found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userAnimals.map(animal => (
                        <div key={animal.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{animal.name} ({animal.animal_code})</div>
                            <div className="text-sm text-muted-foreground">
                              {animal.breed} • {animal.gender} • {animal.age} years
                            </div>
                          </div>
                          <Badge variant="outline">{animal.health_status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="listings">
                  {userListings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto opacity-50" />
                      <p>No listings found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userListings.map(listing => (
                        <div key={listing.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{listing.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {listing.type} • {format(new Date(listing.created_at), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">ETB {listing.price.toLocaleString()}</div>
                            <Badge variant="outline">{listing.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="transactions">
                  {userTransactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto opacity-50" />
                      <p>No transactions found</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userTransactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium">{tx.type}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(tx.created_at), 'MMM d, yyyy h:mm a')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">ETB {tx.amount.toLocaleString()}</div>
                            <Badge variant="outline">{tx.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Restrict access for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Duration</label>
              <Select value={banDuration.toString()} onValueChange={(v) => setBanDuration(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="6">6 Hours</SelectItem>
                  <SelectItem value="24">24 Hours</SelectItem>
                  <SelectItem value="72">3 Days</SelectItem>
                  <SelectItem value="168">7 Days</SelectItem>
                  <SelectItem value="720">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Reason for ban..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBanUser} disabled={!banReason || banActionLoading}>
              <Ban className="h-4 w-4 mr-2" />
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban Dialog */}
      <Dialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban User</DialogTitle>
            <DialogDescription>
              Restore access for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Confirm Action</AlertTitle>
            <AlertDescription>
              This will immediately restore the user's access to the platform.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnbanDialog(false)}>Cancel</Button>
            <Button onClick={handleUnbanUser} disabled={banActionLoading}>
              <Unlock className="h-4 w-4 mr-2" />
              Unban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementPanel;
