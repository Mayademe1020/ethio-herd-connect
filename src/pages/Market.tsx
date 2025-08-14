
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSecureMarketListing } from '@/hooks/useSecureMarketListing';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { MarketListingForm } from '@/components/MarketListingForm';
import { MarketListingCard } from '@/components/MarketListingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Plus, 
  Search,
  Shield,
  TrendingUp,
  Eye,
  Users,
  Package
} from 'lucide-react';

const Market = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { createListing, updateListingStatus, loading } = useSecureMarketListing();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');

  const translations = {
    am: {
      title: 'ደህንነቱ የተጠበቀ ገበያ',
      subtitle: 'ምርቶችን በደህንነት ይግዙ እና ይሽጡ',
      browse: 'አስሱ',
      myListings: 'የእኔ ዝርዝሮች',
      create: 'ይፍጠሩ',
      search: 'ፈልግ...',
      createListing: 'አዲስ ዝርዝር ይፍጠሩ',
      secureTransactions: 'ደህንነቱ የተጠበቀ ግብይቶች',
      verifiedSellers: 'የተረጋገጡ ሻጮች',
      protectedData: 'የተጠበቀ መረጃ',
      totalListings: 'ጠቅላላ ዝርዝሮች',
      activeListings: 'ንቁ ዝርዝሮች',
      views: 'እይታዎች',
      loginRequired: 'በመጀመሪያ ይግቡ'
    },
    en: {
      title: 'Secure Market',
      subtitle: 'Buy and sell products securely',
      browse: 'Browse',
      myListings: 'My Listings',
      create: 'Create',
      search: 'Search...',
      createListing: 'Create New Listing',
      secureTransactions: 'Secure Transactions',
      verifiedSellers: 'Verified Sellers',
      protectedData: 'Protected Data',
      totalListings: 'Total Listings',
      activeListings: 'Active Listings',
      views: 'Views',
      loginRequired: 'Please log in first'
    },
    or: {
      title: 'Gabaa Nageenya',
      subtitle: 'Oomisha nageenya qaban bituu fi gurguruu',
      browse: 'Sakatta\'uu',
      myListings: 'Tarreewwan Koo',
      create: 'Uumuu',
      search: 'Barbaadi...',
      createListing: 'Tarree Haaraa Uumuu',
      secureTransactions: 'Dal\'daltoota Nageenya',
      verifiedSellers: 'Gurgurttoota Mirkaneeffaman',
      protectedData: 'Daataa Eegame',
      totalListings: 'Tarreewwan Waliigalaa',
      activeListings: 'Tarreewwan Sochii',
      views: 'Mul\'atoota',
      loginRequired: 'Duraan seeni'
    },
    sw: {
      title: 'Soko Salama',
      subtitle: 'Nunua na uza bidhaa kwa usalama',
      browse: 'Tafuta',
      myListings: 'Orodha Zangu',
      create: 'Unda',
      search: 'Tafuta...',
      createListing: 'Unda Orodha Mpya',
      secureTransactions: 'Miamala Salama',
      verifiedSellers: 'Wauza Waliothibitishwa',
      protectedData: 'Data Iliyolindwa',
      totalListings: 'Orodha Zote',
      activeListings: 'Orodha Zinazofanya Kazi',
      views: 'Mionero',
      loginRequired: 'Tafadhali ingia kwanza'
    }
  };

  const t = translations[language];

  // Mock data for demonstration - replace with real data from API
  const marketStats = {
    totalListings: 156,
    activeListings: 89,
    verifiedSellers: 23,
    totalViews: 1247
  };

  const handleCreateListing = async (listingData: any) => {
    const result = await createListing(listingData);
    if (!result.error) {
      setShowCreateForm(false);
      setActiveTab('myListings');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 pb-16 sm:pb-20 lg:pb-24">
        <EnhancedHeader />
        <OfflineIndicator language={language} />

        <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{t.loginRequired}</h2>
            <p className="text-gray-500">{t.subtitle}</p>
          </div>
        </main>

        <BottomNavigation language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />

      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Page Title */}
        <div className="text-center px-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-green-600" />
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800">
              {t.title}
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base mb-3">
            {t.subtitle}
          </p>
          
          {/* Security Features */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="outline" className="text-green-700 border-green-300">
              <Shield className="w-3 h-3 mr-1" />
              {t.secureTransactions}
            </Badge>
            <Badge variant="outline" className="text-blue-700 border-blue-300">
              <Users className="w-3 h-3 mr-1" />
              {t.verifiedSellers}
            </Badge>
            <Badge variant="outline" className="text-purple-700 border-purple-300">
              <Package className="w-3 h-3 mr-1" />
              {t.protectedData}
            </Badge>
          </div>
        </div>

        {/* Market Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t.totalListings}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{marketStats.totalListings}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t.activeListings}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{marketStats.activeListings}</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t.verifiedSellers}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">{marketStats.verifiedSellers}</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t.views}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">{marketStats.totalViews}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse" className="text-xs sm:text-sm">
              <ShoppingCart className="w-4 h-4 mr-1" />
              {t.browse}
            </TabsTrigger>
            <TabsTrigger value="myListings" className="text-xs sm:text-sm">
              <Package className="w-4 h-4 mr-1" />
              {t.myListings}
            </TabsTrigger>
            <TabsTrigger value="create" className="text-xs sm:text-sm">
              <Plus className="w-4 h-4 mr-1" />
              {t.create}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Browse Content */}
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Browse secure marketplace listings</p>
            </div>
          </TabsContent>

          <TabsContent value="myListings" className="space-y-4">
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Your secure listings will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {t.createListing}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MarketListingForm
                  onSubmit={handleCreateListing}
                  loading={loading}
                  language={language}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Market;
