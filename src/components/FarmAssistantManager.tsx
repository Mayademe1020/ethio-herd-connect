
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Trash2, CheckCircle, XCircle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FarmAssistantManagerProps {
  language: 'am' | 'en';
}

interface FarmAssistant {
  id: string;
  assistant_user_id: string;
  status: 'pending' | 'active' | 'inactive';
  permissions: {
    register_animals: boolean;
    update_health: boolean;
    view_records: boolean;
  };
  created_at: string;
  assistant_email?: string;
}

export const FarmAssistantManager: React.FC<FarmAssistantManagerProps> = ({ language }) => {
  const [assistants, setAssistants] = useState<FarmAssistant[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('farm_assistants')
        .select('*')
        .eq('farm_owner_id', user.id);

      if (error) throw error;
      
      // Get user emails for assistants
      const assistantIds = data?.map(a => a.assistant_user_id) || [];
      if (assistantIds.length > 0) {
        const { data: userData } = await supabase.auth.admin.listUsers();
        const usersMap = userData.users.reduce((acc: any, u: any) => {
          acc[u.id] = u.email;
          return acc;
        }, {});

        const assistantsWithEmails = data?.map(assistant => ({
          ...assistant,
          assistant_email: usersMap[assistant.assistant_user_id] || 'Unknown'
        })) || [];

        setAssistants(assistantsWithEmails);
      } else {
        setAssistants(data || []);
      }
    } catch (error) {
      console.error('Error fetching assistants:', error);
    }
  };

  const inviteAssistant = async () => {
    if (!user || !inviteEmail.trim()) return;

    setLoading(true);
    try {
      // Check if user exists
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const existingUser = authUsers.users.find(u => u.email === inviteEmail);

      if (!existingUser) {
        toast({
          title: language === 'am' ? 'ስህተት' : 'Error',
          description: language === 'am' 
            ? 'ይህ ኢሜል አድራሻ አይገኝም' 
            : 'User with this email not found',
          variant: 'destructive'
        });
        return;
      }

      // Create farm assistant record
      const { error } = await supabase
        .from('farm_assistants')
        .insert([{
          farm_owner_id: user.id,
          assistant_user_id: existingUser.id,
          status: 'pending'
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: language === 'am' ? 'ስህተት' : 'Error',
            description: language === 'am' 
              ? 'ይህ ኢሜል አድራሻ ቀደም ሲል ተጋብዟል' 
              : 'This user is already invited',
            variant: 'destructive'
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' 
          ? 'ግብዣ ተልኳል' 
          : 'Invitation sent successfully'
      });

      setInviteEmail('');
      await fetchAssistants();
    } catch (error) {
      console.error('Error inviting assistant:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' 
          ? 'ግብዣ መላክ አልተሳካም' 
          : 'Failed to send invitation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAssistantStatus = async (assistantId: string, status: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('farm_assistants')
        .update({ status })
        .eq('id', assistantId);

      if (error) throw error;

      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' 
          ? 'ሁኔታ ተቀይሯል' 
          : 'Status updated successfully'
      });

      await fetchAssistants();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' 
          ? 'ሁኔታ ማስተካከል አልተሳካም' 
          : 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const removeAssistant = async (assistantId: string) => {
    try {
      const { error } = await supabase
        .from('farm_assistants')
        .delete()
        .eq('id', assistantId);

      if (error) throw error;

      toast({
        title: language === 'am' ? 'ተሳክቷል' : 'Success',
        description: language === 'am' 
          ? 'አጋዥ ተወግዷል' 
          : 'Assistant removed successfully'
      });

      await fetchAssistants();
    } catch (error) {
      console.error('Error removing assistant:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' 
          ? 'አጋዥ መወገድ አልተሳካም' 
          : 'Failed to remove assistant',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };

    const labels = {
      pending: language === 'am' ? 'በመጠባበቅ ላይ' : 'Pending',
      active: language === 'am' ? 'ንቁ' : 'Active',
      inactive: language === 'am' ? 'እርቅ' : 'Inactive'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>{language === 'am' ? 'የእርሻ አጋዦች' : 'Farm Assistants'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">
            {language === 'am' ? 'አዲስ አጋዥ ይጋብዙ' : 'Invite New Assistant'}
          </h3>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder={language === 'am' ? 'ኢሜል አድራሻ' : 'Email address'}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={inviteAssistant}
              disabled={loading || !inviteEmail.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {language === 'am' ? 'ይጋብዙ' : 'Invite'}
            </Button>
          </div>
        </div>

        {/* Assistants List */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">
            {language === 'am' ? 'አጋዦች ዝርዝር' : 'Current Assistants'}
          </h3>
          
          {assistants.length === 0 ? (
            <p className="text-gray-500 text-sm">
              {language === 'am' ? 'እስካሁን ምንም አጋዝ አልተጋብዘም' : 'No assistants invited yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {assistants.map((assistant) => (
                <div key={assistant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{assistant.assistant_email}</p>
                      <p className="text-xs text-gray-500">
                        {language === 'am' ? 'ተጋብዞ' : 'Invited'} {new Date(assistant.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(assistant.status)}
                    
                    {assistant.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAssistantStatus(assistant.id, 'active')}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {assistant.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAssistantStatus(assistant.id, 'inactive')}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeAssistant(assistant.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
