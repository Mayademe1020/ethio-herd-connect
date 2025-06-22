
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface AnimalIdDisplayProps {
  animalId: string;
  showCopy?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
}

export const AnimalIdDisplay: React.FC<AnimalIdDisplayProps> = ({
  animalId,
  showCopy = false,
  variant = 'outline',
  size = 'default'
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(animalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy animal ID:', error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge 
        variant={variant} 
        className={`
          font-mono
          ${size === 'sm' ? 'text-xs px-2 py-1' : ''}
          ${size === 'lg' ? 'text-base px-3 py-2' : ''}
        `}
      >
        {animalId}
      </Badge>
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-600" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      )}
    </div>
  );
};
