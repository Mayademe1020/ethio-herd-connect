import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FarmSetupForm } from '@/components/FarmSetupForm';
import { User, Settings, Phone, MapPin, Calendar, Award, Home, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const [language, setLanguage] = useState<'am' | 'en'>('am');
  const [showFarmSetup, setShowFarmSetup] = useState(false);
  const [farmProfile, setFarmProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalAnimals: 0,
    totalVaccinations: 0,
    totalListings: 0,
    memberSince: ''
  });
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch farm profile
      const { data: farmData, error: farmError } = await supabase
        .from('farm_profiles')
        .select('*')
        .single();

      if (farmError && farmError.code !== 'PGRST116') throw farmError;
      setFarmProfile(farmData);

      // Fetch statistics
      const [animalsRes, healthRes, marketRes, userRes] = await Promise.all([
        supabase.from('animals').select('id', { count: 'exact' }),
        supabase.from('health_records').select('id', { count: 'exact' }),
        supabase.from('market_listings').select('id', { count: 'exact' }),
        supabase.auth.getUser()
      ]);

      setStats({
        totalAnimals: animalsRes.count || 0,
        totalVaccinations: healthRes.count || 0,
        totalListings: marketRes.count || 0,
        memberSince: userRes.data.user?.created_at || new Date().toISOString()
      });

    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: language === 'am' ? 'ስህተት' : 'Error',
        description: language === 'am' ? 'መረጃ ማ Mamጣት አልተሳካም' : 'Failed to fetch profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center">
                {farmProfile ? (
                  <Home className="w-8 h-8 text-white" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">
                  {farmProfile?.owner_name || (language === 'am' ? 'የገበሬ ስም' : 'Farmer Name')}
                </h2>
                <p className="text-gray-600">
                  {farmProfile?.farm_name || (language === 'am' ? 'ከብት እና ዶሮ አርቢ' : 'Cattle & Poultry Farmer')}
                </p>
                {farmProfile?.farm_prefix && (
                  <p className="text-sm text-green-600 font-mono">
                    {language === 'am' ? 'እ/ኮድ:' : 'Code:'} {farmProfile.farm_prefix}-XXX-XXX
                  </p>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFarmSetup(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Farm Information */}
        {farmProfile ? (
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="w-5 h-5 text-green-600" />
                <span>{language === 'am' ? 'የእርሻ መረጃ' : 'Farm Information'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Home className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'am' ? 'የእርሻ ስም' : 'Farm Name'}
                  </p>
                  <p className="font-medium">{farmProfile.farm_name}</p>
                </div>
              </div>
              
              {farmProfile.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === 'am' ? 'ስልክ' : 'Phone'}
                    </p>
                    <p className="font-medium">{farmProfile.phone}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'am' ? 'አካባቢ' : 'Location'}
                  </p>
                  <p className="font-medium">{farmProfile.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">
                    {language === 'am' ? 'የእርሻ መፈጠር' : 'Farm Created'}
                  </p>
                  <p className="font-medium">{formatDate(farmProfile.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <Home className="w-12 h-12 mx-auto mb-3 text-yellow-600" />
              <h3 className="font-semibold text-gray-800 mb-2">
                {language === 'am' ? 'የእርሻ መረጃ ያስፈልጋል' : 'Farm Profile Required'}
              </h3>
              <p className="text-gray-600 mb-4">
                {language === 'am' 
                  ? 'የእንስሳ ኮዶች ለማመንጨት የእርሻ መረጃ ያስቀምጡ'
                  : 'Set up your farm profile to generate animal codes'
                }
              </p>
              <Button 
                onClick={() => setShowFarmSetup(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Home className="w-4 h-4 mr-2" />
                {language === 'am' ? 'እርሻ ያስተማሩ' : 'Setup Farm'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Farm Statistics */}
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              {language === 'am' ? 'የእርሻ ስታትስቲክስ' : 'Farm Statistics'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.totalAnimals}</div>
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'ጠቅላላ እንስሳት' : 'Total Animals'}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalVaccinations}</div>
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'ክትባቶች' : 'Vaccinations'}
                </p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{stats.totalListings}</div>
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'ሽያጮች' : 'Listings'}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.floor((Date.now() - new Date(stats.memberSince).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <p className="text-sm text-gray-600">
                  {language === 'am' ? 'ቀናት' : 'Days'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              {language === 'am' ? 'ቅንብሮች' : 'Quick Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowFarmSetup(true)}
            >
              <Home className="w-4 h-4 mr-2" />
              {language === 'am' ? 'የእርሻ መረጃ ያርትዑ' : 'Edit Farm Profile'}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              {language === 'am' ? 'የመተግበሪያ ቅንብሮች' : 'App Settings'}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Award className="w-4 h-4 mr-2" />
              {language === 'am' ? 'እርዳታ እና ድጋፍ' : 'Help & Support'}
            </Button>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation language={language} />

      {/* Farm Setup Form Modal */}
      {showFarmSetup && (
        <FarmSetupForm
          language={language}
          onClose={() => setShowFarmSetup(false)}
          onSuccess={fetchProfileData}
        />
      )}
    </div>
  );
};

export default Profile;
