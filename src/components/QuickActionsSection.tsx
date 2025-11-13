// src/components/QuickActionsSection.tsx - Quick action buttons for profile page

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Droplet, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

interface QuickActionsSectionProps {
  hasAnimals: boolean;
}

interface QuickAction {
  icon: React.ReactNode;
  labelKey: string;
  path: string;
  requiresAnimals: boolean;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ hasAnimals }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      icon: <PlusCircle className="w-5 h-5" />,
      labelKey: 'profile.registerAnimal',
      path: '/register-animal',
      requiresAnimals: false
    },
    {
      icon: <Droplet className="w-5 h-5" />,
      labelKey: 'profile.recordMilk',
      path: '/record-milk',
      requiresAnimals: true
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      labelKey: 'profile.createListing',
      path: '/create-listing',
      requiresAnimals: true
    }
  ];

  const handleAction = (action: QuickAction) => {
    // Check if action requires animals and user has none
    if (action.requiresAnimals && !hasAnimals) {
      toast.error(t('profile.pleaseRegisterAnimalsFirst'));
      return;
    }
    
    // Navigate to the action's path
    navigate(action.path);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t('profile.quickActions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(action)}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors active:scale-95"
              style={{ minWidth: '44px', minHeight: '44px' }}
              aria-label={t(action.labelKey)}
            >
              <div className="text-green-600 mb-2">{action.icon}</div>
              <span className="text-sm text-center font-medium text-gray-700">
                {t(action.labelKey)}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsSection;
