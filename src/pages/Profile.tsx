import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  HelpCircle,
  LogOut,
  Edit3,
  Phone,
  Mail,
  Calendar,
  Globe,
  AlertCircle,
  Camera,
  MapPin,
  Volume2,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import BottomNavigation from '@/components/BottomNavigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import AnalyticsDashboard from '@/pages/AnalyticsDashboard';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { LogoutConfirmDialog } from '@/components/LogoutConfirmDialog';
import { FarmStatsCard } from '@/components/FarmStatsCard';
import { QuickActionsSection } from '@/components/QuickActionsSection';
import { EditProfileModal } from '@/components/EditProfileModal';
import { ReminderSettings } from '@/components/ReminderSettings';
import { MarketAlertPreferences } from '@/components/MarketAlertPreferences';
import { useProfile } from '@/hooks/useProfile';
import { useFarmStats } from '@/hooks/useFarmStats';
import { useAuth } from '@/contexts/AuthContextMVP';
import { supabase } from '@/integrations/supabase/client';
import { TeamManagement } from '@/components/farm/TeamManagement';

const Profile = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { calendarSystem, setCalendarSystem } = useCalendar();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [distanceThreshold, setDistanceThreshold] = useState(50);
  
  // Fetch profile and farm stats
  const { 
    profile, 
    isLoading: profileLoading, 
    error: profileError, 
    refetch: refetchProfile,
    updateProfileAsync 
  } = useProfile();
  const { stats, isLoading: statsLoading, isStale } = useFarmStats();
  const { user } = useAuth();

  const handleProfileUpdate = async (farmerName: string, farmName: string) => {
    if (!updateProfileAsync) return;
    
    // Use the mutation from the hook
    await updateProfileAsync({
      farmer_name: farmerName,
      farm_name: farmName
    });
  };

  const handleCalendarChange = async (value: string) => {
    try {
      await setCalendarSystem(value as 'gregorian' | 'ethiopian');
      toast.success(
        language === 'am' 
          ? 'የቀን መቁጠሪያ ምርጫ ተቀይሯል' 
          : 'Calendar preference updated'
      );
    } catch (error) {
      toast.error(
        language === 'am'
          ? 'የቀን መቁጠሪያ ምርጫ መቀየር አልተሳካም'
          : 'Failed to update calendar preference'
      );
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      // Clear local storage
      localStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Close dialog
      setShowLogoutDialog(false);

      // Show success message
      toast.success(
        language === 'am'
          ? 'በተሳካ ሁኔታ ወጥተዋል'
          : 'Successfully logged out'
      );

      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(
        language === 'am'
          ? 'መውጣት አልተሳካም። እባክዎ እንደገና ይሞክሩ።'
          : 'Logout failed. Please try again.'
      );
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  const translations = {
    am: {
      profile: 'መገለጫ',
      editProfile: 'መገለጫን ያርትዑ',
      accountSettings: 'የመለያ ቅንብሮች',
      security: 'ደህንነት',
      notifications: 'ማሳወቂያዎች',
      darkMode: 'ጨለማ ሁነታ',
      general: 'አጠቃላይ',
      personalInfo: 'የግል መረጃ',
      name: 'ስም',
      email: 'ኢሜይል',
      phone: 'ስልክ',
      address: 'አድራሻ',
      birthdate: 'የትውልድ ቀን',
      preferences: 'ምርጫዎች',
      language: 'ቋንቋ',
      calendarSystem: 'የቀን መቁጠሪያ ስርዓት',
      gregorianCalendar: 'ግሪጎሪያን ዘመን አቆጣጠር',
      ethiopianCalendar: 'የኢትዮጵያ ዘመን አቆጣጠር',
      helpAndSupport: 'እገዛ እና ድጋፍ',
      privacyPolicy: 'የግላዊነት መመሪያ',
      termsOfService: ' የአገልግሎት ውል',
      logout: 'ውጣ',
      version: 'ስሪት',
      appVersion: 'የመተግበሪያ ስሪት',
      advancedSettings: 'የላቁ ቅንብሮች',
      dataUsage: 'የውሂብ አጠቃቀም',
      aboutUs: 'ስለ እኛ',
      contactUs: 'ያግኙን',
      faq: 'ተደጋጋሚ ጥያቄዎች',
      feedback: 'ግብረ መልስ',
      sound: 'ድምፅ',
      pushNotifications: 'ግፋ ማሳወቂያዎች',
      securitySettings: 'የደህንነት ቅንብሮች',
      changePassword: 'የይለፍ ቃል ይቀይሩ',
      twoFactorAuth: 'ባለሁለት ደረጃ ማረጋገጫ',
      manageDevices: 'መሳሪያዎችን ያስተዳድሩ',
      linkedAccounts: 'የተገናኙ መለያዎች',
      socialProfiles: 'ማህበራዊ መገለጫዎች',
      displaySettings: 'የማሳያ ቅንብሮች',
      fontSize: 'የቅርጸ ቁምፊ መጠን',
      accessibility: 'ተደራሽነት',
      legal: 'ህጋዊ',
      reportProblem: 'ችግር ሪፖርት ያድርጉ',
      checkUpdates: 'ዝማኔዎችን ያረጋግጡ',
      locationServices: 'የአካባቢ አገልግሎቶች',
      storage: 'ማከማቻ',
      cache: 'መሸጎጫ',
      resetApp: 'መተግበሪያን ዳግም ያስጀምሩ',
      deleteAccount: 'መለያ ሰርዝ',
      performance: 'አፈጻጸም',
      batteryUsage: 'የባትሪ አጠቃቀም',
      networkSettings: 'የአውታረ መረብ ቅንብሮች',
      developerOptions: 'የገንቢ አማራጮች',
      experimentalFeatures: 'የሙከራ ባህሪያት',
      resetSettings: 'ቅንብሮችን ዳግም ያስጀምሩ',
      resetConfirmation: 'ሁሉንም ቅንብሮች ዳግም ማስጀመር ይፈልጋሉ?',
      resetButton: 'ዳግም አስጀምር',
      cancelButton: 'ይቅር',
      logoutConfirmation: 'ከመለያዎ መውጣት ይፈልጋሉ?',
      logoutButton: 'ውጣ',
      profileLoadError: 'መገለጫ መጫን አልተቻለም',
      profileLoadErrorDescription: 'እባክዎ ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ',
      retry: 'እንደገና ይሞክሩ',
      emailNotAvailable: 'ኢሜይል አይገኝም',
      locationNotSet: 'አካባቢ አልተዘጋጀም',
    },
    en: {
      profile: 'Profile',
      editProfile: 'Edit Profile',
      accountSettings: 'Account Settings',
      security: 'Security',
      notifications: 'Notifications',
      darkMode: 'Dark Mode',
      general: 'General',
      personalInfo: 'Personal Info',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      birthdate: 'Birthdate',
      preferences: 'Preferences',
      language: 'Language',
      calendarSystem: 'Calendar System',
      gregorianCalendar: 'Gregorian Calendar',
      ethiopianCalendar: 'Ethiopian Calendar',
      helpAndSupport: 'Help & Support',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      logout: 'Logout',
      version: 'Version',
      appVersion: 'App Version',
      advancedSettings: 'Advanced Settings',
      dataUsage: 'Data Usage',
      aboutUs: 'About Us',
      contactUs: 'Contact Us',
      faq: 'FAQ',
      feedback: 'Feedback',
      sound: 'Sound',
      pushNotifications: 'Push Notifications',
      securitySettings: 'Security Settings',
      changePassword: 'Change Password',
      twoFactorAuth: 'Two-Factor Auth',
      manageDevices: 'Manage Devices',
      linkedAccounts: 'Linked Accounts',
      socialProfiles: 'Social Profiles',
      displaySettings: 'Display Settings',
      fontSize: 'Font Size',
      accessibility: 'Accessibility',
      legal: 'Legal',
      reportProblem: 'Report a Problem',
      checkUpdates: 'Check for Updates',
      locationServices: 'Location Services',
      storage: 'Storage',
      cache: 'Cache',
      resetApp: 'Reset App',
      deleteAccount: 'Delete Account',
      performance: 'Performance',
      batteryUsage: 'Battery Usage',
      networkSettings: 'Network Settings',
      developerOptions: 'Developer Options',
      experimentalFeatures: 'Experimental Features',
      resetSettings: 'Reset Settings',
      resetConfirmation: 'Are you sure you want to reset all settings?',
      resetButton: 'Reset',
      cancelButton: 'Cancel',
      logoutConfirmation: 'Are you sure you want to log out?',
      logoutButton: 'Logout',
      profileLoadError: 'Unable to load profile',
      profileLoadErrorDescription: 'Please check your connection and try again',
      retry: 'Retry',
      emailNotAvailable: 'Email not available',
      locationNotSet: 'Location not set',
    },
    or: {
      profile: 'Pirofaayilii',
      editProfile: 'Pirofaayilii Fooyyessaa',
      accountSettings: 'Seensa Teessoo',
      security: 'Nagaa',
      notifications: 'Beeksisa',
      darkMode: 'Haala Dukkanaa',
      general: 'Waliigalaa',
      personalInfo: 'Odeeffannoo Dhuunfaa',
      name: 'Maqaa',
      email: 'Imeelii',
      phone: 'Bilbila',
      address: 'Teessoo',
      birthdate: 'Guyyaa Dhalootaa',
      preferences: 'Filannoo',
      language: 'Afaan',
      calendarSystem: 'Sirna Kaaleendarii',
      gregorianCalendar: 'Kaaleendara Girigoriyaanii',
      ethiopianCalendar: 'Kaaleendara Itoophiyaa',
      helpAndSupport: 'Gargaarsaa fi Deeggarsa',
      privacyPolicy: 'Imaammata Iccitii',
      termsOfService: 'Labsii Hojii',
      logout: 'Ba\'uu',
      version: 'Vershinii',
      appVersion: 'Vershinii Appilikeeshinii',
      advancedSettings: 'Filannoo Ol\'aanaa',
      dataUsage: 'Fayyadama Dataa',
      aboutUs: 'Waa\'ee Keenyaa',
      contactUs: 'Nu Quunnamaa',
      faq: 'FAQ',
      feedback: 'Yaada',
      sound: 'Sagalee',
      pushNotifications: 'Beeksisa Dhiibbaa',
      securitySettings: 'Filannoo Nagaa',
      changePassword: 'Jecha Darbii Jijjiirraa',
      twoFactorAuth: 'Mirkanii Lamaan',
      manageDevices: 'Meeshaa Bulchuu',
      linkedAccounts: 'Lakkoofsa Walqabsiisaa',
      socialProfiles: 'Pirofaayilii Hawaasaa',
      displaySettings: 'Filannoo Mul\'isaa',
      fontSize: 'Guddina Fontii',
      accessibility: 'Argamuu',
      legal: 'Seera Qabeessa',
      reportProblem: 'Rakkoo Gabaasaa',
      checkUpdates: 'Haaromsa Mirkaneessaa',
      locationServices: 'Tajaajila Bakka',
      storage: 'Kuusaa',
      cache: 'Kaashii',
      resetApp: 'Appilikeeshinii Deebisii',
      deleteAccount: 'Lakkoofsa Haquu',
      performance: 'Raawwii',
      batteryUsage: 'Fayyadama Baattirii',
      networkSettings: 'Filannoo Neetworkii',
      developerOptions: 'Filannoo Misoomsitootaa',
      experimentalFeatures: 'Amala Yaalii',
      resetSettings: 'Filannoo Deebisii',
      resetConfirmation: 'Filannoo hundaa deebisuu barbaaddaa?',
      resetButton: 'Deebisii',
      cancelButton: 'Dhiisii',
      profileLoadError: 'Pirofaayilii fe\'uu hin danda\'amne',
      profileLoadErrorDescription: 'Mee walqunnamtii kee mirkaneessii fi irra deebi\'ii yaali',
      retry: 'Irra deebi\'ii yaali',
      logoutConfirmation: 'Ba\'uu barbaaddaa?',
      logoutButton: 'Ba\'uu',
      emailNotAvailable: 'Imeelii hin jiru',
      locationNotSet: 'Bakka hin calaagsine',
    },
    sw: {
      profile: 'Wasifu',
      editProfile: 'Hariri Wasifu',
      accountSettings: 'Mipangilio ya Akaunti',
      security: 'Usalama',
      notifications: 'Arifa',
      darkMode: 'Hali ya Giza',
      general: 'Jumla',
      personalInfo: 'Maelezo Binafsi',
      name: 'Jina',
      email: 'Barua pepe',
      phone: 'Simu',
      address: 'Anwani',
      birthdate: 'Tarehe ya Kuzaliwa',
      preferences: 'Mapendeleo',
      language: 'Lugha',
      calendarSystem: 'Mfumo wa Kalenda',
      gregorianCalendar: 'Kalenda ya Gregorian',
      ethiopianCalendar: 'Kalenda ya Ethiopia',
      helpAndSupport: 'Msaada na Usaidizi',
      privacyPolicy: 'Sera ya Faragha',
      termsOfService: 'Masharti ya Huduma',
      logout: 'Ondoka',
      version: 'Toleo',
      appVersion: 'Toleo la App',
      advancedSettings: 'Mipangilio ya Juu',
      dataUsage: 'Matumizi ya Data',
      aboutUs: 'Kuhusu Sisi',
      contactUs: 'Wasiliana Nasi',
      faq: 'Maswali Yanayoulizwa Mara kwa Mara',
      feedback: 'Maoni',
      sound: 'Sauti',
      pushNotifications: 'Arifa za Push',
      securitySettings: 'Mipangilio ya Usalama',
      changePassword: 'Badilisha Nenosiri',
      twoFactorAuth: 'Uthibitishaji wa Hatua Mbili',
      manageDevices: 'Dhibiti Vifaa',
      linkedAccounts: 'Akaunti Zilizounganishwa',
      socialProfiles: 'Wasifu wa Kijamii',
      displaySettings: 'Mipangilio ya Onyesho',
      fontSize: 'Ukubwa wa Fonti',
      accessibility: 'Upatikanaji',
      legal: 'Kisheria',
      reportProblem: 'Ripoti Tatizo',
      checkUpdates: 'Angalia Sasisho',
      locationServices: 'Huduma za Mahali',
      storage: 'Hifadhi',
      cache: 'Akiba',
      resetApp: 'Weka Upya App',
      deleteAccount: 'Futa Akaunti',
      performance: 'Utendaji',
      batteryUsage: 'Matumizi ya Betri',
      networkSettings: 'Mipangilio ya Mtandao',
      developerOptions: 'Chaguzi za Msanidi Programu',
      experimentalFeatures: 'Vipengele vya Majaribio',
      resetSettings: 'Weka Upya Mipangilio',
      resetConfirmation: 'Una uhakika unataka kuweka upya mipangilio yote?',
      resetButton: 'Weka Upya',
      cancelButton: 'Ghairi',
      logoutConfirmation: 'Una uhakika unataka kutoka?',
      logoutButton: 'Ondoka',
      profileLoadError: 'Imeshindwa kupakia wasifu',
      profileLoadErrorDescription: 'Tafadhali angalia muunganisho wako na ujaribu tena',
      retry: 'Jaribu Tena',
      emailNotAvailable: 'Barua pepe haipatikani',
      locationNotSet: 'Mahali hakijawekwa',
    },
  };

  const t = translations[language];

  // Loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-6 w-40" />
              </div>
            </CardContent>
          </Card>
          
          <Skeleton className="h-48 w-full mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  // Error state
  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">
              {t.profileLoadError}
            </h2>
            <p className="text-gray-600 mb-4">
              {t.profileLoadErrorDescription}
            </p>
            <EnhancedButton variant="outline" onClick={() => refetchProfile()} aria-label={t.retry} title={t.retry}>
              {t.retry}
            </EnhancedButton>
          </CardContent>
        </Card>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 mb-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{t.profile}</h1>
            <EnhancedButton
              variant="destructive"
              size="sm"
              className="font-medium"
              onClick={handleLogoutClick}
              aria-label={t.logout}
              title={t.logout}
            >
              {t.logout}
            </EnhancedButton>
          </div>
        </header>

        {/* Profile Card with Gradient Avatar */}
        <div className="p-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            
            {/* Avatar Section */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                  {profile.farmer_name?.charAt(0)?.toUpperCase() || '👤'}
                </div>
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center border-2 border-gray-50">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{profile.farmer_name}</h2>
                <p className="text-sm text-gray-600">@{profile.farmer_name?.toLowerCase().replace(/\s+/g, '_') || 'farmer'}</p>
              </div>
            </div>
            
            {/* Info Grid */}
            <div className="space-y-3">
<div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{user?.email || profile?.email || profile?.phone || t.emailNotAvailable}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{profile.phone}</span>
              </div>
<div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">{profile?.farm_profile?.location || t.locationNotSet}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs & Farm Stats */}
        <CollapsibleSection id="kpis" title={language === 'am' ? 'አፈጻጸም መለኪያዎች' : 'KPIs & Farm Stats'} defaultOpen>
          <FarmStatsCard stats={stats} isLoading={statsLoading} isStale={isStale} />
        </CollapsibleSection>

        {/* Farm Team */}
        <CollapsibleSection id="team" title={language === 'am' ? 'የእርሻ ቡድን' : 'Farm Team'} defaultOpen>
          <TeamManagement />
        </CollapsibleSection>

        {/* Quick Actions */}
        <CollapsibleSection id="quick-actions" title={language === 'am' ? 'ፈጣን እርምጃዎች' : 'Quick Actions'} defaultOpen>
          <QuickActionsSection hasAnimals={(stats?.totalAnimals || 0) > 0} />
        </CollapsibleSection>

        {/* Analytics Dashboard */}
        <CollapsibleSection id="analytics" title={language === 'am' ? 'ትንታኔ' : 'Analytics'}>
          <AnalyticsDashboard />
        </CollapsibleSection>

        {/* App Settings */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="text-base font-semibold text-gray-900 px-4 pt-4 pb-3">
              {t.accountSettings}
            </h3>
            
            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-900">{t.notifications}</span>
                </div>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
              
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-900">{t.sound}</span>
                </div>
                <Switch checked={true} />
              </div>
              
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-900">{t.language}</div>
                    <div className="text-xs text-gray-500">{language === 'am' ? 'Amharic' : 'English'}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Reminders & Alerts */}
        <CollapsibleSection id="alerts" title={language === 'am' ? 'ማስታወሻዎች እና ጥቆማዎች' : 'Reminders & Alerts'}>
          <ReminderSettings className="mb-4" />
          <MarketAlertPreferences />
        </CollapsibleSection>

        {/* Market Alerts */}
        <div className="mb-20">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="text-base font-semibold text-gray-900 px-4 pt-4 pb-3">
              Market Alerts
            </h3>
            
            <div className="divide-y divide-gray-100">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-900">New Listings</span>
                  <Switch checked={true} />
                </div>
                <p className="text-xs text-gray-500">
                  Get notified when new animals are listed
                </p>
              </div>
              
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-900">Price Changes</span>
                  <Switch checked={false} />
                </div>
                <p className="text-xs text-gray-500">
                  Alert when prices drop significantly
                </p>
              </div>
              
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-900">Distance Threshold</span>
                  <span className="text-sm font-medium text-emerald-600">{distanceThreshold} km</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={distanceThreshold}
                  onChange={(e) => setDistanceThreshold(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
      
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
};

export default Profile;
