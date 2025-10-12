import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, CheckCircle, XCircle, Clock, User, MessageCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

const InterestInbox = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslations();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

  // Fetch buyer interests where user is the seller
  const { data: interests, isLoading } = useQuery({
    queryKey: ['buyer-interests-inbox', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('buyer_interests')
        .select(`
          *,
          listing:market_listings(id, title, price, photos),
          buyer:buyer_user_id(id)
        `)
        .eq('seller_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Update interest status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ interestId, status }: { interestId: string; status: string }) => {
      const { error } = await supabase
        .from('buyer_interests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', interestId)
        .eq('seller_user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-interests-inbox'] });
      toast({
        title: t('inbox.statusUpdated') || 'Status Updated',
        description: t('inbox.statusUpdateSuccess') || 'Interest status updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error') || 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  const pendingInterests = interests?.filter(i => i.status === 'pending') || [];
  const approvedInterests = interests?.filter(i => i.status === 'approved') || [];
  const rejectedInterests = interests?.filter(i => i.status === 'rejected') || [];

  const handleApprove = (interestId: string) => {
    updateStatusMutation.mutate({ interestId, status: 'approved' });
  };

  const handleReject = (interestId: string) => {
    updateStatusMutation.mutate({ interestId, status: 'rejected' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl">{t('common.loginRequired')}</p>
        </div>
        <BottomNavigation language={language} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedHeader />
        <LoadingSpinner />
        <BottomNavigation language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-20">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-indigo-900 flex items-center gap-3">
              <Mail className="w-8 h-8 text-indigo-600" />
              {t('inbox.title') || 'Interest Inbox'}
            </h1>
            <p className="text-indigo-600 mt-1">
              {t('inbox.subtitle') || 'Manage buyer inquiries for your listings'}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('inbox.pending') || 'Pending'}</p>
                <p className="text-2xl font-bold text-orange-600">{pendingInterests.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('inbox.approved') || 'Approved'}</p>
                <p className="text-2xl font-bold text-emerald-600">{approvedInterests.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('inbox.rejected') || 'Rejected'}</p>
                <p className="text-2xl font-bold text-red-600">{rejectedInterests.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Interests Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending">
              {t('inbox.pending') || 'Pending'} ({pendingInterests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              {t('inbox.approved') || 'Approved'} ({approvedInterests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              {t('inbox.rejected') || 'Rejected'} ({rejectedInterests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <InterestList 
              interests={pendingInterests}
              onApprove={handleApprove}
              onReject={handleReject}
              showActions={true}
              t={t}
            />
          </TabsContent>

          <TabsContent value="approved">
            <InterestList 
              interests={approvedInterests}
              onApprove={handleApprove}
              onReject={handleReject}
              showActions={false}
              t={t}
            />
          </TabsContent>

          <TabsContent value="rejected">
            <InterestList 
              interests={rejectedInterests}
              onApprove={handleApprove}
              onReject={handleReject}
              showActions={false}
              t={t}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation language={language} />
    </div>
  );
};

// Interest List Component
const InterestList = ({ interests, onApprove, onReject, showActions, t }: any) => {
  if (interests.length === 0) {
    return (
      <Card className="p-12 text-center bg-white">
        <Mail className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">{t('inbox.noInterests') || 'No interests found'}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {interests.map((interest: any) => (
        <Card key={interest.id} className="p-6 bg-white hover:shadow-lg transition-shadow">
          <div className="flex gap-4">
            {/* Listing Photo */}
            <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {interest.listing?.photos?.[0] ? (
                <img 
                  src={interest.listing.photos[0]} 
                  alt={interest.listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{interest.listing?.title}</h3>
                  <p className="text-sm text-gray-600">
                    ETB {interest.listing?.price?.toLocaleString()}
                  </p>
                </div>
                <Badge variant={
                  interest.status === 'pending' ? 'default' :
                  interest.status === 'approved' ? 'secondary' : 'destructive'
                }>
                  {interest.status}
                </Badge>
              </div>

              {/* Message */}
              {interest.message && (
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-gray-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{interest.message}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <p className="text-xs text-gray-500 mb-3">
                {new Date(interest.created_at).toLocaleDateString()} • {new Date(interest.created_at).toLocaleTimeString()}
              </p>

              {/* Actions */}
              {showActions && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onApprove(interest.id)}
                    className="gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('inbox.approve') || 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(interest.id)}
                    className="gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('inbox.reject') || 'Reject'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InterestInbox;
