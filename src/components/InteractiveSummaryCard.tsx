
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    blue: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300',
    green: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-300',
    purple: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300',
    orange: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300',
    red: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
  };

  return (
    <Card 
      className={`${colorClasses[color]} ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95' : ''} transition-all duration-200 ease-in-out transform border-2`}
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex-shrink-0 p-2 rounded-lg bg-white/50">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                {getTitle()}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-500 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
              trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <span className={trend.isPositive ? '↗' : '↘'}></span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="flex items-end justify-between">
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            {value}
          </p>
          {onClick && (
            <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to view →
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
