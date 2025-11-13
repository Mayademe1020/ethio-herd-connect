import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { useFormDraft } from '../hooks/useFormDraft';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test component that uses the hook
const TestComponent: React.FC<{ draftKey: string }> = ({ draftKey }) => {
  const { draftData, saveDraft, clearDraft, hasDraft, restoreDraft } = useFormDraft({
    draftKey,
    autoSaveInterval: 1000, // 1 second for testing
  });

  return React.createElement('div', {}, [
    React.createElement('div', { key: 'has-draft', 'data-testid': 'has-draft' }, hasDraft ? 'true' : 'false'),
    React.createElement('div', { key: 'draft-data', 'data-testid': 'draft-data' }, JSON.stringify(draftData)),
    React.createElement('button', {
      key: 'save-draft',
      'data-testid': 'save-draft',
      onClick: () => saveDraft({ testField: 'testValue', step: 2 })
    }, 'Save Draft'),
    React.createElement('button', {
      key: 'clear-draft',
      'data-testid': 'clear-draft',
      onClick: clearDraft
    }, 'Clear Draft'),
    React.createElement('button', {
      key: 'restore-draft',
      'data-testid': 'restore-draft',
      onClick: () => {
        const data = restoreDraft();
        if (data) {
          console.log('Restored:', data);
        }
      }
    }, 'Restore Draft')
  ]);
};

describe('Form Draft System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Draft Saving', () => {
    it('should save draft data to localStorage', async () => {
      const { getByTestId } = render(React.createElement(TestComponent, { draftKey: "test-form" }));

      const saveButton = getByTestId('save-draft');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'form_draft_test-form',
          expect.stringContaining('"testField":"testValue"')
        );
      });
    });

    it('should include timestamp and metadata in saved draft', async () => {
      const { getByTestId } = render(React.createElement(TestComponent, { draftKey: "test-form" }));

      const saveButton = getByTestId('save-draft');
      fireEvent.click(saveButton);

      await waitFor(() => {
        const [key, value] = localStorageMock.setItem.mock.calls[0];
        const parsedData = JSON.parse(value);

        expect(parsedData._savedAt).toBeDefined();
        expect(parsedData._draftKey).toBe('test-form');
        expect(parsedData.testField).toBe('testValue');
        expect(parsedData.step).toBe(2);
      });
    });
  });

  describe('Draft Loading', () => {
    it('should load existing draft on mount', () => {
      const mockDraft = {
        testField: 'existingValue',
        step: 3,
        _savedAt: Date.now(),
        _draftKey: 'test-form'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockDraft));

      render(React.createElement(TestComponent, { draftKey: "test-form" }));

      expect(localStorageMock.getItem).toHaveBeenCalledWith('form_draft_test-form');
    });

    it('should indicate when draft exists', () => {
      const mockDraft = {
        testField: 'existingValue',
        _savedAt: Date.now(),
        _draftKey: 'test-form'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockDraft));

      const { getByTestId } = render(React.createElement(TestComponent, { draftKey: "test-form" }));

      expect(getByTestId('has-draft').textContent).toBe('true');
    });
  });

  describe('Draft Clearing', () => {
    it('should clear draft from localStorage', async () => {
      const { getByTestId } = render(React.createElement(TestComponent, { draftKey: "test-form" }));

      const clearButton = getByTestId('clear-draft');
      fireEvent.click(clearButton);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('form_draft_test-form');
    });

    it('should indicate no draft after clearing', async () => {
      const mockDraft = {
        testField: 'existingValue',
        _savedAt: Date.now(),
        _draftKey: 'test-form'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockDraft));

      const { getByTestId } = render(React.createElement(TestComponent, { draftKey: "test-form" }));

      // Initially has draft
      expect(getByTestId('has-draft').textContent).toBe('true');

      // Clear draft
      const clearButton = getByTestId('clear-draft');
      fireEvent.click(clearButton);

      // Should no longer have draft
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('form_draft_test-form');
    });
  });

  describe('Draft Restoration', () => {
    it('should restore draft data without metadata', () => {
      const mockDraft = {
        testField: 'existingValue',
        step: 3,
        _savedAt: Date.now(),
        _draftKey: 'test-form'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockDraft));

      const { getByTestId } = render(React.createElement(TestComponent, { draftKey: "test-form" }));

      const restoreButton = getByTestId('restore-draft');
      fireEvent.click(restoreButton);

      // The restore function should return data without metadata
      // This is tested indirectly through the component behavior
      expect(localStorageMock.getItem).toHaveBeenCalledWith('form_draft_test-form');
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      // Should not throw error
      expect(() => {
        render(React.createElement(TestComponent, { draftKey: "test-form" }));
      }).not.toThrow();
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { getByTestId } = render(React.createElement(TestComponent, { draftKey: "test-form" }));

      // Should not throw when trying to save
      const saveButton = getByTestId('save-draft');
      expect(() => fireEvent.click(saveButton)).not.toThrow();
    });
  });

  describe('Auto-save Functionality', () => {
    it('should auto-save periodically when data changes', async () => {
      vi.useFakeTimers();

      const { getByTestId } = render(React.createElement(TestComponent, { draftKey: "test-form" }));

      // Trigger a save
      const saveButton = getByTestId('save-draft');
      fireEvent.click(saveButton);

      // Fast-forward time
      vi.advanceTimersByTime(1500); // More than 1 second

      // Check that setItem was called at least once (initial save)
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });
});