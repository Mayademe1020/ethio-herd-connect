// src/pages/MyTransfers.tsx - Transfer Management Page
// Mobile-first, shows pending and completed transfers

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextMVP';
import { ownershipTransferService } from '@/services/ownershipTransferService';
import { ArrowLeft, Package, Phone, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Transfer {
  id: string;
  animalId: string;
  animalName: string;
  animalType: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  agreedPrice: number;
  status: string;
  initiatedAt: string;
  expiresAt: string;
  completedAt?: string;
}

type TabType = 'pending' | 'completed' | 'all';

const MyTransfers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Fetch transfers
  const { data: transfers = [], isLoading, refetch } = useQuery<Transfer[]>({
    queryKey: ['transfers', user?.id, activeTab, isOnline],
    queryFn: async (): Promise<Transfer[]> => {
      if (!user) return [];

      try {
        // Fetch as seller
        const { data: sellerData, error: sellerError } = await supabase
          .from('ownership_transfers')
          .select('*')
          .eq('seller_id', user.id)
          .order('initiated_at', { ascending: false });

        // Fetch as buyer
        const { data: buyerData, error: buyerError } = await supabase
          .from('ownership_transfers')
          .select('*')
          .eq('buyer_id', user.id)
          .order('initiated_at', { ascending: false });

        if (sellerError || buyerError) {
          console.error('Transfer fetch error:', sellerError || buyerError);
          return [];
        }

        // Combine and filter by role
        const allTransfers = [...(sellerData || []), ...(buyerData || [])];
        const mapped: Transfer[] = (allTransfers || []).map(t => ({
          id: t.id,
          animalId: t.animal_id,
          animalName: t.animal_name || 'Unknown Animal',
          animalType: t.animal_type || 'cattle',
          sellerId: t.seller_id,
          sellerName: t.seller_name || 'Unknown Seller',
          buyerId: t.buyer_id,
          buyerName: t.buyer_name || 'Unknown Buyer',
          agreedPrice: t.agreed_price || 0,
          status: t.status,
          initiatedAt: t.initiated_at,
          expiresAt: t.expires_at,
          completedAt: t.completed_at,
        }));

        return mapped;
      } catch (error) {
        console.error('Failed to fetch transfers:', error);
        return [];
      }
    },
    enabled: !!user && isOnline,
    staleTime: 30000,
  });

  // Filter transfers by tab
  const filteredTransfers = transfers.filter(t => {
    if (activeTab === 'pending') {
      return ['pending_buyer', 'pending_verification', 'pending_payment'].includes(t.status);
    }
    if (activeTab === 'completed') {
      return t.status === 'completed';
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_buyer':
        return <Badge className="bg-yellow-500 text-white">Awaiting Buyer</Badge>;
      case 'pending_verification':
        return <Badge className="bg-blue-500 text-white">Needs Verification</Badge>;
      case 'pending_payment':
        return <Badge className="bg-purple-500 text-white">Awaiting Payment</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500 text-white">Cancelled</Badge>;
      case 'expired':
        return <Badge className="bg-red-500 text-white">Expired</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_buyer':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'pending_verification':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'pending_payment':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleLabel = (transfer: Transfer) => {
    if (user?.id === transfer.sellerId) return 'You are selling';
    if (user?.id === transfer.buyerId) return 'You are buying';
    return '';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleTransferClick = (transfer: Transfer) => {
    // Navigate to animal detail with transfer context
    navigate(`/animals/${transfer.animalId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Transfers</h1>
            <p className="text-sm text-gray-600">
              {transfers.length} transfers
              {!isOnline && <span className="text-amber-600 ml-2">• Offline</span>}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <TabButton
            active={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
            label="Pending"
            count={transfers.filter(t => ['pending_buyer', 'pending_verification', 'pending_payment'].includes(t.status)).length}
          />
          <TabButton
            active={activeTab === 'completed'}
            onClick={() => setActiveTab('completed')}
            label="Completed"
            count={transfers.filter(t => t.status === 'completed').length}
          />
          <TabButton
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            label="All"
            count={transfers.length}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-4 border">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'pending' ? 'No pending transfers' :
               activeTab === 'completed' ? 'No completed transfers' : 'No transfers yet'}
            </h2>
            <p className="text-gray-600 mb-6">
              {activeTab === 'pending' ? 'All your transfers are up to date!' :
               'Start by creating a listing in the marketplace'}
            </p>
            <Button
              onClick={() => navigate('/marketplace')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransfers.map(transfer => (
              <Card
                key={transfer.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleTransferClick(transfer)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Animal Icon */}
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">
                        {transfer.animalType === 'cattle' ? '🐄' :
                         transfer.animalType === 'goat' ? '🐐' : '🐑'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {transfer.animalName}
                        </h3>
                        {getStatusBadge(transfer.status)}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {getRoleLabel(transfer)}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-green-600">
                          {formatPrice(transfer.agreedPrice)}
                        </span>
                        <span className="text-gray-500">
                          {formatDate(transfer.initiatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {getStatusIcon(transfer.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}

const TabButton = ({ active, onClick, label, count }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium flex items-center gap-2 ${
      active
        ? 'bg-green-500 text-white shadow-sm'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {label}
    {count > 0 && (
      <span className={`px-2 py-0.5 rounded-full text-xs ${
        active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {count}
      </span>
    )}
  </button>
);

export default MyTransfers;