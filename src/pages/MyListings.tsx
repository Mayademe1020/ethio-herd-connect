import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useTranslations } from '@/hooks/useTranslations';
import { useMarketplaceListing } from '@/hooks/useMarketplaceListing';
import { EditListingModal } from '@/components/EditListingModal';
import { supabase } from '@/integrations/supabase/client';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Video, Image as ImageIcon, Loader2, CheckCircle, XCircle, Edit, Users } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { ANIMAL_TYPE_ICONS } from '@/utils/animalTypes';

interface Listing {
  id: string;
  user_id: string;
  animal_id: string;
  price: number;
  is_negotiable: boolean;
  description?: string;
  location?: string;
  contact_phone?: string;
  photo_url?: string;
  video_url?: string;
  video_thumbnail?: string;
  video_duration?: number;
  status: string;
  views_count: number;
  pregnancy_status?: string;
  lactation_status?: string;
  created_at: string;
  updated_at: string;
  last_edited_at?: string;
  edit_count?: number;
  animals?: {
    name: string;
    type: string;
    subtype?: string;
  };
}

const MyListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslations();
  const { showToast } = useToast();
  const { markAsSold, cancelListing, updateListing, isUpdating } = useMarketplaceListing();
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [buyerInterestsCount, setBuyerInterestsCount] = useState(0);

  // Fetch user's listings
  const { data: listings, isLoading, refetch } = useQuery({
    queryKey: ['my-listings', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('market_listings')
        .select(`
          *,
          animals (
            name,
            type,
            subtype
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown) as Listing[];
    },
    enabled: !!user
  });

  // Fetch buyer interests count for each listing
  const { data: buyerInterestsCounts } = useQuery({
    queryKey: ['buyer-interests-counts', user?.id],
    queryFn: async () => {
      if (!user || !listings) return {};

      const listingIds = listings.map(l => l.id);
      if (listingIds.length === 0) return {};

      const { data, error } = await supabase
        .from('buyer_interests')
        .select('listing_id')
        .in('listing_id', listingIds);

      if (error) throw error;

      // Count interests per listing
      const counts: Record<string, number> = {};
      data?.forEach((interest: any) => {
        counts[interest.listing_id] = (counts[interest.listing_id] || 0) + 1;
      });

      return counts;
    },
    enabled: !!user && !!listings && listings.length > 0
  });

  const handleMarkAsSold = async (listingId: string) => {
    try {
      await markAsSold(listingId);
      refetch();
    } catch (error) {
      console.error('Error marking as sold:', error);
      showToast(t('errors.unknownError'), 'error');
    }
  };

  const handleCancelListing = async (listingId: string) => {
    if (!confirm(t('marketplace.confirmCancel'))) {
      return;
    }

    try {
      await cancelListing(listingId);
      refetch();
    } catch (error) {
      console.error('Error cancelling listing:', error);
      showToast(t('errors.unknownError'), 'error');
    }
  };

  const handleEditClick = async (listing: Listing) => {
    // Fetch buyer interests count
    try {
      const { count } = await supabase
        .from('buyer_interests')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', listing.id);
      
      setBuyerInterestsCount(count || 0);
      setEditingListing(listing);
    } catch (error) {
      console.error('Error fetching buyer interests:', error);
      setBuyerInterestsCount(0);
      setEditingListing(listing);
    }
  };

  const handleSaveEdit = async (updates: any) => {
    if (!editingListing) return;

    try {
      await updateListing(editingListing.id, updates);
      showToast(t('marketplace.listingUpdated'), 'success');
      setEditingListing(null);
      refetch();
    } catch (error) {
      console.error('Error updating listing:', error);
      showToast(t('errors.unknownError'), 'error');
      throw error; // Re-throw to let modal handle it
    }
  };

  const activeListings = listings?.filter(l => l.status === 'active') || [];
  const soldListings = listings?.filter(l => l.status === 'sold') || [];
  const cancelledListings = listings?.filter(l => l.status === 'cancelled') || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <BackButton />
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-2xl font-bold">{t('marketplace.myListings')}</h1>
            <Button
              onClick={() => navigate('/create-listing')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('marketplace.createListing')}
            </Button>
          </div>
        </div>

        {/* Edit Listing Modal */}
        {editingListing && (
          <EditListingModal
            listing={editingListing}
            buyerInterestsCount={buyerInterestsCount}
            onSave={handleSaveEdit}
            onClose={() => setEditingListing(null)}
            isSaving={isUpdating}
          />
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{activeListings.length}</p>
              <p className="text-sm text-gray-600">{t('marketplace.active')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{soldListings.length}</p>
              <p className="text-sm text-gray-600">{t('marketplace.sold')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">{cancelledListings.length}</p>
              <p className="text-sm text-gray-600">{t('marketplace.cancelled')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Listings */}
        {!listings || listings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-2">{t('marketplace.noListings')}</h3>
              <p className="text-gray-600 mb-4">{t('marketplace.createFirstListing')}</p>
              <Button
                onClick={() => navigate('/create-listing')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('marketplace.createListing')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Image/Video Indicator */}
                    <div className="w-32 h-32 bg-gray-200 flex-shrink-0 relative">
                      {listing.photo_url ? (
                        <img
                          src={listing.photo_url}
                          alt={listing.animals?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {ANIMAL_TYPE_ICONS[listing.animals?.type || 'cattle'] || '🐄'}
                        </div>
                      )}
                      
                      {/* Media indicators */}
                      <div className="absolute bottom-2 left-2 flex space-x-1">
                        {listing.photo_url && (
                          <div className="bg-black bg-opacity-70 text-white px-1.5 py-0.5 rounded text-xs flex items-center">
                            <ImageIcon className="w-3 h-3" />
                          </div>
                        )}
                        {listing.video_url && (
                          <div className="bg-black bg-opacity-70 text-white px-1.5 py-0.5 rounded text-xs flex items-center">
                            <Video className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Status badge */}
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={
                            listing.status === 'active' ? 'default' :
                            listing.status === 'sold' ? 'secondary' : 'outline'
                          }
                          className={
                            listing.status === 'active' ? 'bg-green-600' :
                            listing.status === 'sold' ? 'bg-blue-600' : 'bg-gray-600'
                          }
                        >
                          {listing.status === 'active' && t('marketplace.active')}
                          {listing.status === 'sold' && t('marketplace.sold')}
                          {listing.status === 'cancelled' && t('marketplace.cancelled')}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{listing.animals?.name}</h3>
                          <p className="text-sm text-gray-600">
                            {listing.animals?.type} • {listing.animals?.subtype}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-600">
                            {listing.price.toLocaleString()} ETB
                          </p>
                          {listing.is_negotiable && (
                            <p className="text-xs text-gray-500">{t('marketplace.negotiable')}</p>
                          )}
                        </div>
                      </div>

                      {/* Female animal info */}
                      {(listing.pregnancy_status || listing.lactation_status) && (
                        <div className="flex space-x-2 mb-3">
                          {listing.pregnancy_status && (
                            <Badge variant="outline" className="text-xs">
                              {listing.pregnancy_status}
                            </Badge>
                          )}
                          {listing.lactation_status && (
                            <Badge variant="outline" className="text-xs">
                              {listing.lactation_status}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {listing.views_count} {t('marketplace.views')}
                        </div>
                        {buyerInterestsCounts && buyerInterestsCounts[listing.id] > 0 && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1 text-orange-600" />
                            <span className="font-semibold text-orange-600">
                              {buyerInterestsCounts[listing.id]} {t('marketplace.interested')}
                            </span>
                          </div>
                        )}
                        <div>
                          {new Date(listing.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Actions */}
                      {listing.status === 'active' && (
                        <div className="flex flex-col space-y-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(listing)}
                            disabled={isUpdating}
                            className="w-full border-green-600 text-green-600 hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            {t('edit')}
                          </Button>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsSold(listing.id)}
                              disabled={isUpdating}
                              className="flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t('marketplace.markAsSold')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelListing(listing.id)}
                              disabled={isUpdating}
                              className="flex-1"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              {t('marketplace.cancelListing')}
                            </Button>
                          </div>
                        </div>
                      )}
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

export default MyListings;
