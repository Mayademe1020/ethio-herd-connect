/**
 * Standard Form Select Component
 * 
 * Provides a consistent select dropdown with:
 * - Label with proper accessibility
 * - Select with validation
 * - Error message display
 * - Touch-friendly sizing (44x44px minimum)
 * - Consistent styling across the app
 * 
 * Optimized for Ethiopian farmers:
 * - Large touch targets
 * - Clear visual feedback
 * - Simple, consistent patterns
 * 
 * @module StandardFormSelect
 */

import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface StandardFormSelectProps {
  id: string;
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError;
  register?: UseFormRegister<any>;
  className?: string;
  helpText?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * Standard form select with label, dropdown, and error display
 * 
 * @example
 * ```typescript
 * <StandardFormSelect
 *   id="animal-type"
 *   name="type"
 *   label="Animal Type"
 *   options={[
 *     { value: 'cattle', label: 'Cattle' },
 *     { value: 'goat', label: 'Goat' },
 *     { value: 'sheep', label: 'Sheep' }
 *   ]}
 *   required
 *   register={register}
 *   error={errors.type}
 * />
 * ```
 */
export const StandardFormSelect: React.FC<StandardFormSelectProps> = ({
  id,
  name,
  label,
  options,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error,
  register,
  className,
  helpText,
  value,
  onChange,
}) => {
  const selectProps = register ? register(name) : { name, value, onChange };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <Label 
        htmlFor={id}
        className={cn(
          'block text-sm font-medium',
          error ? 'text-red-600' : 'text-gray-700',
          required && "after:content-['*'] after:ml-0.5 after:text-red-500"
        )}
      >
        {label}
      </Label>

      {/* Select Wrapper */}
      <div className="relative">
        <select
          id={id}
          disabled={disabled}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${id}-error` : helpText ? `${id}-help` : undefined
          }
          className={cn(
            'flex h-12 w-full', // Touch-friendly height (48px)
            'rounded-md border border-input bg-background',
            'px-3 py-2 text-base',
            'ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'appearance-none', // Remove default arrow
            'pr-10', // Space for custom arrow
            'transition-colors',
            error && 'border-red-500 focus-visible:ring-red-500',
            disabled && 'bg-gray-100 cursor-not-allowed'
          )}
          {...selectProps}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Arrow Icon */}
        <ChevronDown 
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'w-5 h-5 text-gray-400 pointer-events-none',
            disabled && 'opacity-50'
          )}
        />
      </div>

      {/* Help Text */}
      {helpText && !error && (
        <p 
          id={`${id}-help`}
          className="text-xs text-gray-500"
        >
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <div 
          id={`${id}-error`}
          className="flex items-start gap-1.5 text-red-600"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">
            {error.message}
          </p>
        </div>
      )}
    </div>
  );
};
