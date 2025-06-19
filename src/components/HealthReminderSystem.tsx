
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface HealthReminderSystemProps {
  language: 'am' | 'en';
}

interface Reminder {
  id: string;
  user_id: string;
  animalId: string;
  animalName: string;
  type: 'vaccination' | 'follow_up' | 'checkup' | 'medication';
  date: string;
  message: string;
  completed: boolean;
  created_at: string;
}

export const HealthReminderSystem = ({ language }: HealthReminderSystemProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = () => {
    // Load from localStorage for now - in real app would sync with backend
    const healthReminders = JSON.parse(localStorage.getItem('health-reminders') || '[]');
    const vaccinationReminders = JSON.parse(localStorage.getItem('vaccination-reminders') || '[]');
    const allReminders = [...healthReminders, ...vaccinationReminders];
    
    // Sort by date
    allReminders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setReminders(allReminders);
  };

  const markAsCompleted = (id: string) => {
    const updatedReminders = reminders.map(reminder => 
      reminder.id === id ? { ...reminder, completed: true } : reminder
    );
    setReminders(updatedReminders);
    
    // Update localStorage
    localStorage.setItem('health-reminders', JSON.stringify(updatedReminders.filter(r => r.type === 'follow_up')));
    localStorage.setItem('vaccination-reminders', JSON.stringify(updatedReminders.filter(r => r.type === 'vaccination')));
    
    toast.success(
      language === 'am' 
        ? '✅ አስታዋሽ ተጠናቋል' 
        : '✅ Reminder marked as completed'
    );
  };

  const deleteReminder = (id: string) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
    
    // Update localStorage
    localStorage.setItem('health-reminders', JSON.stringify(updatedReminders.filter(r => r.type === 'follow_up')));
    localStorage.setItem('vaccination-reminders', JSON.stringify(updatedReminders.filter(r => r.type === 'vaccination')));
    
    toast.success(
      language === 'am' 
        ? '✅ አስታዋሽ ተሰርዟል' 
        : '✅ Reminder deleted'
    );
  };

  const getUpcomingReminders = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.date);
      return !reminder.completed && reminderDate >= today && reminderDate <= nextWeek;
    });
  };

  const getOverdueReminders = () => {
    const today = new Date();
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.date);
      return !reminder.completed && reminderDate < today;
    });
  };

  const getDisplayReminders = () => {
    if (showCompleted) {
      return reminders.filter(r => r.completed);
    }
    return reminders.filter(r => !r.completed);
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'vaccination': return '💉';
      case 'follow_up': return '🔄';
      case 'checkup': return '🩺';
      case 'medication': return '💊';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-orange-100 text-orange-800';
      case 'checkup': return 'bg-green-100 text-green-800';
      case 'medication': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return language === 'am' ? 'ዛሬ' : 'Today';
    } else if (diffDays === 1) {
      return language === 'am' ? 'ነገ' : 'Tomorrow';
    } else if (diffDays === -1) {
      return language === 'am' ? 'ትናንት' : 'Yesterday';
    } else if (diffDays < 0) {
      return language === 'am' ? `${Math.abs(diffDays)} ቀናት በፊት` : `${Math.abs(diffDays)} days ago`;
    } else {
      return language === 'am' ? `በ ${diffDays} ቀናት ውስጥ` : `In ${diffDays} days`;
    }
  };

  const upcomingReminders = getUpcomingReminders();
  const overdueReminders = getOverdueReminders();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-700">{upcomingReminders.length}</div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'ቀሪ ስራዎች' : 'Upcoming'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-700">{overdueReminders.length}</div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'ያለፉ' : 'Overdue'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700">
              {reminders.filter(r => r.completed).length}
            </div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'ተጠናቅቀዋል' : 'Completed'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700">{reminders.length}</div>
            <p className="text-sm text-gray-600">
              {language === 'am' ? 'ጠቅላላ' : 'Total'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span>
                🔔 {language === 'am' ? 'የጤንነት አስታወሾች' : 'Health Reminders'}
              </span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted 
                ? (language === 'am' ? 'ቀሪዎችን አሳይ' : 'Show Pending')
                : (language === 'am' ? 'የተጠናቀቁትን አሳይ' : 'Show Completed')
              }
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {getDisplayReminders().length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {language === 'am' 
                  ? (showCompleted ? 'ምንም የተጠናቀቀ አስታዋሽ የለም' : 'ምንም አስታዋሽ የለም')
                  : (showCompleted ? 'No completed reminders' : 'No reminders found')
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {getDisplayReminders().map((reminder) => {
                const isOverdue = new Date(reminder.date) < new Date() && !reminder.completed;
                
                return (
                  <div
                    key={reminder.id}
                    className={`p-4 border rounded-lg transition-all ${
                      isOverdue 
                        ? 'border-red-300 bg-red-50' 
                        : reminder.completed
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getTypeEmoji(reminder.type)}</span>
                          <Badge className={getTypeColor(reminder.type)}>
                            {reminder.type}
                          </Badge>
                          <Badge variant="outline">
                            {reminder.animalName}
                          </Badge>
                          {isOverdue && (
                            <Badge className="bg-red-100 text-red-800">
                              {language === 'am' ? 'ያለፈ' : 'Overdue'}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="font-medium text-gray-900 mb-1">
                          {reminder.message}
                        </p>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(reminder.date)}</span>
                          <span>({new Date(reminder.date).toLocaleDateString()})</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {!reminder.completed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsCompleted(reminder.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
