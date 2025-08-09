
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Language } from '@/types';

interface InteractiveSummaryCardProps {
  title: string;
  titleAm: string;
  titleOr: string;
  titleSw: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'emerald';
  language: Language;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
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
  trend,
  subtitle
}: InteractiveSummaryCardProps) => {
  const getTitle = () => {
    switch (language) {
      case 'am': return titleAm;
      case 'or': return titleOr;
      case 'sw': return titleSw;
      default: return title;
    }
  };

  const colorClasses = {
    blue: {
      card: 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300',
      text: 'text-blue-700',
      accent: 'bg-blue-100 text-blue-700',
      icon: 'bg-white/80 text-blue-600 shadow-sm'
    },
    green: {
      card: 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 hover:border-green-300',
      text: 'text-green-700',
      accent: 'bg-green-100 text-green-700',
      icon: 'bg-white/80 text-green-600 shadow-sm'
    },
    purple: {
      card: 'border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 hover:border-purple-300',
      text: 'text-purple-700',
      accent: 'bg-purple-100 text-purple-700',
      icon: 'bg-white/80 text-purple-600 shadow-sm'
    },
    orange: {
      card: 'border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 hover:border-orange-300',
      text: 'text-orange-700',
      accent: 'bg-orange-100 text-orange-700',
      icon: 'bg-white/80 text-orange-600 shadow-sm'
    },
    red: {
      card: 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 hover:border-red-300',
      text: 'text-red-700',
      accent: 'bg-red-100 text-red-700',
      icon: 'bg-white/80 text-red-600 shadow-sm'
    },
    emerald: {
      card: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-300',
      text: 'text-emerald-700',
      accent: 'bg-emerald-100 text-emerald-700',
      icon: 'bg-white/80 text-emerald-600 shadow-sm'
    }
  };

  const classes = colorClasses[color];

  return (
    <Card 
      className={`${classes.card} ${onClick ? 'cursor-pointer hover:shadow-xl hover:scale-105 active:scale-95' : ''} transition-all duration-300 ease-in-out transform border-2 shadow-md group relative overflow-hidden`}
      onClick={onClick}
    >
      {/* Ethiopian pattern decoration */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
        <div className="absolute inset-0 bg-current transform rotate-45 translate-x-8 -translate-y-8"></div>
      </div>
      
      <CardContent className="p-4 sm:p-5 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className={`flex-shrink-0 p-2.5 rounded-xl ${classes.icon} group-hover:scale-110 transition-transform duration-200`}>
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs sm:text-sm font-semibold ${classes.text} truncate leading-tight`}>
                {getTitle()}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-600 truncate mt-0.5 opacity-75">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {trend && (
            <Badge className={`ml-2 flex-shrink-0 text-xs px-2 py-1 rounded-full ${
              trend.isPositive 
                ? 'bg-green-100 text-green-700 border-green-200' 
                : 'bg-red-100 text-red-700 border-red-200'
            }`}>
              <span className="mr-1">{trend.isPositive ? '↗' : '↘'}</span>
              <span className="font-medium">{Math.abs(trend.value)}%</span>
            </Badge>
          )}
        </div>
        
        <div className="flex items-end justify-between">
          <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${classes.text} leading-none`}>
            {value}
          </p>
          {onClick && (
            <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1 ml-2">
              <span className="hidden sm:inline">Click to view</span>
              <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
