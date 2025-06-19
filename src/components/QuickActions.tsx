import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Home, Heart, TrendingUp, ShoppingCart, Baby, Users } from 'lucide-react';
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
      icon: <Home className="w-5 h-5" />,
      action: () => setShowAnimalForm(true),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'register-calf',
      title: language === 'am' ? 'ጥጃ ምዝገባ' : 'Register Calf',
      icon: <Baby className="w-5 h-5" />,
      action: () => setShowCalfForm(true),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'poultry-group',
      title: language === 'am' ? 'የዶሮ ቡድን' : 'Poultry Group',
      icon: <Users className="w-5 h-5" />,
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
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-600" />
            <span>{language === 'am' ? 'ፈጣን እርምጃዎች' : 'Quick Actions'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                `}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                {action.icon}
                <span className="text-sm">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {showAnimalForm && (
        <AnimalRegistrationForm
          language={language}
          onClose={() => setShowAnimalForm(false)}
          onSuccess={handleActionComplete}
        />
      )}

      {showCalfForm && (
        <CalfRegistrationForm
          language={language}
          onClose={() => setShowCalfForm(false)}
          onSuccess={handleActionComplete}
        />
      )}

      {showPoultryForm && (
        <PoultryGroupForm
          language={language}
          onClose={() => setShowPoultryForm(false)}
          onSuccess={handleActionComplete}
        />
      )}
    </>
  );
};
