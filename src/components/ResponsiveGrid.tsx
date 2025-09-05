import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'cards' | 'stats' | 'marketplace' | 'animals';
}

export const ResponsiveGrid = ({ children, className, variant = 'cards' }: ResponsiveGridProps) => {
  const gridVariants = {
    cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6',
    stats: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4',
    marketplace: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6',
    animals: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6'
  };

  return (
    <div className={cn(gridVariants[variant], className)}>
      {children}
    </div>
  );
};

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'narrow' | 'wide' | 'full';
}

export const ResponsiveContainer = ({ children, className, variant = 'default' }: ResponsiveContainerProps) => {
  const containerVariants = {
    default: 'container-responsive',
    narrow: 'container-narrow',
    wide: 'container-wide',
    full: 'w-full px-4 sm:px-6 lg:px-8'
  };

  return (
    <div className={cn(containerVariants[variant], className)}>
      {children}
    </div>
  );
};

interface ResponsiveSpacingProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'y' | 'x' | 'all';
}

export const ResponsiveSpacing = ({ 
  children, 
  className, 
  variant = 'md', 
  direction = 'y' 
}: ResponsiveSpacingProps) => {
  const spacingVariants = {
    sm: {
      y: 'space-y-2 md:space-y-3',
      x: 'space-x-2 md:space-x-3',
      all: 'gap-2 md:gap-3'
    },
    md: {
      y: 'space-y-3 md:space-y-4 lg:space-y-6',
      x: 'space-x-2 md:space-x-3 lg:space-x-4',
      all: 'gap-3 md:gap-4 lg:gap-6'
    },
    lg: {
      y: 'space-y-4 md:space-y-6 lg:space-y-8',
      x: 'space-x-3 md:space-x-4 lg:space-x-6',
      all: 'gap-4 md:gap-6 lg:gap-8'
    },
    xl: {
      y: 'space-y-6 md:space-y-8 lg:space-y-12',
      x: 'space-x-4 md:space-x-6 lg:space-x-8',
      all: 'gap-6 md:gap-8 lg:gap-12'
    }
  };

  return (
    <div className={cn(spacingVariants[variant][direction], className)}>
      {children}
    </div>
  );
};