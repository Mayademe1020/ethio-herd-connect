import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'md',
  label
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !disabled && onChange(star)}
            disabled={disabled}
            className={cn(
              'p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-gray-400'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
