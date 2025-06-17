
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface QuickActionsProps {
  language: 'am' | 'en';
}

export const QuickActions = ({ language }: QuickActionsProps) => {
  const actions = [
    {
      icon: '📷',
      titleAm: 'እንስሳ ምዝገባ',
      titleEn: 'Register Animal',
      descAm: 'አዲስ ከብት ወይም ዶሮ ጨምር',
      descEn: 'Add new cattle or poultry',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '💉',
      titleAm: 'ጅምላ ክትባት',
      titleEn: 'Bulk Vaccination',
      descAm: 'ብዙ እንስሳትን በአንድ ላይ ክተቡ',
      descEn: 'Vaccinate multiple animals',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '🩺',
      titleAm: 'ጤንነት ምዘና',
      titleEn: 'Health Check',
      descAm: 'ምልክቶችን ይመዝግቡ',
      descEn: 'Record symptoms',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: '📊',
      titleAm: 'የእድገት መከታተያ',
      titleEn: 'Growth Tracking',
      descAm: 'ክብደት እና ምርት ይመዝግቡ',
      descEn: 'Record weight and production',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '🛒',
      titleAm: 'ለሽያጭ ይለጥፉ',
      titleEn: 'Post for Sale',
      descAm: 'እንስሳትዎን ይሽጡ',
      descEn: 'Sell your animals',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: '👥',
      titleAm: 'የእርዳታ ማግኛ',
      titleEn: 'Get Help',
      descAm: 'የዶክተር ምክር ያግኙ',
      descEn: 'Get veterinary advice',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <Card className="border-green-100">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {language === 'am' ? 'ፈጣን እርምጃዎች' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-lg transition-all duration-300 hover:scale-105 border-gray-200"
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center text-white text-xl mb-2`}>
                {action.icon}
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 text-sm">
                  {language === 'am' ? action.titleAm : action.titleEn}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {language === 'am' ? action.descAm : action.descEn}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
