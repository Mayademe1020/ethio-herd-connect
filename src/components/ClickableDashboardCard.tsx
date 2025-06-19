
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClickableDashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
  navigateTo?: string;
  subtitle?: string;
  currency?: boolean;
  className?: string;
}

export const ClickableDashboardCard: React.FC<ClickableDashboardCardProps> = ({
  title,
  value,
  icon,
  onClick,
  navigateTo,
  subtitle,
  currency = false,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (navigateTo) {
      navigate(navigateTo);
    }
  };

  const formatValue = (val: string | number) => {
    if (currency && typeof val === 'number') {
      return `ETB ${val.toLocaleString()}`;
    }
    return val;
  };

  return (
    <Card 
      className={`
        cursor-pointer 
        transition-all 
        duration-300 
        ease-in-out 
        hover:shadow-lg 
        hover:scale-105 
        hover:bg-gradient-to-br 
        hover:from-green-50 
        hover:to-emerald-50 
        active:scale-95 
        group
        ${className}
      `}
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-green-700 transition-colors duration-200">
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <div className="text-green-600 group-hover:text-green-700 transition-colors duration-200">
            {icon}
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-all duration-200 transform group-hover:translate-x-1" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 group-hover:text-green-800 transition-colors duration-200">
          {formatValue(value)}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 group-hover:text-green-600 transition-colors duration-200 mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
