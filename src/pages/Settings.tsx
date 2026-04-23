import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Globe,
  Calendar,
  User,
  Shield,
  Info,
  LogOut,
  ChevronRight,
  Loader2,
  Check,
  WifiOff,
  AlertTriangle,
  Eye,
  Contrast
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCalendar, CalendarSystem } from '@/contexts/CalendarContext';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContextMVP';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BottomNavigation from '@/components/BottomNavigation';

type Language = 'am' | 'en' | 'or' | 'sw';

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

const SettingsItem = ({ icon, label, onClick, rightElement, danger }: SettingsItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
      danger 
        ? 'text-red-600 hover:bg-red-50' 
        : 'text-gray-900 hover:bg-gray-50'
    }`}
    aria-label={label}
  >
    <div className="flex items-center gap-3">
      <span className={`${danger ? 'text-red-500' : 'text-gray-400'}`}>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
    {rightElement || <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />}
  </button>
);

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { calendarSystem, setCalendarSystem } = useCalendar();
  const { user } = useAuth();
  const { profile } = useProfile();
  const {
    settings,
    isLoading: notificationsLoading,
    isUpdating,
    setPushNotifications,
    setEmailNotifications,
    setTelegramNotifications,
    isTelegramConnected,
    telegramUsername
  } = useNotificationSettings();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isPendingSync, setIsPendingSync] = useState(false);
  
  // Accessibility preferences
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reduceMotion');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('highContrast');
      if (saved !== null) return JSON.parse(saved);
    }
    return false;
  });

  // Apply accessibility preferences
  useEffect(() => {
    localStorage.setItem('reduceMotion', JSON.stringify(reduceMotion));
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    localStorage.setItem('highContrast', JSON.stringify(highContrast));
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  // Network status awareness
  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      toast.success(tt.synced);
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for pending sync items
  useEffect(() => {
    const checkPendingSync = () => {
      const pending = localStorage.getItem('pending_sync_count');
      setIsPendingSync(parseInt(pending || '0') > 0);
    };
    checkPendingSync();
    const interval = setInterval(checkPendingSync, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = {
    am: {
      settings: 'ቅንብሮች',
      back: 'ተመለስ',
      languageRegion: 'ቋንቋ እና ክልል',
      language: 'ቋንቋ',
      calendar: 'የቀን አቆጣጠር',
      notifications: 'ማሳወቂያዎች',
      pushNotifications: 'አፕ ማሳወቂያዎች',
      emailNotifications: 'ኢሜይል ማሳወቂያዎች',
      telegramNotifications: 'ተለግረም ማሳወቂያዎች',
      connectTelegram: 'ተለግረም ገናይ',
      connected: 'ተያይዟል',
      account: 'መለያ',
      editProfile: 'መገለጫ አርትዕ',
      deleteAccount: 'መለያ ሰርዝ',
      about: 'ስለ',
      version: 'እትም',
      privacyPolicy: 'የግላዊነት ፖሊሲ',
      terms: 'የአገልግሎት ውሎች',
      logout: 'ውጣ',
      ethiopian: 'የኢትዮጵያ',
      gregorian: 'ግሪጎሪያን',
      // New translations
      offlineMode: 'ከመስመር ውጪ',
      settingsWillSync: 'ቅንብሮች እንዲሁይ ይቀመጣሉ',
      pendingSync: 'የተስተካከለ ማስታወሻ',
      synced: 'ተደርቷል',
      errorTryAgain: 'ስህተት ነበር። እንደገና ይሞክሩ',
      errorNoInternet: 'ኢንተርኔት የለም። ቅንብሮች ይቀመጣሉ',
      logoutConfirmTitle: 'እርግጠኛ ነዎት?',
      logoutConfirmMessage: 'ከገቡ ውጪ ከወጡ ዝርዝር መረጃዎች ላይስተካከል አይችሉም።',
      logoutConfirmButton: 'ውጣ',
      cancelButton: 'ሰርዝ',
      calendarInfo: 'የኢትዮጵያ ቀን አቆጣጠር ለግብርና ወቅቶች እና በዓላት ጥቅም ይሆናል',
    },
    en: {
      settings: 'Settings',
      back: 'Back',
      languageRegion: 'Language & Region',
      language: 'Language',
      calendar: 'Calendar',
      notifications: 'Notifications',
      pushNotifications: 'Push Notifications',
      emailNotifications: 'Email Notifications',
      telegramNotifications: 'Telegram Notifications',
      connectTelegram: 'Connect Telegram',
      connected: 'Connected',
      account: 'Account',
      editProfile: 'Edit Profile',
      deleteAccount: 'Delete Account',
      about: 'About',
      version: 'Version',
      privacyPolicy: 'Privacy Policy',
      terms: 'Terms of Service',
      logout: 'Logout',
      ethiopian: 'Ethiopian',
      gregorian: 'Gregorian',
      // New translations
      offlineMode: 'Offline Mode',
      settingsWillSync: 'Settings will sync when online',
      pendingSync: 'pending sync',
      synced: 'Synced successfully',
      errorTryAgain: 'Something went wrong. Please try again.',
      errorNoInternet: 'No internet. Settings saved for later.',
      logoutConfirmTitle: 'Are you sure?',
      logoutConfirmMessage: 'If you log out, any unsaved changes will be lost.',
      logoutConfirmButton: 'Logout',
      cancelButton: 'Cancel',
      calendarInfo: 'Ethiopian calendar is useful for farming seasons and holidays',
    },
    or: {
      settings: 'Sagantaa',
      back: 'Dubbii',
      languageRegion: 'Afaan & Naannoo',
      language: 'Afaan',
      calendar: 'Calandarii',
      notifications: 'Odeeffannoo',
      pushNotifications: 'Odeeffannoo Appii',
      emailNotifications: 'Odeeffannoo Emailii',
      telegramNotifications: 'Odeeffannoo Telegram',
      connectTelegram: 'Telegram Qubuu',
      connected: 'Qabatame',
      account: 'Akkawnta',
      editProfile: 'Profayil Edituu',
      deleteAccount: 'Akkawnta Delete',
      about: "Waa'ee",
      version: 'Version',
      privacyPolicy: 'Polishii Sirna',
      terms: 'Yaada tajaajila',
      logout: "Ba'uu",
      ethiopian: 'Itoophiyaa',
      gregorian: 'Gorgoriyaan',
      // New translations
      offlineMode: 'Offline',
      settingsWillSync: 'Sagantoonni online taataniin sinjiiffama',
      pendingSync: 'sinjiifama jira',
      synced: 'Sinjiifame',
      errorTryAgain: 'Rakkoo. Yeroo biraa irratti yaada.',
      errorNoInternet: 'Internet hin jiruu. Sagantoonni har Wiederholen.',
      logoutConfirmTitle: 'Ammu?',
      logoutConfirmMessage: "Ba'ee booda waa'ee hundaa'a.",
      logoutConfirmButton: "Ba'uu",
      cancelButton: 'Haalu',
      calendarInfo: 'Calandarii Itoophiyaa waxtummaa qonnaa fi guyyaa diinaaaf',
    },
    sw: {
      settings: 'Mipangilio',
      back: 'Rudi',
      languageRegion: 'Lugha na Mikoa',
      language: 'Lugha',
      calendar: 'Kalenda',
      notifications: 'Arifa',
      pushNotifications: 'Arifa za App',
      emailNotifications: 'Arifa za Barua pepe',
      telegramNotifications: 'Arifa za Telegram',
      connectTelegram: 'Unganisha Telegram',
      connected: 'Imunganishwa',
      account: 'Akaunti',
      editProfile: 'Hariri Profaili',
      deleteAccount: 'Futa Akaunti',
      about: 'Kuhusu',
      version: 'Toleo',
      privacyPolicy: 'Sera ya Faragha',
      terms: 'Sheria za Huduma',
      logout: 'Onoka',
      ethiopian: 'Uhabeshi',
      gregorian: 'Gregori',
      // New translations
      offlineMode: 'Hali ya Offline',
      settingsWillSync: 'Mipangilio itasawazishwa mtandaoni',
      pendingSync: 'inach等待同步',
      synced: 'Imesawazishwa',
      errorTryAgain: 'Hitilafu. Jaribu tena.',
      hakunaInternet: 'Hakuna mtandao. Mipangilio itahifadhiwa.',
      logoutConfirmTitle: 'Una uhakika?',
      logoutConfirmMessage: 'Ukionoka, mabadiliko yoyote yatayokufa.',
      logoutConfirmButton: 'Onoka',
      cancelButton: 'Ghairi',
      calendarInfo: 'Kalenda ya Ethiopia ni muhimu kwa msimu wa kilimo',
    }
  };

  const tt = t[language] || t.en;

  const languageOptions: { value: Language; label: string }[] = [
    { value: 'am', label: 'አማርኛ' },
    { value: 'en', label: 'English' },
    { value: 'or', label: 'Oromoo' },
    { value: 'sw', label: 'Kiswahili' },
  ];

  const handleLogout = async () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    localStorage.clear();
    await supabase.auth.signOut();
    toast.success(language === 'am' ? 'በተሳካ ወጥተዋል' : language === 'or' ? "Ba'ame" : language === 'sw' ? 'Onokea' : 'Logged out successfully');
    navigate('/login');
  };

  const handleCalendarChange = async (system: CalendarSystem) => {
    try {
      await setCalendarSystem(system);
      toast.success(
        language === 'am' ? 'የቀን አቆጣጠር ተለውጧል' :
        language === 'or' ? 'Calandarii jijjiire' :
        language === 'sw' ? 'Kalenda imebadilika' : 'Calendar updated'
      );
    } catch {
      toast.error(tt.errorTryAgain, { duration: 8000 });
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (!isOnline) {
      toast.info(tt.errorNoInternet, { duration: 8000 });
      return;
    }
    try {
      await setPushNotifications(enabled);
      toast.success(tt.synced);
    } catch {
      toast.error(tt.errorTryAgain, { duration: 8000 });
    }
  };

  const handleEmailToggle = async (enabled: boolean) => {
    if (!isOnline) {
      toast.info(tt.errorNoInternet, { duration: 8000 });
      return;
    }
    try {
      await setEmailNotifications(enabled);
      toast.success(tt.synced);
    } catch {
      toast.error(tt.errorTryAgain, { duration: 8000 });
    }
  };

  const handleTelegramToggle = async (enabled: boolean) => {
    if (!isTelegramConnected && enabled) {
      toast.info('Telegram integration coming soon');
      return;
    }
    if (!isOnline) {
      toast.info(tt.errorNoInternet, { duration: 8000 });
      return;
    }
    try {
      await setTelegramNotifications(enabled);
      toast.success(tt.synced);
    } catch {
      toast.error(tt.errorTryAgain, { duration: 8000 });
    }
  };

  return (
    <main 
      className="min-h-screen bg-gray-50 pb-24 md:pb-6"
      role="main"
      aria-label={tt.settings}
    >
      <div className="max-w-2xl mx-auto">
        {/* Offline Indicator Banner */}
        {!isOnline && (
          <div className="bg-amber-600 text-white px-4 py-3 flex items-center justify-center gap-2">
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">{tt.offlineMode}</span>
            <span className="text-xs opacity-90">- {tt.settingsWillSync}</span>
          </div>
        )}
        
        {/* Pending Sync Indicator */}
        {isOnline && isPendingSync && (
          <div className="bg-blue-50 text-blue-700 px-4 py-2 flex items-center justify-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{tt.pendingSync}</span>
          </div>
        )}

        {/* Logout Confirmation Dialog */}
        {showLogoutDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-sm w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {tt.logoutConfirmTitle}
                </h3>
                <p className="text-gray-600 mb-6">
                  {tt.logoutConfirmMessage}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowLogoutDialog(false)}
                    className="flex-1"
                  >
                    {tt.cancelButton}
                  </Button>
                  <Button
                    onClick={handleConfirmLogout}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {tt.logoutConfirmButton}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Header */}
        <header 
          className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10"
          role="banner"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              aria-label={tt.back}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {tt.settings}
            </h1>
          </div>
        </header>

        {/* Language & Region */}
        <section className="px-4 py-4" aria-labelledby="language-heading">
          <h2 id="language-heading" className="text-sm font-semibold text-gray-700 mb-3">
            {tt.languageRegion}
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  <span className="text-sm text-gray-900">{tt.language}</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="text-sm text-gray-600 bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1"
                  aria-label={tt.language}
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <Separator />
              <div className="px-4 py-3">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  <span className="text-sm text-gray-900">{tt.calendar}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3 ml-8">{tt.calendarInfo}</p>
                <div className="flex gap-4 ml-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="calendar"
                      checked={calendarSystem === 'ethiopian'}
                      onChange={() => handleCalendarChange('ethiopian')}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <span className="text-sm text-gray-700">{tt.ethiopian}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="calendar"
                      checked={calendarSystem === 'gregorian'}
                      onChange={() => handleCalendarChange('gregorian')}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <span className="text-sm text-gray-700">{tt.gregorian}</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Accessibility */}
        <section className="px-4 py-4" aria-labelledby="accessibility-heading">
          <h2 id="accessibility-heading" className="text-sm font-semibold text-gray-700 mb-3">
            Accessibility
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">Reduce Motion</span>
                    <span className="text-xs text-gray-500">Minimize animations</span>
                  </div>
                </div>
                <Switch
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                  aria-label="Reduce motion"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <Contrast className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">High Contrast</span>
                    <span className="text-xs text-gray-500">Easier to read</span>
                  </div>
                </div>
                <Switch
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                  aria-label="High contrast"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Notifications */}
        <section className="px-4 pb-4" aria-labelledby="notifications-heading">
          <h2 id="notifications-heading" className="text-sm font-semibold text-gray-700 mb-3">
            {tt.notifications}
          </h2>
          <Card>
            <CardContent className="p-0">
              {notificationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-400" aria-hidden="true" />
                      <span className="text-sm text-gray-900">{tt.pushNotifications}</span>
                    </div>
                    <Switch
                      checked={settings?.push_notifications_enabled ?? true}
                      onCheckedChange={handlePushToggle}
                      disabled={isUpdating}
                      aria-label={tt.pushNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-400" aria-hidden="true" />
                      <span className="text-sm text-gray-900">{tt.emailNotifications}</span>
                    </div>
                    <Switch
                      checked={settings?.email_notifications_enabled ?? false}
                      onCheckedChange={handleEmailToggle}
                      disabled={isUpdating}
                      aria-label={tt.emailNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-400" aria-hidden="true" />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{tt.telegramNotifications}</span>
                        {isTelegramConnected && telegramUsername && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Check className="w-3 h-3" /> @{telegramUsername} ({tt.connected})
                          </span>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={settings?.telegram_notifications_enabled ?? false}
                      onCheckedChange={handleTelegramToggle}
                      disabled={isUpdating || !isTelegramConnected}
                      aria-label={tt.telegramNotifications}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Account */}
        <section className="px-4 pb-4" aria-labelledby="account-heading">
          <h2 id="account-heading" className="text-sm font-semibold text-gray-700 mb-3">
            {tt.account}
          </h2>
          <Card>
            <CardContent className="p-0">
              <SettingsItem
                icon={<User className="w-5 h-5" />}
                label={tt.editProfile}
                onClick={() => navigate('/profile')}
              />
              <Separator />
              <SettingsItem
                icon={<Shield className="w-5 h-5" />}
                label={tt.deleteAccount}
                danger
                onClick={() => toast.info('Contact support to delete account')}
              />
            </CardContent>
          </Card>
        </section>

        {/* About */}
        <section className="px-4 pb-4" aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-sm font-semibold text-gray-700 mb-3">
            {tt.about}
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  <span className="text-sm text-gray-900">{tt.version}</span>
                </div>
                <span className="text-sm text-gray-500">1.0.0</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Logout */}
        <section className="px-4 pb-4">
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {tt.logout}
          </Button>
        </section>
      </div>

      <BottomNavigation />
    </main>
  );
};

export default Settings;
