// src/components/VoiceInputButton.tsx - Voice input button for forms

import { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';

type Language = 'am' | 'or' | 'en';

interface VoiceInputButtonProps {
  onResult: (text: string) => void;
  language?: Language;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VoiceInputButton({
  onResult,
  language = 'am',
  size = 'md',
  className = '',
}: VoiceInputButtonProps) {
  const [pulse, setPulse] = useState(false);

  const { isListening, isSupported, transcript, toggleListening } = useVoiceInput({
    language,
    continuous: false,
    onResult: (text) => {
      onResult(text);
      setPulse(false);
    },
    onError: () => {
      setPulse(false);
    },
  });

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = () => {
    setPulse(true);
    toggleListening();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        transition-all
        ${isListening 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
          : 'bg-blue-500 hover:bg-blue-600'
        }
        text-white shadow-lg
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        ${className}
      `}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      title={isListening ? 'እስቶ ይናገሩ / Tap to stop' : 'ድምጽ አስገባ / Tap to speak'}
    >
      {isListening ? (
        <MicOff className={iconSizes[size]} />
      ) : (
        <Mic className={iconSizes[size]} />
      )}
    </button>
  );
}

export default VoiceInputButton;
