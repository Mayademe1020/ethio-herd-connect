import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InfiniteScrollContainer, ListSkeleton, EmptyState } from '@/components/InfiniteScrollContainer';
import { usePaginatedPublicMarketplace } from '@/hooks/usePaginatedMarketListings';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, DollarSign, ShoppingCart, Plus, Verified, Heart } from 'lucide-react';

// PublicMarketplaceEnhanced component
const PublicMarketplaceEnhanced = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Main marketplace listings with filters
  const {
    listings,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    isOffline,
    isEmpty,
    totalCount,
    refresh
  } = usePaginatedPublicMarketplace(
    {
      animalType: typeFilter || undefined,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      location: locationFilter || undefined,
      searchQuery: searchQuery || undefined,
    },
    {
      pageSize: 20,
      sortBy,
      sortOrder,
    }
  );

  const translations = {
    am: {
      title: 'የሕዝብ ገበያ',
      subtitle: 'ከተረጋገጡ ሻጮች ለሽያጭ የቀረቡ እንስሳትን ይመልከቱ እና ያግኙ',
      search: 'ዝርዝሮችን ይፈልጉ...',
      filterType: 'የእንስሳ አይነት',
      filterLocation: 'አካባቢ',
      minPrice: 'ዝቅተኛ ዋጋ',
      maxPrice: 'ከፍተኛ ዋጋ',
      sortBy: 'ደርድር በ',
      date: 'ቀን',
      price: 'ዋጋ',
      noListings: 'ምንም ዝርዝር አልተገኘም',
      startBrowsing: 'በአካባቢዎ ካሉ ገበሬዎች የሚገኙ እንስሳትን ይመልከቱ',
      cattle: 'ከብት',
      goat: 'ፍየል',
      sheep: 'በግ',
      poultry: 'ዶሮ',
      birr: 'ብር',
      contactSeller: 'ሻጩን ያነጋግሩ',
      viewDetails: 'ዝርዝር ይመልከቱ',
      verified: 'የተረጋገጠ',
      newest: 'አዲስ መጀመሪያ',
      oldest: 'አሮጌ መጀመሪያ',
      lowToHigh: 'ዝቅተኛ ወደ ከፍተኛ',
      highToLow: 'ከፍተኛ ወደ ዝቅተኛ'
    },
    en: {
      title: 'Public Marketplace',
      subtitle: 'Browse and discover animals for sale from verified sellers',
      search: 'Search listings...',
      filterType: 'Animal type',
      filterLocation: 'Location',
      minPrice: 'Min price',
      maxPrice: 'Max price',
      sortBy: 'Sort by',
      date: 'Date',
      price: 'Price',
      noListings: 'No listings found',
      startBrowsing: 'Browse available animals from farmers in your area',
      cattle: 'Cattle',
      goat: 'Goat',
      sheep: 'Sheep',
      poultry: 'Poultry',
      birr: 'Birr',
      contactSeller: 'Contact Seller',
      viewDetails: 'View Details',
      verified: 'Verified',
      newest: 'Newest First',
      oldest: 'Oldest First',
      lowToHigh: 'Price: Low to High',
      highToLow: 'Price: High to Low'
    },
    or: {
      title: 'Gabaa Uummataa',
      subtitle: 'Horii gurgurtaaf jiran gurgurtoota mirkaneeffaman irraa ilaalaa fi argaa',
      search: 'Tarree barbaadi...',
      filterType: 'Gosa Horii',
      filterLocation: 'Bakka',
      minPrice: 'Gatii Gadi-aanaa',
      maxPrice: 'Gatii Olaanaa',
      sortBy: 'Tartiiba',
      date: 'Guyyaa',
      price: 'Gatii',
      noListings: 'Tarreen hin argamne',
      startBrowsing: 'Horii naannoo keessanii qonnaan bultoota irraa argaman ilaalaa',
      cattle: 'Loon',
      goat: 'Re\'ee',
      sheep: 'Hoolaa',
      poultry: 'Lukkuu',
      birr: 'Qarshii',
      contactSeller: 'Gurgurtaa Quunnamaa',
      viewDetails: 'Bal\'ina Ilaalaa',
      verified: 'Mirkaneeffame',
      newest: 'Haaraa Jalqaba',
      oldest: 'Moofaa Jalqaba',
      lowToHigh: 'Gatii: Gadi-aanaa gara Olaanaatti',
      highToLow: 'Gatii: Olaanaa gara Gadi-aanaatti'
    },
    sw: {
      title: 'Soko la Umma',
      subtitle: 'Tazama na ugundua wanyama wanaoouzwa kutoka kwa wauzaji walioidhinishwa',
      search: 'Tafuta orodha...',
      filterType: 'Aina ya Mnyama',
      filterLocation: 'Eneo',
      minPrice: 'Bei ya Chini',
      maxPrice: 'Bei ya Juu',
      sortBy: 'Panga kwa',
      date: 'Tarehe',
      price: 'Bei',
      noListings: 'Hakuna orodha zilizopatikana',
      startBrowsing: 'Tazama wanyama wanaopatikana kutoka kwa wakulima katika eneo lako',
      cattle: 'Ng\'ombe',
      goat: 'Mbuzi',
      sheep: 'Kondoo',
      poultry: 'Kuku',
      birr: 'Birr',
      contactSeller: 'Wasiliana na Muuzaji',
      viewDetails: 'Ona Maelezo',
      verified: 'Imethibitishwa',
      newest: 'Mpya Kwanza',
      oldest: 'Za Zamani Kwanza',
      lowToHigh: 'Bei: Chini hadi Juu',
      highToLow: 'Bei: Juu hadi Chini'
    }
  };

  const t = translations[language];

  const getAnimalTypeIcon = (type: string) => {
    return '🐄'; // Default icon - can be enhanced
  };

  const MarketListingCard = ({ listing }: { listing: any }) => (
    <Card className="mb-4 hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-0">
        {/* Optimized image with lazy loading */}
        <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg flex items-center justify-center overflow-hidden">
          {listing.photos && listing.photos.length > 0 ? (
            <OptimizedImage
              src={listing.photos[0]}
              alt={listing.title}
              width={400}
              height={300}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-4xl">{getAnimalTypeIcon(listing.animal_type)}</span>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {listing.title}
            </h3>
            {listing.is_vet_verified && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <Verified className="w-3 h-3 mr-1" />
                {t.verified}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            {listing.animal_type && (
              <span className="flex items-center capitalize">
                {listing.animal_type}
              </span>
            )}
            {listing.location && (
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {listing.location}
              </span>
            )}
          </div>
          
          {listing.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {listing.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xl font-bold text-green-600">
                {listing.price?.toLocaleString()} {t.birr}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                {t.contactSeller}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-16 sm:pb-20 lg:pb-24">
        <EnhancedHeader />
        <OfflineIndicator language={language} />
        <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>
          <ListSkeleton count={6} />
        </main>
        <BottomNavigation language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filters Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select
              value={typeFilter || 'all'}
              onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.filterType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.filterType}</SelectItem>
                <SelectItem value="cattle">{t.cattle}</SelectItem>
                <SelectItem value="goat">{t.goat}</SelectItem>
                <SelectItem value="sheep">{t.sheep}</SelectItem>
                <SelectItem value="poultry">{t.poultry}</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder={t.minPrice}
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            
            <Input
              placeholder={t.maxPrice}
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            
            <Input
              placeholder={t.filterLocation}
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            
            <Select value={sortBy} onValueChange={(value: 'date' | 'price') => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t.sortBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{t.date}</SelectItem>
                <SelectItem value="price">{t.price}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">{sortBy === 'date' ? t.newest : t.highToLow}</SelectItem>
                <SelectItem value="asc">{sortBy === 'date' ? t.oldest : t.lowToHigh}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Listings Grid */}
        {isEmpty ? (
          <EmptyState
            title={t.noListings}
            description={t.startBrowsing}
            icon={<ShoppingCart className="w-10 h-10 text-gray-400" />}
            action={
              user && (
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your Animal
                </Button>
              )
            }
          />
        ) : (
          <InfiniteScrollContainer
            onLoadMore={fetchNextPage}
            hasMore={hasNextPage}
            isLoading={isFetchingNextPage}
            isOffline={isOffline}
            loadingMessage="Loading more listings..."
            endMessage={`All ${totalCount} listings loaded`}
            offlineMessage="Offline - showing cached listings"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <MarketListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </InfiniteScrollContainer>
        )}
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default PublicMarketplaceEnhanced;
