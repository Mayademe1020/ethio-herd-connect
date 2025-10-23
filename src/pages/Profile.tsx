import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  Edit3, 
  Camera,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Heart,
  BarChart3,
  Star,
  Award,
  Target,
  TrendingUp,
  Globe,
  Moon,
  Sun,
  Volume2,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import BottomNavigation from '@/components/BottomNavigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Profile = () => {
  const { language } = useLanguage();
  const { calendarSystem, setCalendarSystem } = useCalendar();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

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
      logout: 'Ba’uu',
      version: 'Vershinii',
      appVersion: 'Vershinii Appilikeeshinii',
      advancedSettings: 'Filannoo Ol’aanaa',
      dataUsage: 'Fayyadama Dataa',
      aboutUs: 'Waa’ee Keenyaa',
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
      displaySettings: 'Filannoo Mul’isaa',
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
      logoutConfirmation: 'Ba’uu barbaaddaa?',
      logoutButton: 'Ba’uu',
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
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{t.profile}</h1>
          <Button variant="outline" size="sm">
            <Edit3 className="w-4 h-4 mr-2" />
            {t.editProfile}
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t.personalInfo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">{t.name}</div>
                <div className="text-sm text-gray-500">@{t.profile}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">{t.email}</div>
                <div className="text-gray-500 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  john.doe@example.com
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">{t.phone}</div>
                <div className="text-gray-500 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +251 912 345678
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">{t.address}</div>
                <div className="text-gray-500 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Addis Ababa, Ethiopia
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">{t.birthdate}</div>
                <div className="text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  January 1, 1990
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t.accountSettings}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Moon className="w-4 h-4" />
                  <span>{t.darkMode}</span>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>{t.notifications}</span>
                </div>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4" />
                  <span>{t.sound}</span>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>{t.language}</span>
                </div>
                <Badge variant="secondary">{language}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{t.calendarSystem}</span>
                </div>
                <Select value={calendarSystem} onValueChange={handleCalendarChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gregorian">
                      {t.gregorianCalendar}
                    </SelectItem>
                    <SelectItem value="ethiopian">
                      {t.ethiopianCalendar}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t.securitySettings}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>{t.changePassword}</span>
              </div>
              <Button variant="ghost" size="sm">
                {t.editProfile}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>{t.twoFactorAuth}</span>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Help and Support */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t.helpAndSupport}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span>{t.faq}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>{t.contactUs}</span>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent>
            <Button variant="destructive" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              {t.logout}
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Profile;
