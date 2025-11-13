import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { Bell, TrendingUp, MapPin, DollarSign } from 'lucide-react';

interface AlertPreferences {
  new_listings: boolean;
  price_changes: boolean;
  opportunities: boolean;
  distance_threshold_km: number;
  price_change_threshold: number;
}

export const MarketAlertPreferences: React.FC = () => {
  const { t } = useTranslations();
  const { showInfo, showError } = useToastNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<AlertPreferences>({
    new_listings: true,
    price_changes: true,
    opportunities: true,
    distance_threshold_km: 50,
    price_change_threshold: 15,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('alert_preferences')
        .eq('id', user.id)
        .single();

      if (error) {
        // Silently handle missing column or table error
        if (error.code === '42703' || error.code === '42P01') {
          console.warn('alert_preferences column not found - feature not yet enabled');
        } else {
          throw error;
        }
      }

      if (data?.alert_preferences) {
        setPreferences({
          ...preferences,
          ...data.alert_preferences,
        });
      }
    } catch (error: any) {
      console.error('Error loading alert preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ alert_preferences: preferences })
        .eq('id', user.id);

      if (error) {
        // Silently handle missing column error
        if (error.code === '42703' || error.code === '42P01') {
          console.warn('alert_preferences column not found - feature not yet enabled');
          showInfo('Feature not yet available');
          return;
        }
        throw error;
      }

      showInfo('Alert preferences saved');
    } catch (error) {
      console.error('Error saving alert preferences:', error);
      showError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof AlertPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSliderChange = (key: keyof AlertPreferences, value: number) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">
          Market Alert Preferences
        </h3>
      </div>

      <div className="space-y-4">
        {/* New Listings Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">
                New Listings Nearby
              </p>
              <p className="text-sm text-gray-600">
                Get notified when new animals are listed near you
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.new_listings}
              onChange={() => handleToggle('new_listings')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Distance Threshold Slider */}
        {preferences.new_listings && (
          <div className="ml-8 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance Threshold: {preferences.distance_threshold_km} km
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={preferences.distance_threshold_km}
              onChange={(e) => handleSliderChange('distance_threshold_km', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10 km</span>
              <span>100 km</span>
            </div>
          </div>
        )}

        {/* Price Changes Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">
                Price Changes
              </p>
              <p className="text-sm text-gray-600">
                Get notified about significant price trends
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.price_changes}
              onChange={() => handleToggle('price_changes')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Price Change Threshold Slider */}
        {preferences.price_changes && (
          <div className="ml-8 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Change Threshold: {preferences.price_change_threshold}%
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={preferences.price_change_threshold}
              onChange={(e) => handleSliderChange('price_change_threshold', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5%</span>
              <span>30%</span>
            </div>
          </div>
        )}

        {/* Opportunities Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="font-medium text-gray-900">
                Market Opportunities
              </p>
              <p className="text-sm text-gray-600">
                Get suggestions when demand is high for your animals
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.opportunities}
              onChange={() => handleToggle('opportunities')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={savePreferences}
        disabled={saving}
        className="w-full mt-6 bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {saving
          ? 'Saving...'
          : 'Save Changes'}
      </button>
    </div>
  );
};
