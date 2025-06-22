import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Camera,
  Settings,
  Globe,
  Bell,
  Palette,
  Download,
  Upload,
  Shield,
  LogOut,
  Edit,
  Users,
  Syringe,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { InteractiveSummaryCard } from '@/components/InteractiveSummaryCard';
import { FarmSetupForm } from '@/components/FarmSetupForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { language, setLanguage } = useLanguage();
  const [showEditForm, setShowEditForm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [farmStats, setFarmStats] = useState({
    totalAnimals: 0,
    totalVaccinations: 0,
    growthRecords: 0,
    marketSales: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchFarmStats();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchFarmStats = async () => {
    // Mock data for farm statistics
    setFarmStats({
      totalAnimals: 24,
      totalVaccinations: 12,
      growthRecords: 48,
      marketSales: 8
    });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const translations = {
    am: {
      title: 'የእኔ መግለጫ',
      subtitle: 'የእርሻ መረጃ እና ቅንብሮች',
      editProfile: 'መግለጫ ይቀይሩ',
      farmInfo: 'የእርሻ መረጃ',
      personalInfo: 'የግል መረጃ',
      settings: 'ቅንብሮች',
      security: 'ደህንነት',
      notifications: 'ማሳወቂያዎች',
      language: 'ቋንቋ',
      theme: 'ገጽታ',
      backup: 'የመረጃ ምትኬ',
      export: 'ውጤት'
    },
    en: {
      title: 'My Profile',
      subtitle: 'Farm information and settings',
      editProfile: 'Edit Profile',
      farmInfo: 'Farm Information',
      personalInfo: 'Personal Information',
      settings: 'Settings',
      security: 'Security',
      notifications: 'Notifications',
      language: 'Language',
      theme: 'Theme',
      backup: 'Data Backup',
      export: 'Export'
    },
    or: {
      title: 'Ibsa Koo',
      subtitle: 'Odeeffannoo qonna fi qindaa\'ina',
      editProfile: 'Ibsa Jijjiiri',
      farmInfo: 'Odeeffannoo Qonnaa',
      personalInfo: 'Odeeffannoo Dhuunfaa',
      settings: 'Qindaa\'ina',
      security: 'Nageenya',
      notifications: 'Beeksisa',
      language: 'Afaan',
      theme: 'Bifaa',
      backup: 'Deebi\'uu Daataa',
      export: 'Baasuu'
    },
    sw: {
      title: 'Wasifu Wangu',
      subtitle: 'Habari za shamba na mipangilio',
      editProfile: 'Hariri Wasifu',
      farmInfo: 'Habari za Shamba',
      personalInfo: 'Habari za Kibinafsi',
      settings: 'Mipangilio',
      security: 'Usalama',
      notifications: 'Arifa',
      language: 'Lugha',
      theme: 'Mandhari',
      backup: 'Nakala Rudufu ya Data',
      export: 'Hamisha'
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />
      
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Page Title */}
        <div className="text-center px-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            👤 {t.title}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* Profile Header */}
        <Card className="border-purple-100">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                </div>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0"
                >
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{user?.email}</h2>
                <p className="text-sm sm:text-base text-gray-600">{t.farmInfo}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2 sm:mt-3">
                  <Badge variant="secondary" className="text-xs">
                    {language === 'am' ? 'ተመዝግቧል' : 
                     language === 'or' ? 'Galmeeffame' :
                     language === 'sw' ? 'Amesajiliwa' :
                     'Registered'}: 2023
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {language === 'am' ? 'እንስሳት' : 
                     language === 'or' ? 'Horii'  :
                     language === 'sw' ? 'Wanyama' :
                     'Animals'}: 24
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => setShowEditForm(true)}
                className="bg-purple-600 hover:bg-purple-700 h-8 sm:h-9 lg:h-10 text-xs sm:text-sm px-3 sm:px-4"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {t.editProfile}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <InteractiveSummaryCard
            title="Total Animals"
            titleAm="ጠቅላላ እንስሳት"
            titleOr="Horii Hundaa"
            titleSw="Jumla ya Wanyama"
            value={farmStats.totalAnimals}
            icon={<Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            color="blue"
            language={language}
          />
          
          <InteractiveSummaryCard
            title="Vaccinations"
            titleAm="ክትባቶች"
            titleOr="Walaloo"
            titleSw="Chanjo"
            value={farmStats.totalVaccinations}
            icon={<Syringe className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            color="green"
            language={language}
          />

          <InteractiveSummaryCard
            title="Growth Records"
            titleAm="የእድገት መዝገቦች"
            titleOr="Galmee Guddina"
            titleSw="Rekodi za Ukuaji"
            value={farmStats.growthRecords}
            icon={<TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            color="purple"
            language={language}
          />

          <InteractiveSummaryCard
            title="Market Sales"
            titleAm="የገበያ ሽያጭ"
            titleOr="Gurgurtaa Gabaa"
            titleSw="Mauzo ya Soko"
            value={farmStats.marketSales}
            icon={<ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
            color="orange"
            language={language}
          />
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Personal Information */}
          <Card className="border-blue-100">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 flex items-center space-x-1 sm:space-x-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span>{t.personalInfo}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  {language === 'am' ? 'ኢሜይል' : 
                   language === 'or' ? 'Imeelii' :  
                   language === 'sw' ? 'Barua pepe' :
                   'Email'}
                </label>
                <p className="text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg">
                  {user?.email}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  {language === 'am' ? 'ስልክ' : 
                   language === 'or' ? 'Bilbila' :
                   language === 'sw' ? 'Simu' :
                   'Phone'}
                </label>
                <p className="text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg">
                  +251-9XX-XXX-XXX
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  {language === 'am' ? 'አድራሻ' : 
                   language === 'or' ? 'Teessoo' :
                   language === 'sw' ? 'Anwani' :
                   'Address'}
                </label>
                <p className="text-sm sm:text-base text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg">
                  {language === 'am' ? 'አዲስ አበባ, ኢትዮጵያ' : 
                   language === 'or' ? 'Finfinnee, Itoophiyaa' :
                   language === 'sw' ? 'Addis Ababa, Ethiopia' :
                   'Addis Ababa, Ethiopia'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="border-green-100">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 flex items-center space-x-1 sm:space-x-2">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span>{t.settings}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Language Setting */}
              <div className="flex items-center justify-between p-2 sm:p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium">{t.language}</span>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-24 sm:w-32 h-7 sm:h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    <SelectItem value="am">🇪🇹 አማርኛ</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="or">🇪🇹 Oromoo</SelectItem>
                    <SelectItem value="sw">🇹🇿 Swahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notifications Setting */}
              <div className="flex items-center justify-between p-2 sm:p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium">{t.notifications}</span>
                </div>
                <Switch />
              </div>

              {/* Theme Setting */}
              <div className="flex items-center justify-between p-2 sm:p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium">{t.theme}</span>
                </div>
                <Select defaultValue="light">
                  <SelectTrigger className="w-20 sm:w-24 h-7 sm:h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    <SelectItem value="light">
                      {language === 'am' ? 'ብሩህ' : 
                       language === 'or' ? 'Ifa' :
                       language === 'sw' ? 'Mwanga' :
                       'Light'}
                    </SelectItem>
                    <SelectItem value="dark">
                      {language === 'am' ? 'ጨለማ' : 
                       language === 'or' ? 'Dukkana' :
                       language === 'sw' ? 'Giza' :
                       'Dark'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Button 
            variant="outline" 
            className="h-10 sm:h-12 lg:h-14 flex flex-col space-y-1 border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            <span className="font-medium text-center leading-tight">
              {t.backup}
            </span>
          </Button>

          <Button 
            variant="outline" 
            className="h-10 sm:h-12 lg:h-14 flex flex-col space-y-1 border-green-200 hover:bg-green-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            <span className="font-medium text-center leading-tight">
              {t.export}
            </span>
          </Button>

          <Button 
            variant="outline" 
            className="h-10 sm:h-12 lg:h-14 flex flex-col space-y-1 border-purple-200 hover:bg-purple-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            <span className="font-medium text-center leading-tight">
              {t.security}
            </span>
          </Button>

          <Button 
            variant="outline" 
            className="h-10 sm:h-12 lg:h-14 flex flex-col space-y-1 border-red-200 hover:bg-red-50 transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation text-xs sm:text-sm"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            <span className="font-medium text-center leading-tight">
              {language === 'am' ? 'ይውጡ' : 
               language === 'or' ? 'Ba\'i' :
               language === 'sw' ? 'Toka' :
               'Sign Out'}
            </span>
          </Button>
        </div>
      </main>

      <BottomNavigation language={language} />

      {/* Edit Profile Form */}
      {showEditForm && (
        <FarmSetupForm
          language={language}
          onClose={() => setShowEditForm(false)}
          editMode={true}
        />
      )}
    </div>
  );
};

export default Profile;
