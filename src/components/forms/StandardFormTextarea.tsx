/**
 * Standard Form Textarea Component
 * 
 * Provides a consistent textarea with:
 * - Label with proper accessibility
 * - Textarea with validation
 * - Error message display
 * - Touch-friendly sizing
 * - Consistent styling across the app
 * - Character count (optional)
 * 
 * Optimized for Ethiopian farmers:
 * - Large touch targets
 * - Clear visual feedback
 * - Simple, consistent patterns
 * 
 * @module StandardFormTextarea
 */

import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface StandardFormTextareaProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError;
  register?: UseFormRegister<any>;
  className?: string;
  helpText?: string;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

/**
 * Standard form textarea with label, input, and error display
 * 
 * @example
 * ```typescript
 * <StandardFormTextarea
 *   id="animal-notes"
 *   name="notes"
 *   label="Notes"
 *   placeholder="Enter any additional notes"
 *   rows={4}
 *   maxLength={500}
 *   showCharCount
 *   register={register}
 *   error={errors.notes}
 * />
 * ```
 */
export const StandardFormTextarea: React.FC<StandardFormTextareaProps> = ({
  id,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  error,
  register,
  className,
  helpText,
  rows = 4,
  maxLength,
  showCharCount = false,
  value,
  onChange,
}) => {
  const [charCount, setCharCount] = React.useState(0);
  const textareaProps = register ? register(name) : { name, value, onChange };

  // Track character count
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    if (onChange) {
      onChange(e);
    }
  };

  React.useEffect(() => {
    if (value) {
      setCharCount(String(value).length);
    }
  }, [value]);

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <div className="flex items-center justify-between">
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

        {/* Character Count */}
        {showCharCount && maxLength && (
          <span 
            className={cn(
              'text-xs',
              charCount > maxLength ? 'text-red-600 font-medium' : 'text-gray-500'
            )}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>

      {/* Textarea */}
      <Textarea
        id={id}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          error ? `${id}-error` : helpText ? `${id}-help` : undefined
        }
        className={cn(
          'min-h-[100px]', // Minimum height for usability
          'text-base', // Readable text size
          'resize-y', // Allow vertical resize
          'transition-colors',
          error && 'border-red-500 focus-visible:ring-red-500',
          disabled && 'bg-gray-100 cursor-not-allowed'
        )}
        {...textareaProps}
        onChange={(e) => {
          handleChange(e);
          if (textareaProps.onChange) {
            textareaProps.onChange(e);
          }
        }}
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
