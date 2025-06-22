
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Home, Heart, TrendingUp, ShoppingCart, Baby, Users, X } from 'lucide-react';
import { AnimalRegistrationForm } from './AnimalRegistrationForm';
import { CalfRegistrationForm } from './CalfRegistrationForm';
import { PoultryGroupForm } from './PoultryGroupForm';

interface QuickActionsProps {
  language: 'am' | 'en';
  onActionComplete?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ language, onActionComplete }) => {
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [showCalfForm, setShowCalfForm] = useState(false);
  const [showPoultryForm, setShowPoultryForm] = useState(false);

  const actions = [
    {
      id: 'register-animal',
      title: language === 'am' ? 'እንስሳ ምዝገባ' : 'Register Animal',
      icon: <Home className="w-4 h-4 sm:w-5 sm:h-5" />,
      action: () => setShowAnimalForm(true),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'register-calf',
      title: language === 'am' ? 'ጥጃ ምዝገባ' : 'Register Calf',
      icon: <Baby className="w-4 h-4 sm:w-5 sm:h-5" />,
      action: () => setShowCalfForm(true),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'poultry-group',
      title: language === 'am' ? 'የዶሮ ቡድን' : 'Poultry Group',
      icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />,
      action: () => setShowPoultryForm(true),
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  const handleActionComplete = () => {
    onActionComplete?.();
    setShowAnimalForm(false);
    setShowCalfForm(false);
    setShowPoultryForm(false);
  };

  return (
    <>
      <Card className="animate-slideInUp animation-delay-300">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span>{language === 'am' ? 'ፈጣን እርምጃዎች' : 'Quick Actions'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {actions.map((action, index) => (
              <Button
                key={action.id}
                onClick={action.action}
                className={`
                  ${action.color} 
                  text-white 
                  transition-all 
                  duration-300 
                  hover:scale-105 
                  hover:shadow-lg 
                  active:scale-95 
                  flex 
                  items-center 
                  space-x-2 
                  animate-slideInUp
                  h-12 sm:h-auto
                  text-xs sm:text-sm
                  px-3 sm:px-4
                  py-2 sm:py-3
                `}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                {action.icon}
                <span className="font-medium">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {showAnimalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnimalForm(false)}
              className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white shadow-sm"
            >
              <X className="w-4 h-4" />
            </Button>
            <AnimalRegistrationForm
              language={language}
              onClose={() => setShowAnimalForm(false)}
              onSuccess={handleActionComplete}
            />
          </div>
        </div>
      )}

      {showCalfForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCalfForm(false)}
              className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white shadow-sm"
            >
              <X className="w-4 h-4" />
            </Button>
            <CalfRegistrationForm
              language={language}
              onClose={() => setShowCalfForm(false)}
              onSuccess={handleActionComplete}
            />
          </div>
        </div>
      )}

      {showPoultryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPoultryForm(false)}
              className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white shadow-sm"
            >
              <X className="w-4 h-4" />
            </Button>
            <PoultryGroupForm
              language={language}
              onClose={() => setShowPoultryForm(false)}
              onSuccess={handleActionComplete}
            />
          </div>
        </div>
      )}
    </>
  );
};
