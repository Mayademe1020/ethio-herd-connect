
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, User, Mail, Phone, Settings, Trash2, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  assistant_user_id: string;
  farm_owner_id: string;
  status: 'pending' | 'active' | 'inactive';
  permissions: {
    view_records: boolean;
    update_health: boolean;
    register_animals: boolean;
  };
  created_at: string;
  email?: string;
  phone?: string;
  name?: string;
}

interface StaffManagementProps {
  language: 'am' | 'en';
  onClose: () => void;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({
  language,
  onClose
}) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    email: '',
    phone: '',
    name: '',
    permissions: {
      view_records: true,
      update_health: false,
      register_animals: false
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('farm_assistants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ሰራተኞች ማምጣት አልተሳካም' : 'Failed to fetch staff',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStaff.email || !newStaff.phone) {
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ኢሜል እና ስልክ ቁጥር ያስፈልጋል' : 'Email and phone number are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('farm_assistants')
        .insert([{
          farm_owner_id: user.id,
          assistant_user_id: newStaff.email, // Temporary, will be updated when they register
          permissions: newStaff.permissions,
          status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' ? 'ሰራተኛ ተጨምሯል' : 'Staff member added successfully'
      });

      setNewStaff({
        email: '',
        phone: '',
        name: '',
        permissions: {
          view_records: true,
          update_health: false,
          register_animals: false
        }
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

  const handleUpdateStatus = async (staffId: string, newStatus: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('farm_assistants')
        .update({ status: newStatus })
        .eq('id', staffId);

      if (error) throw error;

      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' ? 'ሁኔታ ተዘምኗል' : 'Status updated successfully'
      });

      fetchStaff();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ሁኔታ ማዘመን አልተሳካም' : 'Failed to update status',
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
        description: language === 'am' ? 'ሰራተኛ ተሰርዟል' : 'Staff member removed successfully'
      });

      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ሰራተኛ መሰረዝ አልተሳካም' : 'Failed to remove staff member',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pending: language === 'am' ? 'በመጠባበቅ ላይ' : 'Pending',
      active: language === 'am' ? 'ንቁ' : 'Active',
      inactive: language === 'am' ? 'ገባር' : 'Inactive'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>{language === 'am' ? 'ሰራተኞች ማስተዳደር' : 'Staff Management'}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Add Staff Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {language === 'am' ? 'ሰራተኞች' : 'Staff Members'} ({staff.length})
            </h3>
            <Button
              onClick={() => setShowAddForm(true)}
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
              <CardContent>
                <form onSubmit={handleAddStaff} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{language === 'am' ? 'ኢሜል' : 'Email'} *</span>
                      </label>
                      <Input
                        type="email"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={language === 'am' ? 'ኢሜል አድራሻ' : 'Email address'}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{language === 'am' ? 'ስልክ ቁጥር' : 'Phone Number'} *</span>
                      </label>
                      <Input
                        type="tel"
                        value={newStaff.phone}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder={language === 'am' ? 'ስልክ ቁጥር' : 'Phone number'}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{language === 'am' ? 'ሙሉ ስም' : 'Full Name'}</span>
                      </label>
                      <Input
                        type="text"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={language === 'am' ? 'ሙሉ ስም' : 'Full name'}
                      />
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>{language === 'am' ? 'ፈቃዶች' : 'Permissions'}</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newStaff.permissions.view_records}
                          onChange={(e) => setNewStaff(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, view_records: e.target.checked }
                          }))}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {language === 'am' ? 'መዝገቦች ማየት' : 'View Records'}
                        </span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newStaff.permissions.update_health}
                          onChange={(e) => setNewStaff(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, update_health: e.target.checked }
                          }))}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {language === 'am' ? 'ጤንነት ማዘመን' : 'Update Health'}
                        </span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newStaff.permissions.register_animals}
                          onChange={(e) => setNewStaff(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, register_animals: e.target.checked }
                          }))}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {language === 'am' ? 'እንስሳት መመዝገብ' : 'Register Animals'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      {language === 'am' ? 'ጨምር' : 'Add Staff'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      {language === 'am' ? 'ሰርዝ' : 'Cancel'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Staff List */}
          <div className="space-y-4">
            {staff.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {language === 'am' ? 'ምንም ሰራተኛ አልተጨመረም' : 'No staff members added yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              staff.map((member) => (
                <Card key={member.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {member.name || member.assistant_user_id}
                          </h4>
                          <p className="text-sm text-gray-600">{member.assistant_user_id}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(member.status)}
                            <span className="text-xs text-gray-500">
                              {language === 'am' ? 'ጨመረ' : 'Added'}: {new Date(member.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {member.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(member.id, 'active')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {member.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(member.id, 'inactive')}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteStaff(member.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Permissions Display */}
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        {language === 'am' ? 'ፈቃዶች:' : 'Permissions:'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {member.permissions.view_records && (
                          <Badge variant="outline">
                            {language === 'am' ? 'መዝገቦች ማየት' : 'View Records'}
                          </Badge>
                        )}
                        {member.permissions.update_health && (
                          <Badge variant="outline">
                            {language === 'am' ? 'ጤንነት ማዘመን' : 'Update Health'}
                          </Badge>
                        )}
                        {member.permissions.register_animals && (
                          <Badge variant="outline">
                            {language === 'am' ? 'እንስሳት መመዝገብ' : 'Register Animals'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
