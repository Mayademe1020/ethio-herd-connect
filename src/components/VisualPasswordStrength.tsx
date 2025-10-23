import React from 'react';
import { Shield, Check, X } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface VisualPasswordStrengthProps {
  password: string;
}

export const VisualPasswordStrength: React.FC<VisualPasswordStrengthProps> = ({ password }) => {
  const { t } = useTranslations();
  
  // Calculate password strength
  const getStrength = (): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check (most important for low-literacy users)
    if (password.length >= 4) strength += 1;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    
    // Simple character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(5, strength);
  };
  
  const strength = getStrength();
  
  // Visual representation for low-literacy users
  const getColor = () => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getIcon = () => {
    if (strength <= 1) return <X className="h-5 w-5 text-red-500" />;
    if (strength <= 3) return <Shield className="h-5 w-5 text-yellow-500" />;
    return <Check className="h-5 w-5 text-green-500" />;
  };
  
  const getMessage = () => {
    if (strength <= 1) return t('password.veryWeak', 'Very weak');
    if (strength === 2) return t('password.weak', 'Weak');
    if (strength === 3) return t('password.fair', 'Fair');
    if (strength === 4) return t('password.good', 'Good');
    return t('password.strong', 'Strong');
  };
  
  // Visual indicators (animals) for Ethiopian farmers
  const getAnimalIcon = () => {
    if (strength <= 1) return '🐁'; // Mouse (weak)
    if (strength === 2) return '🐐'; // Goat (moderate)
    if (strength === 3) return '🐄'; // Cow (good)
    if (strength === 4) return '🦬'; // Buffalo (strong)
    return '🦁'; // Lion (very strong)
  };

  return (
    <div className="mt-2">
      {/* Visual strength meter */}
      <div className="flex items-center mb-1">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${getColor()}`} 
            style={{ width: `${(strength / 5) * 100}%` }}
          ></div>
        </div>
        <span className="ml-2 text-xl">{getAnimalIcon()}</span>
      </div>
      
      {/* Simple text feedback */}
      <div className="flex items-center text-sm">
        {getIcon()}
        <span className="ml-1">{getMessage()}</span>
      </div>
      
      {/* Visual tips for low-literacy users */}
      {strength <= 3 && (
        <div className="mt-2 text-sm">
          <div className="flex items-center mb-1">
            <span className="mr-1">📏</span>
            <span>{t('password.lengthTip', 'Longer is better')}</span>
          </div>
          {strength <= 2 && (
            <div className="flex items-center mb-1">
              <span className="mr-1">🔤</span>
              <span>{t('password.mixTip', 'Mix letters and numbers')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisualPasswordStrength;