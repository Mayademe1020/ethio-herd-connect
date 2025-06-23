
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Language } from '@/types';

interface InteractiveSummaryCardProps {
  title: string;
  titleAm: string;
  titleOr?: string;
  titleSw?: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange' | 'emerald';
  language: Language;
  onClick?: () => void;
  disabled?: boolean;
}

export const InteractiveSummaryCard = ({
  title,
  titleAm,
  titleOr,
  titleSw,
  value,
  icon,
  color,
  language,
  onClick,
  disabled = false
}: InteractiveSummaryCardProps) => {
  const getTitle = () => {
    switch (language) {
      case 'am':
        return titleAm;
      case 'or':
        return titleOr || title;
      case 'sw':
        return titleSw || title;
      default:
        return title;
    }
  };

  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    red: 'bg-red-500 text-white',
    purple: 'bg-purple-500 text-white',
    orange: 'bg-orange-500 text-white',
    emerald: 'bg-emerald-500 text-white'
  };

  const hoverClasses = {
    blue: 'hover:bg-blue-600',
    green: 'hover:bg-green-600',
    yellow: 'hover:bg-yellow-600',
    red: 'hover:bg-red-600',
    purple: 'hover:bg-purple-600',
    orange: 'hover:bg-orange-600',
    emerald: 'hover:bg-emerald-600'
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-300 cursor-pointer",
        onClick && !disabled && "hover:scale-105 active:scale-95 hover:shadow-lg",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={cn(
            "flex-shrink-0 p-2 sm:p-3 rounded-lg transition-colors",
            colorClasses[color],
            onClick && !disabled && hoverClasses[color]
          )}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate mb-1">
              {getTitle()}
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
