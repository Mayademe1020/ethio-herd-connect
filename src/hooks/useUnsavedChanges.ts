import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to detect unsaved changes in forms and prevent navigation
 */
export interface UseUnsavedChangesOptions {
  hasChanges: boolean;
  onConfirmLeave?: () => void;
  message?: string;
}

export interface UseUnsavedChangesReturn {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  confirmLeave: () => Promise<boolean>;
  resetChanges: () => void;
}

export const useUnsavedChanges = ({
  hasChanges,
  onConfirmLeave,
  message = 'You have unsaved changes. Are you sure you want to leave?'
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(hasChanges);
  const beforeUnloadRef = useRef<(e: BeforeUnloadEvent) => void>();

  // Update internal state when hasChanges prop changes
  useEffect(() => {
    setHasUnsavedChanges(hasChanges);
  }, [hasChanges]);

  // Handle browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    beforeUnloadRef.current = handleBeforeUnload;
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);

  // Confirm leave function for programmatic navigation
  const confirmLeave = useCallback(async (): Promise<boolean> => {
    if (!hasUnsavedChanges) {
      return true;
    }

    const confirmed = window.confirm(message);
    if (confirmed) {
      onConfirmLeave?.();
      setHasUnsavedChanges(false);
    }
    return confirmed;
  }, [hasUnsavedChanges, message, onConfirmLeave]);

  // Reset changes function
  const resetChanges = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  return {
    hasUnsavedChanges,
    setHasUnsavedChanges,
    confirmLeave,
    resetChanges
  };
};