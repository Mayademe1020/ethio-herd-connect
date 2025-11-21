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
  gradient: string;
  iconBg: string;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ hasAnimals }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      icon: <PlusCircle className="w-7 h-7" />,
      labelKey: 'profile.registerAnimal',
      path: '/register-animal',
      requiresAnimals: false,
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconBg: 'bg-white/20 backdrop-blur-sm'
    },
    {
      icon: <Droplet className="w-7 h-7" />,
      labelKey: 'profile.recordMilk',
      path: '/record-milk',
      requiresAnimals: true,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconBg: 'bg-white/20 backdrop-blur-sm'
    },
    {
      icon: <ShoppingBag className="w-7 h-7" />,
      labelKey: 'profile.createListing',
      path: '/create-listing',
      requiresAnimals: true,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconBg: 'bg-white/20 backdrop-blur-sm'
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
        <CardTitle className="text-2xl font-bold text-gray-900">{t('profile.quickActions')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(action)}
              className={`
                ${action.gradient} rounded-xl p-6 shadow-lg hover:shadow-xl
                interactive-lift btn-press
                h-35 min-h-[140px] flex flex-col items-center justify-center
              `}
              style={{ maxHeight: '140px' }}
              aria-label={t(action.labelKey)}
            >
              {/* Icon with glass morphism effect */}
              <div className={`
                w-14 h-14 rounded-xl ${action.iconBg}
                flex items-center justify-center mb-4
              `}>
                <div className="text-white">
                  {action.icon}
                </div>
              </div>
              
              {/* Text with proper hierarchy */}
              <h3 className="text-lg font-semibold text-white text-center">
                {t(action.labelKey)}
              </h3>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsSection;
