
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface InteractiveSummaryCardProps {
  title: string;
  titleAm?: string;
  titleOr?: string;
  titleSw?: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange' | 'emerald';
  language: 'am' | 'en' | 'or' | 'sw';
  onClick?: () => void;
  disabled?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const InteractiveSummaryCard: React.FC<InteractiveSummaryCardProps> = ({
  title,
  titleAm,
  titleOr,
  titleSw,
  value,
  icon,
  color,
  language,
  onClick,
  disabled = false,
  trend
}) => {
  const getTitle = () => {
    switch (language) {
      case 'am':
        return titleAm || title;
      case 'or':
        return titleOr || title;
      case 'sw':
        return titleSw || title;
      default:
        return title;
    }
  };

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 hover:bg-blue-100',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      value: 'text-blue-700'
    },
    green: {
      bg: 'bg-green-50 hover:bg-green-100',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-900',
      value: 'text-green-700'
    },
    yellow: {
      bg: 'bg-yellow-50 hover:bg-yellow-100',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      text: 'text-yellow-900',
      value: 'text-yellow-700'
    },
    red: {
      bg: 'bg-red-50 hover:bg-red-100',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-900',
      value: 'text-red-700'
    },
    purple: {
      bg: 'bg-purple-50 hover:bg-purple-100',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-900',
      value: 'text-purple-700'
    },
    orange: {
      bg: 'bg-orange-50 hover:bg-orange-100',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      text: 'text-orange-900',
      value: 'text-orange-700'
    },
    emerald: {
      bg: 'bg-emerald-50 hover:bg-emerald-100',
      border: 'border-emerald-200',
      icon: 'text-emerald-600',
      text: 'text-emerald-900',
      value: 'text-emerald-700'
    }
  };

  const classes = colorClasses[color];

  return (
    <Card 
      className={`
        ${classes.border} ${onClick && !disabled ? classes.bg : 'bg-white'} 
        transition-all duration-300 
        ${onClick && !disabled ? 'cursor-pointer hover:scale-105 active:scale-95 hover:shadow-md' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        touch-manipulation
      `}
      onClick={onClick && !disabled ? onClick : undefined}
    >
      <CardContent className="p-2 sm:p-3 lg:p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className={`text-xs sm:text-sm font-medium ${classes.text} truncate mb-1`}>
              {getTitle()}
            </p>
            <div className="flex items-baseline space-x-1 sm:space-x-2">
              <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${classes.value} leading-none`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {trend && (
                <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '↗️' : '↘️'} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
          </div>
          <div className={`${classes.icon} flex-shrink-0 ml-2 sm:ml-3`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
