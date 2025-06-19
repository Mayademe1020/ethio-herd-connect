
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarketListingForm } from '@/components/MarketListingForm';
import { MarketListingCard } from '@/components/MarketListingCard';
import { MarketListingDetails } from '@/components/MarketListingDetails';
import { Plus, Search, Filter, MapPin, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

const Market = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState('');
  
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
      setListings(data || []);
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
    const matchesLocation = !locationFilter || listing.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  // Get unique locations for filter
  const uniqueLocations = [...new Set(listings.map(listing => listing.location))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="text-center">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            className="h-24 flex flex-col space-y-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-8 h-8" />
            <span className="text-lg font-medium">
              {language === 'am' ? 'ለሽያጭ ያስቀምጡ' : 'List for Sale'}
            </span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col space-y-2 border-emerald-200 hover:bg-emerald-50"
            onClick={() => document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Search className="w-8 h-8" />
            <span className="text-lg font-medium">
              {language === 'am' ? 'እንስሳት ይፈልጉ' : 'Browse Animals'}
            </span>
          </Button>
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
                <SelectItem value="">
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

        {/* Market Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-green-600">{listings.length}</div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'ጠቅላላ ዝርዝሮች' : 'Total Listings'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-blue-600">
              {listings.filter(l => l.is_vet_verified).length}
            </div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'ዶክተር ማረጋገጫ' : 'Vet Verified'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-purple-600">
              {uniqueLocations.length}
            </div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'አካባቢዎች' : 'Locations'}
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-2xl font-bold text-orange-600">
              {listings.length > 0 ? Math.round(listings.reduce((acc, l) => acc + l.price, 0) / listings.length) : 0}
            </div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'አማካኝ ዋጋ' : 'Avg Price'}
            </p>
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
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {language === 'am' ? 'የመጀመሪያው ዝርዝር ይፍጠሩ' : 'Create First Listing'}
              </Button>
            </div>
          )}
        </div>
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
