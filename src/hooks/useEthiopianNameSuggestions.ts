import { useState, useCallback } from 'react';
import { ethiopianNames } from '@/data/ethiopianNames';

interface NameSuggestion {
  name: string;
  meaning: string;
}

interface UseEthiopianNameSuggestionsProps {
  gender: 'male' | 'female' | null;
}

export const useEthiopianNameSuggestions = ({ gender }: UseEthiopianNameSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<NameSuggestion[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  // Filter names based on gender and input
  const filterNames = useCallback((value: string): NameSuggestion[] => {
    if (!gender || !value.trim()) {
      return [];
    }

    const lowerValue = value.toLowerCase().trim();
    const names = ethiopianNames[gender as keyof typeof ethiopianNames];

    // Return names that start with the input value (case insensitive)
    return names
      .filter(({ name }) => name.toLowerCase().startsWith(lowerValue))
      .slice(0, 5); // Limit to 5 suggestions
  }, [gender]);

  // Update suggestions when input or gender changes
  const updateSuggestions = useCallback((value: string) => {
    setInputValue(value);
    setSuggestions(filterNames(value));
  }, [filterNames]);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setInputValue('');
  }, []);

  return {
    suggestions,
    inputValue,
    updateSuggestions,
    clearSuggestions,
    selectName: (name: string) => {
      setInputValue(name);
      setSuggestions([]);
    }
  };
};