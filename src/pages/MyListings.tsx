import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { useSecurePublicMarketplace } from '@/hooks/useSecurePublicMarketplace';
import { useMarketListingManagement } from '@/hooks/useMarketListingManagement';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, Eye, TrendingUp, Package, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MarketListingDetails } from '@/components/MarketListingDetails';
import { MarketListingForm } from '@/components/MarketListingForm';

const MyListings = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { t } = useTranslations();
  const { listings, loading: isLoading } = useSecurePublicMarketplace();
  const { deleteListing, updateStatus, isDeleting } = useMarketListingManagement();

  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('active');

  // Filter to only user's listings
  const myListings = listings?.filter(l => l.user_id === user?.id) || [];
  
  const activeListings = myListings.filter(l => l.status === 'active');
  const soldListings = myListings.filter(l => l.status === 'sold');
  const inactiveListings = myListings.filter(l => l.status === 'inactive');

  const handleEdit = (listing: any) => {
    setEditingListing(listing);
  };

  const handleDelete = (listingId: string) => {
    if (confirm(t('myListings.confirmDelete') || 'Are you sure you want to delete this listing?')) {
      deleteListing(listingId);
    }
  };

  const handleStatusChange = (listingId: string, status: 'active' | 'sold' | 'inactive') => {
    updateStatus(listingId, status);
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 pb-20">
      <EnhancedHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">
              {t('myListings.title') || 'My Listings'}
            </h1>
            <p className="text-emerald-600 mt-1">
              {t('myListings.subtitle') || 'Manage your marketplace listings'}
            </p>
          </div>
          <Button onClick={() => window.location.href = '/market'} className="gap-2">
            <Package className="w-4 h-4" />
            {t('myListings.createNew') || 'Create New'}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('myListings.active') || 'Active'}</p>
                <p className="text-2xl font-bold text-emerald-600">{activeListings.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('myListings.sold') || 'Sold'}</p>
                <p className="text-2xl font-bold text-blue-600">{soldListings.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('myListings.inactive') || 'Inactive'}</p>
                <p className="text-2xl font-bold text-gray-600">{inactiveListings.length}</p>
              </div>
              <Eye className="w-8 h-8 text-gray-600" />
            </div>
          </Card>
        </div>

        {/* Listings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="active">{t('myListings.active') || 'Active'} ({activeListings.length})</TabsTrigger>
            <TabsTrigger value="sold">{t('myListings.sold') || 'Sold'} ({soldListings.length})</TabsTrigger>
            <TabsTrigger value="inactive">{t('myListings.inactive') || 'Inactive'} ({inactiveListings.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <ListingGrid 
              listings={activeListings}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={setSelectedListing}
              onStatusChange={handleStatusChange}
              t={t}
            />
          </TabsContent>

          <TabsContent value="sold">
            <ListingGrid 
              listings={soldListings}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={setSelectedListing}
              onStatusChange={handleStatusChange}
              t={t}
            />
          </TabsContent>

          <TabsContent value="inactive">
            <ListingGrid 
              listings={inactiveListings}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={setSelectedListing}
              onStatusChange={handleStatusChange}
              t={t}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {selectedListing && (
        <MarketListingDetails
          listing={selectedListing}
          language={language}
          currentUserId={user?.id}
          onClose={() => setSelectedListing(null)}
          onContact={() => {}}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {editingListing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{t('myListings.editListing') || 'Edit Listing'}</h2>
              <Button variant="ghost" size="sm" onClick={() => setEditingListing(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-gray-600">
              {t('myListings.editNote') || 'To edit your listing, please go to the Market page.'}
            </p>
            <Button 
              className="mt-4" 
              onClick={() => {
                setEditingListing(null);
                window.location.href = '/market';
              }}
            >
              {t('myListings.goToMarket') || 'Go to Market Page'}
            </Button>
          </div>
        </div>
      )}

      <BottomNavigation language={language} />
    </div>
  );
};

// Listing Grid Component
const ListingGrid = ({ listings, onEdit, onDelete, onViewDetails, onStatusChange, t }: any) => {
  if (listings.length === 0) {
    return (
      <Card className="p-12 text-center bg-white">
        <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">{t('myListings.noListings') || 'No listings found'}</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing: any) => (
        <Card key={listing.id} className="overflow-hidden bg-white hover:shadow-lg transition-shadow">
          {/* Image */}
          <div className="relative h-48 bg-gray-200">
            {listing.photos?.[0] ? (
              <img 
                src={listing.photos[0]} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <Badge className="absolute top-2 right-2" variant={
              listing.status === 'active' ? 'default' : 
              listing.status === 'sold' ? 'secondary' : 'outline'
            }>
              {listing.status}
            </Badge>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{listing.title}</h3>
            <p className="text-2xl font-bold text-emerald-600 mb-4">
              ETB {listing.price?.toLocaleString()}
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails(listing)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                {t('common.view') || 'View'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(listing)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onDelete(listing.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Status Change */}
            {listing.status !== 'sold' && (
              <div className="mt-3 pt-3 border-t">
                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onStatusChange(listing.id, listing.status === 'active' ? 'inactive' : 'active')}
                >
                  {listing.status === 'active' 
                    ? t('myListings.markInactive') || 'Mark Inactive'
                    : t('myListings.markActive') || 'Mark Active'
                  }
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MyListings;
