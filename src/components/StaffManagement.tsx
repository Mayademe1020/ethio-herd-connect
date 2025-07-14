import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus, Mail, Phone, Shield, Search, Filter, X, Loader2 } from 'lucide-react';
import { Language } from '@/types';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { supabase } from '@/integrations/supabase/client';

interface StaffManagementProps {
  language: Language;
  onClose: () => void;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
}

export const StaffManagement = ({ language }: StaffManagementProps) => {
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const [staffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      role: 'manager',
      status: 'active',
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      role: 'worker',
      status: 'pending',
      joinDate: '2024-02-20'
    }
  ]);

  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'worker'
  });

  const { showSuccess, showError } = useToastNotifications();

  const translations = {
    am: {
      title: 'የሰራተኞች አስተዳደር',
      addStaff: 'ሰራተኛ አክል',
      search: 'ፈልግ',
      filterByRole: 'በሚና አጣራ',
      all: 'ሁሉም',
      manager: 'ሥራ አስኪያጅ',
      worker: 'ሰራተኛ',
      name: 'ስም',
      email: 'ኢሜይል',
      phone: 'ስልክ',
      role: 'ሚና',
      status: 'ሁኔታ',
      active: 'ንቁ',
      pending: 'በመጠባበቅ ላይ',
      inactive: 'ንቁ ያልሆነ',
      save: 'አስቀምጥ',
      cancel: 'ሰርዝ',
      noStaff: 'ምንም ሰራተኞች አልተገኙም'
    },
    en: {
      title: 'Staff Management',
      addStaff: 'Add Staff',
      search: 'Search',
      filterByRole: 'Filter by Role',
      all: 'All',
      manager: 'Manager',
      worker: 'Worker',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      role: 'Role',
      status: 'Status',
      active: 'Active',
      pending: 'Pending',
      inactive: 'Inactive',
      save: 'Save',
      cancel: 'Cancel',
      noStaff: 'No staff members found'
    },
    or: {
      title: 'Bulchiinsa Hojjettootaa',
      addStaff: 'Hojjettoo Dabaluu',
      search: 'Barbaadi',
      filterByRole: 'Gahee Waliin Cali',
      all: 'Hunda',
      manager: 'Hogganaa',
      worker: 'Hojjettoo',
      name: 'Maqaa',
      email: 'Imeelii',
      phone: 'Bilbila',
      role: 'Gahee',
      status: 'Haala',
      active: 'Ka\'a',
      pending: 'Eegaa',
      inactive: 'Hin Ka\'u',
      save: 'Olkaa\'i',
      cancel: 'Dhiisi',
      noStaff: 'Hojjettoonni hin argamne'
    },
    sw: {
      title: 'Usimamizi wa Wafanyakazi',
      addStaff: 'Ongeza Mfanyakazi',
      search: 'Tafuta',
      filterByRole: 'Chuja kwa Jukumu',
      all: 'Wote',
      manager: 'Meneja',
      worker: 'Mfanyakazi',
      name: 'Jina',
      email: 'Barua pepe',
      phone: 'Simu',
      role: 'Jukumu',
      status: 'Hali',
      active: 'Hai',
      pending: 'Inasubiri',
      inactive: 'Haikai',
      save: 'Hifadhi',
      cancel: 'Ghairi',
      noStaff: 'Hakuna wafanyakazi waliopatikana'
    }
  };

  const t = translations[language];

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Error', 'You must be logged in to add staff');
        return;
      }

      // Here you would implement the actual staff addition logic
      // For now, just show success message
      showSuccess('Success', `Staff member ${newStaff.name} added successfully`);
      
      setNewStaff({ name: '', email: '', phone: '', role: 'worker' });
      setShowAddStaff(false);
    } catch (error) {
      console.error('Error adding staff:', error);
      showError('Error', 'Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              {t.title}
            </CardTitle>
            <Button 
              onClick={() => setShowAddStaff(true)}
              className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.addStaff}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 md:space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-2 sm:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full sm:w-40 h-10 transition-all focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder={t.filterByRole} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="manager">{t.manager}</SelectItem>
                  <SelectItem value="worker">{t.worker}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredStaff.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t.noStaff}</p>
              </div>
            ) : (
              filteredStaff.map((staff) => (
                <Card key={staff.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                      <Avatar className="w-10 h-10 md:w-12 md:h-12">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm md:text-base">
                          {staff.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base truncate">{staff.name}</h3>
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Mail className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="truncate">{staff.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Phone className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{staff.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Shield className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="capitalize">{staff.role}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(staff.status)}`}
                          >
                            {t[staff.status as keyof typeof t] as string}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(staff.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
          <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base md:text-lg">{t.addStaff}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddStaff(false)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staffName" className="text-sm font-medium">{t.name}</Label>
                  <Input
                    id="staffName"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t.name}
                    className="h-10 transition-all focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffEmail" className="text-sm font-medium">{t.email}</Label>
                  <Input
                    id="staffEmail"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t.email}
                    className="h-10 transition-all focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffPhone" className="text-sm font-medium">{t.phone}</Label>
                  <Input
                    id="staffPhone"
                    type="tel"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={t.phone}
                    className="h-10 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staffRole" className="text-sm font-medium">{t.role}</Label>
                  <Select
                    value={newStaff.role}
                    onValueChange={(value) => setNewStaff(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className="h-10 transition-all focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder={t.role} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">{t.manager}</SelectItem>
                      <SelectItem value="worker">{t.worker}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {loading ? 'Saving...' : t.save}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddStaff(false)}
                    className="flex-1 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
