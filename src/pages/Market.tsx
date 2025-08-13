
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, List, Filter, ShoppingCart, TrendingUp, DollarSign, User } from 'lucide-react';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InteractiveSummaryCard } from '@/components/InteractiveSummaryCard';
import { MarketListingCard } from '@/components/MarketListingCard';
import { PublicMarketListingCard } from '@/components/PublicMarketListingCard';
import { MarketListingForm } from '@/components/MarketListingForm';
import { MarketListingDetails } from '@/components/MarketListingDetails';
import { AdvancedSearchFilters } from '@/components/AdvancedSearchFilters';
import { InterestExpressionDialog } from '@/components/InterestExpressionDialog';
import { AuthGateModal } from '@/components/AuthGateModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePublicMarketplace } from '@/hooks/usePublicMarketplace';
import { useViewTracking } from '@/hooks/useViewTracking';
import { useNavigate } from 'react-router-dom';

const Market = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { listings, loading } = usePublicMarketplace();
  const { trackView, viewCount, shouldShowAuthGate } = useViewTracking();
  
  const [viewMode, setViewMode] = useState<'browse' | 'myListings'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [filterCount, setFilterCount] = useState(0);
  const [showListingForm, setShowListingForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showInterestDialog, setShowInterestDialog] = useState(false);
  const [interestListing, setInterestListing] = useState<any>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);

  const handleContact = (listing: any) => {
    if (!user) {
      setShowAuthGate(true);
      return;
    }
    setInterestListing(listing);
    setShowInterestDialog(true);
  };

  const handleFavorite = (listing: any) => {
    if (!user) {
      setShowAuthGate(true);
      return;
    }
    alert(`Added ${listing.title} to favorites`);
  };

  const handleListingClick = (listing: any) => {
    if (!user && shouldShowAuthGate()) {
      setShowAuthGate(true);
      return;
    }
    
    trackView(listing.id);
    setSelectedListing(listing);
  };

  const handleLoginPrompt = () => {
    setShowAuthGate(true);
  };

  const handleLogin = () => {
    setShowAuthGate(false);
    navigate('/auth');
  };

  const handleListingSubmit = (listing: any) => {
    alert(`Listing submitted: ${listing.title}`);
    setShowListingForm(false);
  };

  const handleEditListing = (listing: any) => {
    alert(`Editing listing: ${listing.title}`);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    const activeFilters = Object.values(newFilters).filter(value => 
      value && value !== 'all' && value !== ''
    ).length;
    setFilterCount(activeFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setFilterCount(0);
  };

  const filteredListings = listings.filter((listing) => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const categoryMatch = selectedCategory === 'all' || true; // For now, show all
    const searchTermMatch = searchRegex.test(listing.title) || 
                           (listing.description && searchRegex.test(listing.description));
    return categoryMatch && searchTermMatch;
  });

  const translations = {
    am: {
      title: 'የገበያ ቦታ',
      subtitle: 'እንስሳዎችን ይግዙ እና ይሽጡ',
      sell: 'ይሽጡ',
      buy: 'ይግዙ',
      myListings: 'የእኔ ዝርዝሮች',
      browse: 'ያስሱ',
      filter: 'ማጣሪያ',
      search: 'ይፈልጉ',
      allCategories: 'ሁሉም ምድቦች',
      loginRequired: 'ለመሸጥ ይግቡ'
    },
    en: {
      title: 'Marketplace',
      subtitle: 'Buy and sell animals',
      sell: 'Sell',
      buy: 'Buy',
      myListings: 'My Listings',
      browse: 'Browse',
      filter: 'Filter',
      search: 'Search',
      allCategories: 'All Categories',
      loginRequired: 'Log in to sell'
    },
    or: {
      title: 'Gabaa',
      subtitle: 'Horii gurgurii fi bituu',
      sell: 'Gurguri',
      buy: 'Biti',
      myListings: 'Tarree Koo',
      browse: 'Sakatta\'i',
      filter: 'Calaqqisiisi',
      search: 'Barbaadi',
      allCategories: 'Akaakuu Hundaa',
      loginRequired: 'Gurguruuf seeni'
    },
    sw: {
      title: 'Soko',
      subtitle: 'Nunua na uza wanyama',
      sell: 'Uza',
      buy: 'Nunua',
      myListings: 'Orodha Zangu',
      browse: 'Vinjari',
      filter: 'Chuja',
      search: 'Tafuta',
      allCategories: 'Kategoria Zote',
      loginRequired: 'Ingia kuuza'
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Page Title */}
        <div className="text-center px-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            🛒 {t.title}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Button 
            onClick={() => user ? setShowListingForm(true) : setShowAuthGate(true)}
            className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 bg-orange-600 hover:bg-orange-700 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
            disabled={!user}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            <span className="font-medium text-center leading-tight">
              {user ? t.sell : t.loginRequired}
            </span>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => setViewMode('browse')}
            className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 border-green-200 hover:bg-green-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-500" />
            <span className="font-medium text-center leading-tight">
              {t.browse}
            </span>
          </Button>
          
          {user && (
            <Button 
              variant="outline" 
              onClick={() => setViewMode('myListings')}
              className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-500" />
              <span className="font-medium text-center leading-tight">
                {t.myListings}
              </span>
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 sm:h-14 lg:h-16 flex flex-col space-y-1 border-purple-200 hover:bg-purple-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-500" />
            <span className="font-medium text-center leading-tight">
              {t.filter}
            </span>
          </Button>
        </div>

        {/* Market Stats - Only show if authenticated */}
        {user && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            <InteractiveSummaryCard
              title="Active Listings"
              titleAm="ንቁ ዝርዝሮች"
              titleOr="Tarreewwan Ka\'aan"
              titleSw="Orodha Zinazofanya Kazi"
              value={listings.length}
              icon={<ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
              color="orange"
              language={language}
            />
            
            <InteractiveSummaryCard
              title="Sold This Week"
              titleAm="በዚህ ሳምንት የተሸጡ"
              titleOr="Torban Kana Gurguraman"
              titleSw="Ziliouzwa Wiki Hii"
              value={12}
              icon={<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
              color="green"
              language={language}
            />

            <InteractiveSummaryCard
              title="Average Price"
              titleAm="አማካይ ዋጋ"
              titleOr="Gatii Giddugaleessa"
              titleSw="Bei ya Wastani"
              value="15,000 ETB"
              icon={<DollarSign className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
              color="blue"
              language={language}
            />

            <InteractiveSummaryCard
              title="My Sales"
              titleAm="የእኔ ሽያጭ"
              titleOr="Gurgurtaa Koo"
              titleSw="Mauzo Yangu"
              value="5"
              icon={<User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
              color="purple"
              language={language}
            />
          </div>
        )}

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex-1">
            <Input
              placeholder={
                language === 'am' ? 'እንስሳዎችን ይፈልጉ...' :
                language === 'or' ? 'Horii barbaadi...' :
                language === 'sw' ? 'Tafuta wanyama...' :
                'Search animals...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 sm:h-9 lg:h-10 text-xs sm:text-sm"
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32 sm:w-40 h-8 sm:h-9 lg:h-10 text-xs sm:text-sm">
                <SelectValue placeholder={t.allCategories} />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                <SelectItem value="all">{t.allCategories}</SelectItem>
                <SelectItem value="cattle">🐄 {language === 'am' ? 'ከብት' : language === 'or' ? 'Loon' : language === 'sw' ? 'Ng\'ombe' : 'Cattle'}</SelectItem>
                <SelectItem value="goat">🐐 {language === 'am' ? 'ፍየል' : language === 'or' ? 'Re\'ee' : language === 'sw' ? 'Mbuzi' : 'Goat'}</SelectItem>
                <SelectItem value="sheep">🐑 {language === 'am' ? 'በግ' : language === 'or' ? 'Hoolaa' : language === 'sw' ? 'Kondoo' : 'Sheep'}</SelectItem>
                <SelectItem value="poultry">🐔 {language === 'am' ? 'ዶሮ' : language === 'or' ? 'Lukku' : language === 'sw' ? 'Kuku' : 'Poultry'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <AdvancedSearchFilters
            language={language}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            filterCount={filterCount}
            resultCount={filteredListings.length}
            context="market"
          />
        )}

        {/* Market Listings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredListings.map((listing) => (
            <PublicMarketListingCard
              key={listing.id}
              listing={listing}
              language={language}
              isAuthenticated={!!user}
              onLoginPrompt={handleLoginPrompt}
              onViewDetails={() => handleListingClick(listing)}
            />
          ))}
        </div>

        {/* No Listings Found */}
        {filteredListings.length === 0 && !loading && (
          <Card className="text-center py-8 sm:py-12 mx-2 sm:mx-0">
            <CardContent className="px-3 sm:px-6">
              <div className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">
                {language === 'am' ? 'ምንም ዝርዝር አልተገኘም' :
                 language === 'or' ? 'Tarreen tokkollee hin argamne' :
                 language === 'sw' ? 'Hakuna orodha iliyopatikana' :
                 'No listings found'}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation language={language} />

      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        onLogin={handleLogin}
        viewCount={viewCount}
        language={language}
      />

      {/* Listing Form - Only for authenticated users */}
      {user && showListingForm && (
        <MarketListingForm
          language={language}
          onClose={() => setShowListingForm(false)}
          onSubmit={handleListingSubmit}
        />
      )}

      {/* Listing Details */}
      {selectedListing && (
        <MarketListingDetails
          listing={selectedListing}
          language={language}
          onClose={() => setSelectedListing(null)}
          onContact={handleContact}
          onEdit={handleEditListing}
        />
      )}

      {/* Interest Expression Dialog */}
      {user && interestListing && (
        <InterestExpressionDialog
          isOpen={showInterestDialog}
          onClose={() => {
            setShowInterestDialog(false);
            setInterestListing(null);
          }}
          listing={interestListing}
          language={language}
        />
      )}
    </div>
  );
};

export default Market;
