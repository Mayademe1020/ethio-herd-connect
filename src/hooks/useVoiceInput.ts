// src/hooks/useVoiceInput.ts - Hybrid voice input: Web Speech API (free) + Paid fallback

import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

type Language = 'am' | 'or' | 'en';

interface VoiceInputOptions {
  language?: Language;
  continuous?: boolean;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
}

interface VoiceInputState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
}

// Language codes for Web Speech API
const LANGUAGE_CODES: Record<Language, string> = {
  am: 'am-ET',  // Amharic
  or: 'om-ET',  // Oromo (Afan Oromo)
  en: 'en-US',  // English fallback
};

// Check if Web Speech API is available
const isWebSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

// Get SpeechRecognition constructor
const getSpeechRecognition = (): any => {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
};

export function useVoiceInput(options: VoiceInputOptions = {}) {
  const {
    language = 'am',
    continuous = false,
    onResult,
    onError,
  } = options;

  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    isSupported: isWebSpeechSupported(),
    transcript: '',
    confidence: 0,
    error: null,
  });

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = LANGUAGE_CODES[language];
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const transcript = finalTranscript || interimTranscript;
      const confidence = event.results[event.resultIndex]?.[0]?.confidence || 0;

      setState(prev => ({
        ...prev,
        transcript,
        confidence,
      }));

      if (finalTranscript && onResult) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      let errorMessage = 'Voice recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your device.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow access.';
          break;
        case 'network':
          errorMessage = 'Network error. Falling back to offline...';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }

      setState(prev => ({ ...prev, error: errorMessage, isListening: false }));
      
      if (onError) {
        onError(errorMessage);
      } else {
        toast.error('🎤 ' + errorMessage);
      }
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    return recognition;
  }, [language, continuous, onResult, onError]);

  // Start listening
  const startListening = useCallback(() => {
    if (!state.isSupported) {
      toast.error('🎤 Voice input not supported on this browser');
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = initRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    recognition.start();

    // Auto-stop after 10 seconds if not continuous
    if (!continuous) {
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 10000);
    }
  }, [state.isSupported, initRecognition, continuous]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
  };
}

export default useVoiceInput;
