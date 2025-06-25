
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
  onClick
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
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  };

  return (
    <Card 
      className={`${colorClasses[color]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
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
