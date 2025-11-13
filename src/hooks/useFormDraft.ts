import { useState, useEffect, useCallback } from 'react';

/**
 * Form Draft Auto-Save Hook
 *
 * Automatically saves form data to localStorage and restores it on page load.
 * Provides draft restoration prompts and prevents data loss.
 */

export interface FormDraftData {
  [key: string]: any;
}

export interface UseFormDraftOptions {
  draftKey: string;
  autoSaveInterval?: number; // milliseconds
  onDraftRestored?: (data: FormDraftData) => void;
  onDraftSaved?: (data: FormDraftData) => void;
}

export interface UseFormDraftReturn {
  draftData: FormDraftData | null;
  saveDraft: (data: FormDraftData) => void;
  clearDraft: () => void;
  hasDraft: boolean;
  restoreDraft: () => FormDraftData | null;
  isRestoring: boolean;
}

const DEFAULT_AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export const useFormDraft = ({
  draftKey,
  autoSaveInterval = DEFAULT_AUTO_SAVE_INTERVAL,
  onDraftRestored,
  onDraftSaved
}: UseFormDraftOptions): UseFormDraftReturn => {
  const [draftData, setDraftData] = useState<FormDraftData | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Storage key for this form's draft
  const storageKey = `form_draft_${draftKey}`;

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setDraftData(parsedData);
        setHasDraft(true);
        setIsRestoring(true);

        // Call restoration callback
        onDraftRestored?.(parsedData);

        // Auto-clear restoring state after animation
        setTimeout(() => setIsRestoring(false), 1000);
      } catch (error) {
        console.warn('Failed to parse form draft:', error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey, onDraftRestored]);

  // Auto-save functionality
  const saveDraft = useCallback((data: FormDraftData) => {
    try {
      const draftWithTimestamp = {
        ...data,
        _savedAt: Date.now(),
        _draftKey: draftKey
      };

      localStorage.setItem(storageKey, JSON.stringify(draftWithTimestamp));
      setDraftData(draftWithTimestamp);
      setHasDraft(true);

      onDraftSaved?.(data);
    } catch (error) {
      console.warn('Failed to save form draft:', error);
    }
  }, [storageKey, draftKey, onDraftSaved]);

  // Manual restore
  const restoreDraft = useCallback((): FormDraftData | null => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        // Remove metadata before returning
        const { _savedAt, _draftKey, ...cleanData } = parsedData;
        return cleanData;
      } catch (error) {
        console.warn('Failed to restore form draft:', error);
        return null;
      }
    }
    return null;
  }, [storageKey]);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    setDraftData(null);
    setHasDraft(false);
  }, [storageKey]);

  // Auto-save effect
  useEffect(() => {
    if (!hasDraft) return;

    const interval = setInterval(() => {
      // Only auto-save if we have draft data
      if (draftData) {
        saveDraft(draftData);
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [hasDraft, draftData, saveDraft, autoSaveInterval]);

  return {
    draftData,
    saveDraft,
    clearDraft,
    hasDraft,
    restoreDraft,
    isRestoring
  };
};