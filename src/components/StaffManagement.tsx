
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Plus, Phone, Trash2, Users, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  phone: string;
  name: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  permissions: {
    view_records: boolean;
    update_health: boolean;
    register_animals: boolean;
    manage_market: boolean;
    view_reports: boolean;
  };
  created_at: string;
}

interface StaffManagementProps {
  language: 'am' | 'en';
  onClose: () => void;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({
  language,
  onClose
}) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    phone: '',
    role: 'assistant'
  });
  const [newPermissions, setNewPermissions] = useState({
    view_records: true,
    update_health: true,
    register_animals: false,
    manage_market: false,
    view_reports: false
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('farm_assistants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      const transformedData: StaffMember[] = (data || []).map(item => ({
        id: item.id,
        phone: item.assistant_user_id, // Using this as phone for now
        name: `Staff Member ${item.id.slice(0, 8)}`, // Generate name from ID
        role: 'assistant',
        status: item.status as 'active' | 'pending' | 'inactive',
        permissions: item.permissions || {
          view_records: true,
          update_health: true,
          register_animals: false,
          manage_market: false,
          view_reports: false
        },
        created_at: item.created_at
      }));

      setStaffMembers(transformedData);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ሰራተኞችን ማምጣት አልተሳካም' : 'Failed to fetch staff members',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaff.name.trim() || !newStaff.phone.trim()) {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ሁሉም መስኮች ያስፈልጋሉ' : 'All fields are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('farm_assistants')
        .insert([{
          farm_owner_id: user.id,
          assistant_user_id: newStaff.phone, // Using phone as identifier
          permissions: newPermissions,
          status: 'active'
        }]);

      if (error) throw error;

      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' ? 'ሰራተኛ ተጨምሯል' : 'Staff member added successfully'
      });

      setNewStaff({ name: '', phone: '', role: 'assistant' });
      setNewPermissions({
        view_records: true,
        update_health: true,
        register_animals: false,
        manage_market: false,
        view_reports: false
      });
      setShowAddForm(false);
      fetchStaff();
    } catch (error) {
      console.error('Error adding staff:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ሰራተኛ መጨመር አልተሳካም' : 'Failed to add staff member',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      const { error } = await supabase
        .from('farm_assistants')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' ? 'ሰራተኛ ተሰርዟል' : 'Staff member deleted successfully'
      });

      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ሰራተኛ መሰረዝ አልተሳካም' : 'Failed to delete staff member',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>{language === 'am' ? 'የሰራተኞች አስተዳደር' : 'Staff Management'}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Add Staff Button */}
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {language === 'am' 
                ? 'የእርሻ ሰራተኞችን ያክሉ እና ያስተዳድሩ'
                : 'Add and manage your farm staff members'
              }
            </p>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'am' ? 'ሰራተኛ ጨምር' : 'Add Staff'}
            </Button>
          </div>

          {/* Add Staff Form */}
          {showAddForm && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'am' ? 'አዲስ ሰራተኛ ጨምር' : 'Add New Staff Member'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === 'am' ? 'ስም' : 'Name'} *
                    </label>
                    <Input
                      value={newStaff.name}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={language === 'am' ? 'የሰራተኛ ስም' : 'Staff member name'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === 'am' ? 'ስልክ ቁጥር' : 'Phone Number'} *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+251912345678"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    {language === 'am' ? 'ፈቃዶች' : 'Permissions'}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{language === 'am' ? 'መዝገቦችን ማየት' : 'View Records'}</span>
                      <Switch
                        checked={newPermissions.view_records}
                        onCheckedChange={(checked) => 
                          setNewPermissions(prev => ({ ...prev, view_records: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{language === 'am' ? 'ጤንነት ማዘመን' : 'Update Health'}</span>
                      <Switch
                        checked={newPermissions.update_health}
                        onCheckedChange={(checked) => 
                          setNewPermissions(prev => ({ ...prev, update_health: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{language === 'am' ? 'እንስሳት ማስመዝገብ' : 'Register Animals'}</span>
                      <Switch
                        checked={newPermissions.register_animals}
                        onCheckedChange={(checked) => 
                          setNewPermissions(prev => ({ ...prev, register_animals: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{language === 'am' ? 'ገበያ ማስተዳደር' : 'Manage Market'}</span>
                      <Switch
                        checked={newPermissions.manage_market}
                        onCheckedChange={(checked) => 
                          setNewPermissions(prev => ({ ...prev, manage_market: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button onClick={handleAddStaff} className="bg-green-600 hover:bg-green-700">
                    {language === 'am' ? 'ሰራተኛ ጨምር' : 'Add Staff'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    {language ===

 'am' ? 'ሰርዝ' : 'Cancel'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Staff List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {language === 'am' ? 'የሰራተኞች ዝርዝር' : 'Staff Members'}
            </h3>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : staffMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffMembers.map((staff) => (
                  <Card key={staff.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{staff.name}</h4>
                          <p className="text-sm text-gray-600 flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{staff.phone}</span>
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(staff.status)}>
                            {staff.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStaff(staff.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Shield className="w-3 h-3" />
                          <span className="font-medium">{language === 'am' ? 'ፈቃዶች:' : 'Permissions:'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {staff.permissions.view_records && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              {language === 'am' ? 'መዝገብ' : 'Records'}
                            </span>
                          )}
                          {staff.permissions.update_health && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {language === 'am' ? 'ጤንነት' : 'Health'}
                            </span>
                          )}
                          {staff.permissions.register_animals && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {language === 'am' ? 'ምዝገባ' : 'Register'}
                            </span>
                          )}
                          {staff.permissions.manage_market && (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              {language === 'am' ? 'ገበያ' : 'Market'}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {language === 'am' ? 'ምንም ሰራተኛ የለም' : 'No Staff Members'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {language === 'am' 
                    ? 'የመጀመሪያ ሰራተኛዎን ይጨምሩ'
                    : 'Add your first staff member to get started'
                  }
                </p>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'am' ? 'ሰራተኛ ጨምር' : 'Add Staff Member'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
