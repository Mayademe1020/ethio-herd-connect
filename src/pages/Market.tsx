import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketListingForm } from '@/components/MarketListingForm';
import { MarketListingCard } from '@/components/MarketListingCard';
import { MarketListingDetails } from '@/components/MarketListingDetails';
import { InteractiveSummaryCard } from '@/components/InteractiveSummaryCard';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Plus, Search, Filter, MapPin, Phone, MessageSquare, ShoppingCart, CheckCircle, DollarSign, Users, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface MarketListing {
  id: string;
  title: string;
  description?: string;
  price: number;
  weight?: number;
  age?: number;
  location: string;
  contact_method: 'phone' | 'telegram' | 'sms';
  contact_value: string;
  is_vet_verified: boolean;
  photos: string[];
  created_at: string;
  system_verified?: boolean;
  vaccination_history?: boolean;
  pregnancy_status?: boolean;
  production_history?: boolean;
}

const Market = () => {
  const { language } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('livestock');
  
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('market_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Ensure contact_method is properly typed
      const typedListings: MarketListing[] = (data || []).map(listing => ({
        ...listing,
        contact_method: listing.contact_method as 'phone' | 'telegram' | 'sms',
        photos: listing.photos || []
      }));
      
      setListings(typedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'ዝርዝሮችን ማምጣት አልተሳካም' : 'Failed to fetch listings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (contactMethod: string, contactValue: string) => {
    let contactUrl = '';
    
    switch (contactMethod) {
      case 'telegram':
        contactUrl = `https://t.me/${contactValue.replace('@', '')}`;
        break;
      case 'sms':
        contactUrl = `sms:${contactValue}`;
        break;
      case 'phone':
      default:
        contactUrl = `tel:${contactValue}`;
        break;
    }
    
    window.open(contactUrl, '_blank');
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === 'all' || listing.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  // Get unique locations for filter
  const uniqueLocations = [...new Set(listings.map(listing => listing.location))];

  const marketStats = {
    totalListings: listings.length,
    vetVerified: listings.filter(l => l.is_vet_verified).length,
    totalLocations: uniqueLocations.length,
    averagePrice: listings.length > 0 ? Math.round(listings.reduce((acc, l) => acc + l.price, 0) / listings.length) : 0,
    activeListings: listings.length,
    recentListings: listings.filter(l => {
      const daysSinceCreated = Math.floor((Date.now() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceCreated <= 7;
    }).length
  };

  const TabContent = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-6">
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <EnhancedHeader />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Title with Cancel Button */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {language === 'am' ? 'የእንስሳት ገበያ' : 'Livestock Market'}
            </h1>
            <p className="text-gray-600">
              {language === 'am' 
                ? 'እንስሳትዎን ይሽጡ ወይም ይግዙ'
                : 'Buy or sell your livestock'
              }
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
            <span>{language === 'am' ? 'ሰርዝ' : 'Cancel'}</span>
          </Button>
        </div>

        {/* Market Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="livestock">
              {language === 'am' ? 'እንስሳት' : 'Livestock'}
            </TabsTrigger>
            <TabsTrigger value="feed">
              {language === 'am' ? 'መኖ' : 'Feed'}
            </TabsTrigger>
            <TabsTrigger value="medicine">
              {language === 'am' ? 'መድኃኒት' : 'Medicine'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="livestock">
            <TabContent>
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  className="h-24 flex flex-col space-y-2 bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 hover:scale-105 active:scale-95"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="w-8 h-8" />
                  <span className="text-lg font-medium">
                    {language === 'am' ? 'ለሽያጭ ያስቀምጡ' : 'List for Sale'}
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-24 flex flex-col space-y-2 border-emerald-200 hover:bg-emerald-50 transition-all duration-300 hover:scale-105 active:scale-95"
                  onClick={() => document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Search className="w-8 h-8" />
                  <span className="text-lg font-medium">
                    {language === 'am' ? 'እንስሳት ይፈልጉ' : 'Browse Animals'}
                  </span>
                </Button>
              </div>

              {/* Interactive Market Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
                <InteractiveSummaryCard
                  title="Total Listings"
                  titleAm="ጠቅላላ ዝርዝሮች"
                  value={marketStats.totalListings}
                  icon={<ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="green"
                  onClick={() => {}}
                />
                
                <InteractiveSummaryCard
                  title="Vet Verified"
                  titleAm="ዶክተር ማረጋገጫ"
                  value={marketStats.vetVerified}
                  icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="blue"
                  onClick={() => {}}
                />
                
                <InteractiveSummaryCard
                  title="Locations"
                  titleAm="አካባቢዎች"
                  value={marketStats.totalLocations}
                  icon={<MapPin className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="purple"
                  onClick={() => {}}
                />
                
                <InteractiveSummaryCard
                  title="Avg Price"
                  titleAm="አማካኝ ዋጋ"
                  value={marketStats.averagePrice}
                  icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="orange"
                  currency={true}
                  onClick={() => {}}
                />
                
                <InteractiveSummaryCard
                  title="Active"
                  titleAm="ንቁ"
                  value={marketStats.activeListings}
                  icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="emerald"
                  onClick={() => {}}
                />
                
                <InteractiveSummaryCard
                  title="Recent"
                  titleAm="አዲስ"
                  value={marketStats.recentListings}
                  icon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                  color="teal"
                  onClick={() => {}}
                />
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 space-y-4" id="listings-section">
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-gray-400" />
                  <Input
                    placeholder={language === 'am' ? 'እንስሳት ይፈልጉ...' : 'Search animals...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={language === 'am' ? 'አካባቢ' : 'Location'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {language === 'am' ? 'ሁሉም አካባቢዎች' : 'All Locations'}
                      </SelectItem>
                      {uniqueLocations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Listings Grid */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {language === 'am' ? 'የእንስሳት ዝርዝሮች' : 'Animal Listings'}
                  {filteredListings.length > 0 && (
                    <span className="text-gray-500 font-normal ml-2">
                      ({filteredListings.length} {language === 'am' ? 'ውጤቶች' : 'results'})
                    </span>
                  )}
                </h2>
                
                {loading ? (
                  // ... keep existing code (loading skeleton)
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-green-100 animate-pulse">
                        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredListings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredListings.map((listing) => (
                      <MarketListingCard
                        key={listing.id}
                        listing={listing}
                        language={language}
                        onContact={handleContact}
                        onViewDetails={setSelectedListing}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      {language === 'am' ? 'ምንም ዝርዝር አልተገኘም' : 'No listings found'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {language === 'am' 
                        ? 'የተለያዩ ቃላት ይሞክሩ ወይም ማጣሪያዎቹን ይለውጡ'
                        : 'Try different search terms or adjust your filters'
                      }
                    </p>
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {language === 'am' ? 'የመጀመሪያው ዝርዝር ይፍጠሩ' : 'Create First Listing'}
                    </Button>
                  </div>
                )}
              </div>
            </TabContent>
          </TabsContent>

          <TabsContent value="feed">
            <TabContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🌾</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {language === 'am' ? 'የመኖ ገበያ' : 'Feed Market'}
                </h3>
                <p className="text-gray-500">
                  {language === 'am' ? 'በቅርቡ ይመጣል' : 'Coming Soon'}
                </p>
              </div>
            </TabContent>
          </TabsContent>

          <TabsContent value="medicine">
            <TabContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💊</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {language === 'am' ? 'የመድኃኒት ገበያ' : 'Medicine Market'}
                </h3>
                <p className="text-gray-500">
                  {language === 'am' ? 'በቅርቡ ይመጣል' : 'Coming Soon'}
                </p>
              </div>
            </TabContent>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation language={language} />

      {/* Create Listing Form Modal */}
      {showCreateForm && (
        <MarketListingForm
          language={language}
          onClose={() => setShowCreateForm(false)}
          onSuccess={fetchListings}
        />
      )}

      {/* Listing Details Modal */}
      {selectedListing && (
        <MarketListingDetails
          listing={selectedListing}
          language={language}
          onClose={() => setSelectedListing(null)}
          onContact={handleContact}
        />
      )}
    </div>
  );
};

export default Market;
