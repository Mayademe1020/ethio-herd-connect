
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InteractiveSummaryCardProps {
  title: string;
  titleAm: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  badge?: string;
  badgeAm?: string;
  navigateTo?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  currency?: boolean;
}

export const InteractiveSummaryCard: React.FC<InteractiveSummaryCardProps> = ({
  title,
  titleAm,
  value,
  icon,
  color = 'green',
  badge,
  badgeAm,
  navigateTo,
  onClick,
  disabled = false,
  className = '',
  currency = false,
  ...props
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else if (navigateTo) {
      navigate(navigateTo);
    }
  };

  const formatValue = (val: number | string) => {
    if (currency && typeof val === 'number') {
      return `₹${val.toLocaleString()}`;
    }
    return val;
  };

  const colorClasses = {
    green: disabled ? 'border-gray-200 bg-gray-50' : 'border-green-200 hover:border-green-300 hover:bg-green-50',
    blue: disabled ? 'border-gray-200 bg-gray-50' : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50',
    orange: disabled ? 'border-gray-200 bg-gray-50' : 'border-orange-200 hover:border-orange-300 hover:bg-orange-50',
    red: disabled ? 'border-gray-200 bg-gray-50' : 'border-red-200 hover:border-red-300 hover:bg-red-50',
    purple: disabled ? 'border-gray-200 bg-gray-50' : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50',
    yellow: disabled ? 'border-gray-200 bg-gray-50' : 'border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50',
    teal: disabled ? 'border-gray-200 bg-gray-50' : 'border-teal-200 hover:border-teal-300 hover:bg-teal-50',
    emerald: disabled ? 'border-gray-200 bg-gray-50' : 'border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50',
  };

  const iconColorClasses = {
    green: disabled ? 'text-gray-400' : 'text-green-600',
    blue: disabled ? 'text-gray-400' : 'text-blue-600',
    orange: disabled ? 'text-gray-400' : 'text-orange-600',
    red: disabled ? 'text-gray-400' : 'text-red-600',
    purple: disabled ? 'text-gray-400' : 'text-purple-600',
    yellow: disabled ? 'text-gray-400' : 'text-yellow-600',
    teal: disabled ? 'text-gray-400' : 'text-teal-600',
    emerald: disabled ? 'text-gray-400' : 'text-emerald-600',
  };

  if (disabled && value === 0) {
    return (
      <Card className={`opacity-50 cursor-not-allowed border-gray-200 bg-gray-50 ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-2 sm:px-4 sm:py-3">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">
            {titleAm}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5">
              {icon}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-2 sm:px-4 sm:py-3">
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-400">
            {formatValue(value)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`
        cursor-pointer 
        transition-all 
        duration-300 
        ease-in-out 
        transform
        hover:shadow-xl 
        hover:scale-105 
        active:scale-95 
        border-2
        ${colorClasses[color as keyof typeof colorClasses]}
        touch-manipulation
        min-h-[120px] sm:min-h-[140px] lg:min-h-[160px]
        ${className}
      `}
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-2 sm:px-4 sm:py-3">
        <CardTitle className={`text-xs sm:text-sm font-medium transition-colors duration-200 ${
          disabled ? 'text-gray-400' : 'text-gray-600 group-hover:text-green-700'
        }`}>
          {titleAm}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <div className={`transition-colors duration-200 w-4 h-4 sm:w-5 sm:h-5 ${
            iconColorClasses[color as keyof typeof iconColorClasses]
          }`}>
            {icon}
          </div>
          {!disabled && (
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-green-600 transition-all duration-200 transform group-hover:translate-x-1" />
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 py-2 sm:px-4 sm:py-3 space-y-2">
        <div className={`text-xl sm:text-2xl lg:text-3xl font-bold transition-colors duration-200 ${
          disabled ? 'text-gray-400' : 'text-gray-900 group-hover:text-green-800'
        }`}>
          {formatValue(value)}
        </div>
        {badge && !disabled && (
          <Badge className={`text-xs transition-colors duration-200 ${
            color === 'green' ? 'bg-green-100 text-green-800' :
            color === 'blue' ? 'bg-blue-100 text-blue-800' :
            color === 'orange' || color === 'red' ? 'bg-orange-100 text-orange-800' :
            color === 'purple' ? 'bg-purple-100 text-purple-800' :
            color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
            color === 'teal' ? 'bg-teal-100 text-teal-800' :
            'bg-emerald-100 text-emerald-800'
          }`}>
            {badgeAm || badge}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
