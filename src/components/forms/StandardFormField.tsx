/**
 * Standard Form Field Component
 * 
 * Provides a consistent form field with:
 * - Label with proper accessibility
 * - Input with validation
 * - Error message display
 * - Touch-friendly sizing (44x44px minimum)
 * - Consistent styling across the app
 * 
 * Optimized for Ethiopian farmers:
 * - Large touch targets
 * - Clear visual feedback
 * - Simple, consistent patterns
 * 
 * @module StandardFormField
 */

import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface StandardFormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError;
  register?: UseFormRegister<any>;
  className?: string;
  helpText?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Standard form field with label, input, and error display
 * 
 * @example
 * ```typescript
 * <StandardFormField
 *   id="animal-name"
 *   name="name"
 *   label="Animal Name"
 *   placeholder="Enter animal name"
 *   required
 *   register={register}
 *   error={errors.name}
 * />
 * ```
 */
export const StandardFormField: React.FC<StandardFormFieldProps> = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  register,
  className,
  helpText,
  value,
  onChange,
}) => {
  const inputProps = register ? register(name) : { name, value, onChange };

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

      {/* Input */}
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? `${id}-error` : helpText ? `${id}-help` : undefined
        }
        className={cn(
          'min-h-[48px]', // Touch-friendly height (48px > 44px minimum)
          'text-base', // Readable text size
          'transition-colors',
          error && 'border-red-500 focus-visible:ring-red-500',
          disabled && 'bg-gray-100 cursor-not-allowed'
        )}
        {...inputProps}
      />

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
