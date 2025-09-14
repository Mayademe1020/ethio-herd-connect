import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveSpacingProps {
  children: React.ReactNode;
  className?: string;
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'vertical' | 'horizontal' | 'both';
}

export const ResponsiveSpacing = ({ 
  children, 
  className,
  space = 'md',
  direction = 'vertical'
}: ResponsiveSpacingProps) => {
  const spaceClasses = {
    xs: {
      vertical: 'space-y-1 sm:space-y-2',
      horizontal: 'space-x-1 sm:space-x-2', 
      both: 'space-y-1 sm:space-y-2 space-x-1 sm:space-x-2'
    },
    sm: {
      vertical: 'space-y-2 sm:space-y-3',
      horizontal: 'space-x-2 sm:space-x-3',
      both: 'space-y-2 sm:space-y-3 space-x-2 sm:space-x-3'
    },
    md: {
      vertical: 'space-y-3 sm:space-y-4 lg:space-y-6',
      horizontal: 'space-x-3 sm:space-x-4 lg:space-x-6',
      both: 'space-y-3 sm:space-y-4 lg:space-y-6 space-x-3 sm:space-x-4 lg:space-x-6'
    },
    lg: {
      vertical: 'space-y-4 sm:space-y-6 lg:space-y-8',
      horizontal: 'space-x-4 sm:space-x-6 lg:space-x-8',
      both: 'space-y-4 sm:space-y-6 lg:space-y-8 space-x-4 sm:space-x-6 lg:space-x-8'
    },
    xl: {
      vertical: 'space-y-6 sm:space-y-8 lg:space-y-12',
      horizontal: 'space-x-6 sm:space-x-8 lg:space-x-12',
      both: 'space-y-6 sm:space-y-8 lg:space-y-12 space-x-6 sm:space-x-8 lg:space-x-12'
    }
  };

  return (
    <div className={cn(
      spaceClasses[space][direction],
      className
    )}>
      {children}
    </div>
  );
};