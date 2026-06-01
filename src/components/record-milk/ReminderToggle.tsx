import { Bell, BellOff } from 'lucide-react';

interface ReminderToggleProps {
  enabled: boolean;
  loading: boolean;
  onToggle: () => void;
}

export const ReminderToggle = ({ enabled, loading, onToggle }: ReminderToggleProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? <Bell className="w-5 h-5 text-blue-500" /> : <BellOff className="w-5 h-5 text-gray-400" />}
          <div>
            <h3 className="font-semibold text-gray-800">{enabled ? 'Reminders On' : 'Reminders Off'}</h3>
            <p className="text-sm text-gray-600">
              {enabled
                ? 'Daily at 6 AM & 6 PM / በየቀኑ ጠዋት 6 እና ምሽት 6'
                : 'Enable daily milk reminders / ዕለታዊ ማስታወሻዎችን ያንቁ'}
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          disabled={loading}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            enabled ? 'bg-blue-500' : 'bg-gray-300'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
