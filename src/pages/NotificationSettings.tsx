// src/pages/NotificationSettings.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationSettings as NotificationSettingsComponent } from '@/components/NotificationSettings';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationSettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Notification Settings
            </h1>
            <p className="text-gray-600">
              Control how you receive notifications
            </p>
          </div>
        </div>

        {/* Notification Settings Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <NotificationSettingsComponent />
        </div>

        {/* Quick Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h3 className="font-medium text-blue-900 mb-2">
            💡 Quick Tips
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Set Do Not Disturb for quiet hours (sleep time)</li>
            <li>• Batch milk reminders to reduce notifications</li>
            <li>• Adjust frequency based on your preference</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
