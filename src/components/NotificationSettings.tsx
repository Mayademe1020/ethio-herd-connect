// src/components/NotificationSettings.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useTranslation } from '@/hooks/useTranslation';
import {
  getUserNotificationPreferences,
  updateNotificationPreferences,
  toggleNotificationCategory,
  isDoNotDisturbActive,
} from '@/services/notificationSettingsService';
import { NotificationPreferences, defaultPreferences } from '@/types/notificationPreferences';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Bell,
  Moon,
  Sun,
  Clock,
  Milk,
  Store,
  Heart,
  UserCog,
  Save,
  Loader2,
  Check,
  X,
} from 'lucide-react';

interface NotificationSettingsProps {
  className?: string;
  onSave?: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  className = '',
  onSave,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    const result = await getUserNotificationPreferences(user.id);
    
    if (result.success && result.data) {
      setPreferences(result.data);
    } else {
      // Use defaults if no preferences exist
      setPreferences({
        ...defaultPreferences,
        id: '',
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setLoading(false);
  };

  const handleToggle = (path: string, value: boolean) => {
    setHasChanges(true);
    
    const newPrefs = { ...preferences };
    const pathParts = path.split('.');
    
    if (pathParts.length === 1) {
      (newPrefs as any)[pathParts[0]] = value;
    } else {
      let obj: any = newPrefs;
      for (let i = 0; i < pathParts.length - 1; i++) {
        obj = obj[pathParts[i]];
      }
      obj[pathParts[pathParts.length - 1]] = value;
    }
    
    setPreferences(newPrefs);
  };

  const handleTimeChange = (path: string, time: string) => {
    setHasChanges(true);
    
    const newPrefs = { ...preferences };
    const pathParts = path.split('.');
    
    if (pathParts.length === 1) {
      (newPrefs as any)[pathParts[0]] = time;
    } else {
      let obj: any = newPrefs;
      for (let i = 0; i < pathParts.length - 1; i++) {
        obj = obj[pathParts[i]];
      }
      obj[pathParts[pathParts.length - 1]] = time;
    }
    
    setPreferences(newPrefs);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    const result = await updateNotificationPreferences(user.id, {
      global_enabled: preferences.global_enabled,
      do_not_disturb: preferences.do_not_disturb,
      dnd_start_time: preferences.dnd_start_time,
      dnd_end_time: preferences.dnd_end_time,
      milk_reminders: preferences.milk_reminders,
      market_alerts: preferences.market_alerts,
      health_alerts: preferences.health_alerts,
      account_updates: preferences.account_updates,
      dnd_schedule: preferences.dnd_schedule,
    });
    
    if (result.success) {
      toast.success('✓ Settings saved');
      setHasChanges(false);
      onSave?.();
    } else {
      toast.error('Failed to save settings');
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading settings...</span>
      </div>
    );
  }

  const isDNDActive = isDoNotDisturbActive(preferences);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Global Enable/Disable */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <span>{t('notifications.global') || 'Notifications'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-medium">
                {preferences.global_enabled ? 'Notifications Enabled' : 'Notifications Disabled'}
              </Label>
              <p className="text-sm text-gray-500">
                {preferences.global_enabled 
                  ? 'You will receive notifications'
                  : 'All notifications are turned off'}
              </p>
            </div>
            <Switch
              checked={preferences.global_enabled}
              onCheckedChange={(checked) => handleToggle('global_enabled', checked)}
              aria-label="Toggle global notifications"
            />
          </div>
        </CardContent>
      </Card>

      {/* Do Not Disturb */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Moon className="w-5 h-5" />
            <span>{t('notifications.dnd') || 'Do Not Disturb'}</span>
            {isDNDActive && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Active
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-medium">
                Enable Do Not Disturb
              </Label>
              <p className="text-sm text-gray-500">
                Silence notifications during quiet hours
              </p>
            </div>
            <Switch
              checked={preferences.do_not_disturb}
              onCheckedChange={(checked) => handleToggle('do_not_disturb', checked)}
              aria-label="Toggle Do Not Disturb"
            />
          </div>
          
          {preferences.do_not_disturb && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label className="text-sm">Start Time</Label>
                <Input
                  type="time"
                  value={preferences.dnd_start_time}
                  onChange={(e) => handleTimeChange('dnd_start_time', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">End Time</Label>
                <Input
                  type="time"
                  value={preferences.dnd_end_time}
                  onChange={(e) => handleTimeChange('dnd_end_time', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milk Recording Reminders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Milk className="w-5 h-5" />
            <span>{t('notifications.milkReminders') || 'Milk Recording Reminders'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-medium">
                {preferences.milk_reminders.enabled ? 'Reminders On' : 'Reminders Off'}
              </Label>
              <p className="text-sm text-gray-500">
                Get notified when it's time to record milk
              </p>
            </div>
            <Switch
              checked={preferences.milk_reminders.enabled}
              onCheckedChange={(checked) => handleToggle('milk_reminders.enabled', checked)}
              aria-label="Toggle milk reminders"
            />
          </div>
          
          {preferences.milk_reminders.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-sm">Morning Time</Label>
                  <Input
                    type="time"
                    value={preferences.milk_reminders.morning_time}
                    onChange={(e) => handleTimeChange('milk_reminders.morning_time', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Afternoon Time</Label>
                  <Input
                    type="time"
                    value={preferences.milk_reminders.afternoon_time}
                    onChange={(e) => handleTimeChange('milk_reminders.afternoon_time', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t mt-4 pt-4">
                <div>
                  <Label className="font-medium">Batch Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Group multiple reminders into one notification
                  </p>
                </div>
                <Switch
                  checked={preferences.milk_reminders.batch_enabled}
                  onCheckedChange={(checked) => handleToggle('milk_reminders.batch_enabled', checked)}
                  aria-label="Toggle batch notifications"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Market Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="w-5 h-5" />
            <span>{t('notifications.marketAlerts') || 'Marketplace Alerts'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-medium">
                {preferences.market_alerts.enabled ? 'Market Alerts On' : 'Market Alerts Off'}
              </Label>
              <p className="text-sm text-gray-500">
                Get notified about marketplace activity
              </p>
            </div>
            <Switch
              checked={preferences.market_alerts.enabled}
              onCheckedChange={(checked) => handleToggle('market_alerts.enabled', checked)}
              aria-label="Toggle market alerts"
            />
          </div>
          
          {preferences.market_alerts.enabled && (
            <>
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm">New Listings</Label>
                <Switch
                  checked={preferences.market_alerts.new_listings}
                  onCheckedChange={(checked) => handleToggle('market_alerts.new_listings', checked)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm">Price Changes</Label>
                <Switch
                  checked={preferences.market_alerts.price_changes}
                  onCheckedChange={(checked) => handleToggle('market_alerts.price_changes', checked)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm">Buyer Interests</Label>
                <Switch
                  checked={preferences.market_alerts.interests}
                  onCheckedChange={(checked) => handleToggle('market_alerts.interests', checked)}
                />
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Label className="text-sm block mb-2">Frequency</Label>
                <div className="flex gap-2">
                  {(['realtime', 'daily', 'weekly'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => handleToggle('market_alerts.frequency', freq)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        preferences.market_alerts.frequency === freq
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Health Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5" />
            <span>{t('notifications.healthAlerts') || 'Health & Breeding Alerts'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="font-medium">
                {preferences.health_alerts.enabled ? 'Health Alerts On' : 'Health Alerts Off'}
              </Label>
              <p className="text-sm text-gray-500">
                Vaccination, breeding, and health reminders
              </p>
            </div>
            <Switch
              checked={preferences.health_alerts.enabled}
              onCheckedChange={(checked) => handleToggle('health_alerts.enabled', checked)}
              aria-label="Toggle health alerts"
            />
          </div>
          
          {preferences.health_alerts.enabled && (
            <>
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm">Vaccinations</Label>
                <Switch
                  checked={preferences.health_alerts.vaccinations}
                  onCheckedChange={(checked) => handleToggle('health_alerts.vaccinations', checked)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm">Breeding Reminders</Label>
                <Switch
                  checked={preferences.health_alerts.breeding}
                  onCheckedChange={(checked) => handleToggle('health_alerts.breeding', checked)}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <Label className="text-sm">Health Issues</Label>
                <Switch
                  checked={preferences.health_alerts.health_issues}
                  onCheckedChange={(checked) => handleToggle('health_alerts.health_issues', checked)}
                />
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Label className="text-sm block mb-2">Frequency</Label>
                <div className="flex gap-2">
                  {(['realtime', 'daily', 'weekly'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => handleToggle('health_alerts.frequency', freq)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        preferences.health_alerts.frequency === freq
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end gap-2">
          <Button
            onClick={loadPreferences}
            variant="outline"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
