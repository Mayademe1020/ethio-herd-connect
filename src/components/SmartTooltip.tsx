// src/components/SmartTooltip.tsx
// Drop-in help tooltip component
// Usage: <SmartTooltip helpKey="..."><YourComponent /></SmartTooltip>

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { helpContent } from '@/config/onboarding.config';
import { cn } from '@/lib/utils';

interface SmartTooltipProps {
  helpKey: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({ 
  helpKey, 
  children, 
  position = 'top',
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isHelpDismissed, dismissHelp } = useOnboarding();
  const { language } = useLanguage();
  
  const help = helpContent.find(h => h.key === helpKey);
  
  if (!help || isHelpDismissed(helpKey)) {
    return <>{children}</>;
  }
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };
  
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800'
  };

  return (
    <div 
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      
      {/* Help icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-emerald-600 transition-colors shadow-sm z-10"
      >
        <HelpCircle className="w-3 h-3" />
      </button>
      
      {/* Tooltip */}
      {isOpen && (
        <div 
          className={cn(
            'absolute z-50 w-64 p-4 bg-gray-800 text-white rounded-lg shadow-xl',
            'animate-in fade-in zoom-in-95 duration-200',
            positionClasses[position]
          )}
        >
          {/* Arrow */}
          <div 
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              arrowClasses[position]
            )}
          />
          
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-sm">
              {help.title[language]}
            </h4>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Content */}
          <p className="text-sm text-gray-200 mb-3">
            {help.content[language]}
          </p>
          
          {/* Dismiss button */}
          <button
            onClick={() => {
              dismissHelp(helpKey);
              setIsOpen(false);
            }}
            className="text-xs text-gray-400 hover:text-white underline"
          >
            Don't show again
          </button>
        </div>
      )}
    </div>
  );
};

// Simpler inline version for forms
export const HelpText: React.FC<{
  helpKey: string;
  className?: string;
}> = ({ helpKey, className }) => {
  const { language } = useLanguage();
  const help = helpContent.find(h => h.key === helpKey);
  
  if (!help) return null;
  
  return (
    <p className={cn("text-xs text-gray-500 mt-1 flex items-center gap-1", className)}>
      <HelpCircle className="w-3 h-3" />
      {help.content[language]}
    </p>
  );
};
