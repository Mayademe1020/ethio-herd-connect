/**
 * ReminderSettings Component
 * Allows users to configure milk recording reminder times
 * Requirements: 6.7
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useToast } from '@/hooks/useToast';
import {
  scheduleReminder,
  getUserReminders,
  getDefaultReminderTime,
  type ReminderSchedule,
} from '@/services/reminderService';
import { Bell, BellOff, Clock } from 'lucide-react';

interface ReminderSettingsProps {
  className?: string;
}

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [morningEnabled, setMorningEnabled] = useState(false);
  const [morningTime, setMorningTime] = useState(getDefaultReminderTime('milk_morning'));
  const [afternoonEnabled, setAfternoonEnabled] = useState(false);
  const [afternoonTime, setAfternoonTime] = useState(
    getDefaultReminderTime('milk_afternoon')
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing reminders
  useEffect(() => {
    if (user?.id) {
      loadReminders();
    }
  }, [user?.id]);

  const loadReminders = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const result = await getUserReminders(user.id);

      if (result.success && result.reminders) {
        result.reminders.forEach((reminder) => {
          if (reminder.type === 'milk_morning') {
            setMorningEnabled(reminder.enabled);
            setMorningTime(reminder.schedule_time);
          } else if (reminder.type === 'milk_afternoon') {
            setAfternoonEnabled(reminder.enabled);
            setAfternoonTime(reminder.schedule_time);
          }
        });
      }
    } catch (error: any) {
      console.error('Error loading reminders:', error);
      // Silently handle missing table error (42P01)
      if (error?.code === '42P01') {
        console.warn('Reminders table not found - feature not yet enabled');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReminder = async (
    type: 'milk_morning' | 'milk_afternoon',
    time: string,
    enabled: boolean
  ) => {
    if (!user?.id) return;

    try {
      setSaving(true);
      const result = await scheduleReminder(user.id, type, time, enabled);

      if (result.success) {
        showToast(t('reminders.saved'), 'success');
      } else {
        showToast(result.error || t('reminders.saveFailed'), 'error');
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      showToast(t('reminders.saveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMorningToggle = async () => {
    const newEnabled = !morningEnabled;
    setMorningEnabled(newEnabled);
    await handleSaveReminder('milk_morning', morningTime, newEnabled);
  };

  const handleAfternoonToggle = async () => {
    const newEnabled = !afternoonEnabled;
    setAfternoonEnabled(newEnabled);
    await handleSaveReminder('milk_afternoon', afternoonTime, newEnabled);
  };

  const handleMorningTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setMorningTime(newTime);
    if (morningEnabled) {
      await handleSaveReminder('milk_morning', newTime, true);
    }
  };

  const handleAfternoonTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setAfternoonTime(newTime);
    if (afternoonEnabled) {
      await handleSaveReminder('milk_afternoon', newTime, true);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {t('reminders.title')}
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">{t('reminders.description')}</p>

      {/* Morning Reminder */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <h4 className="font-medium text-gray-900">{t('reminders.morning')}</h4>
              <p className="text-sm text-gray-500">{t('reminders.morningDesc')}</p>
            </div>
          </div>
          <button
            onClick={handleMorningToggle}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              morningEnabled ? 'bg-primary-600' : 'bg-gray-200'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={t('reminders.toggleMorning')}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                morningEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {morningEnabled && (
          <div className="ml-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reminders.time')}
            </label>
            <input
              type="time"
              value={morningTime}
              onChange={handleMorningTimeChange}
              disabled={saving}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-gray-500">{t('reminders.morningWindow')}</p>
          </div>
        )}
      </div>

      {/* Afternoon Reminder */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <h4 className="font-medium text-gray-900">{t('reminders.afternoon')}</h4>
              <p className="text-sm text-gray-500">{t('reminders.afternoonDesc')}</p>
            </div>
          </div>
          <button
            onClick={handleAfternoonToggle}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              afternoonEnabled ? 'bg-primary-600' : 'bg-gray-200'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={t('reminders.toggleAfternoon')}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                afternoonEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {afternoonEnabled && (
          <div className="ml-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reminders.time')}
            </label>
            <input
              type="time"
              value={afternoonTime}
              onChange={handleAfternoonTimeChange}
              disabled={saving}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-gray-500">
              {t('reminders.afternoonWindow')}
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">{t('reminders.infoTitle')}</p>
            <p>{t('reminders.infoText')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
