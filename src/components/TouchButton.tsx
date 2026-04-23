/**
 * Touch-friendly button component optimized for mobile users
 * Ensures minimum touch target size for accessibility
 */

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
}

const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 
      rounded-lg text-base font-semibold ring-offset-background 
      transition-colors focus-visible:outline-none focus-visible:ring-2 
      focus-visible:ring-ring focus-visible:ring-offset-2 
      disabled:pointer-events-none disabled:opacity-50
      touch-manipulation select-none
    `;

    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      link: 'text-primary underline-offset-4 hover:underline'
    };

    const sizes = {
      default: 'h-12 px-6 py-3 min-h-[56px]',
      sm: 'h-10 px-4 py-2 min-h-[44px]',
      lg: 'h-14 px-8 py-4 min-h-[64px]',
      xl: 'h-16 px-10 py-5 min-h-[72px]',
      icon: 'h-12 w-12 min-h-[56px] min-w-[56px]'
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinnerMini />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

TouchButton.displayName = 'TouchButton';

// Mini spinner for loading state
const LoadingSpinnerMini = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export { TouchButton };
export type { TouchButtonProps };
