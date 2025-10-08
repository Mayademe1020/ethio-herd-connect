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
import { useFarmAssistants } from '@/hooks/useFarmAssistants';

interface StaffManagementProps {
  language: Language;
  onClose: () => void;
}

export const StaffManagement = ({ language }: StaffManagementProps) => {
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { assistants, isLoading, addAssistant, updateStatus, deleteAssistant, isAdding } = useFarmAssistants();
  const { showSuccess, showError } = useToastNotifications();

  const [newStaff, setNewStaff] = useState({
    email: '',
    permissions: {
      view_records: true,
      update_health: true,
      register_animals: true
    }
  });

  const translations = {
    am: {
      title: 'የእርሻ ረዳቶች',
      addStaff: 'ረዳት ጋብዝ',
      search: 'ፈልግ',
      filterByStatus: 'በሁኔታ አጣራ',
      all: 'ሁሉም',
      email: 'ኢሜይል',
      status: 'ሁኔታ',
      active: 'ንቁ',
      pending: 'በመጠባበቅ ላይ',
      inactive: 'ንቁ ያልሆነ',
      permissions: 'ፈቃዶች',
      viewRecords: 'መዝገቦችን አይ',
      updateHealth: 'ጤናን አዘምን',
      registerAnimals: 'እንስሳትን መዝግብ',
      save: 'አስቀምጥ',
      cancel: 'ሰርዝ',
      remove: 'አስወግድ',
      approve: 'ፍቀድ',
      noStaff: 'ምንም ረዳቶች አልተገኙም',
      inviteAssistant: 'ረዳት ጋብዝ',
      assistantEmail: 'የረዳት ኢሜይል'
    },
    en: {
      title: 'Farm Assistants',
      addStaff: 'Invite Assistant',
      search: 'Search',
      filterByStatus: 'Filter by Status',
      all: 'All',
      email: 'Email',
      status: 'Status',
      active: 'Active',
      pending: 'Pending',
      inactive: 'Inactive',
      permissions: 'Permissions',
      viewRecords: 'View Records',
      updateHealth: 'Update Health',
      registerAnimals: 'Register Animals',
      save: 'Save',
      cancel: 'Cancel',
      remove: 'Remove',
      approve: 'Approve',
      noStaff: 'No assistants found',
      inviteAssistant: 'Invite Assistant',
      assistantEmail: 'Assistant Email'
    },
    or: {
      title: 'Gargaartoota Qonnaa',
      addStaff: 'Gargaartoo Affeeruu',
      search: 'Barbaadi',
      filterByStatus: 'Haala Waliin Cali',
      all: 'Hunda',
      email: 'Imeelii',
      status: 'Haala',
      active: 'Ka\'a',
      pending: 'Eegaa',
      inactive: 'Hin Ka\'u',
      permissions: 'Heeyyamawwan',
      viewRecords: 'Galmee Ilaaluu',
      updateHealth: 'Fayyaa Haaromsuu',
      registerAnimals: 'Bineensota Galmessuu',
      save: 'Olkaa\'i',
      cancel: 'Dhiisi',
      remove: 'Haqi',
      approve: 'Fudhadhu',
      noStaff: 'Gargaartoonni hin argamne',
      inviteAssistant: 'Gargaartoo Affeeruu',
      assistantEmail: 'Imeelii Gargaartoo'
    },
    sw: {
      title: 'Wasaidizi wa Shamba',
      addStaff: 'Alika Msaidizi',
      search: 'Tafuta',
      filterByStatus: 'Chuja kwa Hali',
      all: 'Wote',
      email: 'Barua pepe',
      status: 'Hali',
      active: 'Hai',
      pending: 'Inasubiri',
      inactive: 'Haikai',
      permissions: 'Ruhusa',
      viewRecords: 'Tazama Rekodi',
      updateHealth: 'Sasisha Afya',
      registerAnimals: 'Sajili Wanyama',
      save: 'Hifadhi',
      cancel: 'Ghairi',
      remove: 'Ondoa',
      approve: 'Kubali',
      noStaff: 'Hakuna wasaidizi waliopatikana',
      inviteAssistant: 'Alika Msaidizi',
      assistantEmail: 'Barua pepe ya Msaidizi'
    }
  };

  const t = translations[language];

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStaff.email) {
      showError('Error', 'Please enter assistant email');
      return;
    }

    // TODO: In production, lookup user by email first
    // For now, using email as user_id (this should be updated)
    addAssistant({
      assistant_user_id: newStaff.email, // Should be actual user ID
      permissions: newStaff.permissions
    });
      
    setNewStaff({ 
      email: '', 
      permissions: {
        view_records: true,
        update_health: true,
        register_animals: true
      }
    });
    setShowAddStaff(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredStaff = assistants.filter(assistant => {
    const matchesSearch = assistant.assistant_user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assistant.status === filterStatus;
    return matchesSearch && matchesStatus;
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40 h-10 transition-all focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder={t.filterByStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="active">{t.active}</SelectItem>
                  <SelectItem value="pending">{t.pending}</SelectItem>
                  <SelectItem value="inactive">{t.inactive}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading assistants...</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t.noStaff}</p>
              </div>
            ) : (
              filteredStaff.map((assistant) => (
                <Card key={assistant.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                      <Avatar className="w-10 h-10 md:w-12 md:h-12">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm md:text-base">
                          {assistant.assistant_user_id.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm md:text-base truncate">{assistant.assistant_user_id}</h3>
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Mail className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="truncate">{assistant.assistant_user_id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Shield className="w-3 h-3 md:w-4 md:h-4" />
                            <div className="flex flex-wrap gap-1">
                              {assistant.permissions.view_records && (
                                <Badge variant="outline" className="text-xs">View</Badge>
                              )}
                              {assistant.permissions.update_health && (
                                <Badge variant="outline" className="text-xs">Health</Badge>
                              )}
                              {assistant.permissions.register_animals && (
                                <Badge variant="outline" className="text-xs">Register</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(assistant.status)}`}
                          >
                            {t[assistant.status as keyof typeof t] as string}
                          </Badge>
                          <div className="flex gap-1">
                            {assistant.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(assistant.id, 'active')}
                                className="h-7 px-2 text-xs"
                              >
                                {t.approve}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteAssistant(assistant.id)}
                              className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                            >
                              {t.remove}
                            </Button>
                          </div>
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
                  <Label htmlFor="staffEmail" className="text-sm font-medium">{t.assistantEmail}</Label>
                  <Input
                    id="staffEmail"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t.assistantEmail}
                    className="h-10 transition-all focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t.permissions}</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStaff.permissions.view_records}
                        onChange={(e) => setNewStaff(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, view_records: e.target.checked }
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm">{t.viewRecords}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStaff.permissions.update_health}
                        onChange={(e) => setNewStaff(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, update_health: e.target.checked }
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm">{t.updateHealth}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStaff.permissions.register_animals}
                        onChange={(e) => setNewStaff(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, register_animals: e.target.checked }
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm">{t.registerAnimals}</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={isAdding}
                    className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isAdding ? 'Inviting...' : t.save}
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
