// Animal ID Badge Component
// Displays animal ID with copy functionality

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface AnimalIdBadgeProps {
  animalId: string;
  size?: 'sm' | 'md' | 'lg';
  showCopyButton?: boolean;
  className?: string;
}

export const AnimalIdBadge: React.FC<AnimalIdBadgeProps> = ({
  animalId,
  size = 'md',
  showCopyButton = true,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslations();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(animalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md font-mono ${sizeClasses[size]} ${className}`}>
      <span className="text-blue-900 font-semibold select-all">
        {animalId}
      </span>
      
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className="text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
          title={copied ? t('ID copied!') : t('Copy ID')}
          aria-label={copied ? t('ID copied!') : t('Copy ID')}
        >
          {copied ? (
            <Check className={`${iconSizes[size]} text-green-600`} />
          ) : (
            <Copy className={iconSizes[size]} />
          )}
        </button>
      )}
    </div>
  );
};
