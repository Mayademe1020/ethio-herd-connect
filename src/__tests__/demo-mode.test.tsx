import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { DemoModeProvider, useDemoMode, DemoDataType } from '@/contexts/DemoModeContext';

const STORAGE_KEY = 'ethio-herd-demo-mode';

const wrapper = ({ children }: { children: ReactNode }) => (
  <DemoModeProvider>{children}</DemoModeProvider>
);

describe('DemoModeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('starts with isDemoMode false when localStorage is empty', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      expect(result.current.isDemoMode).toBe(false);
    });

    it('throws when useDemoMode is called outside a DemoModeProvider', () => {
      expect(() => renderHook(() => useDemoMode())).toThrow(
        'useDemoMode must be used within a DemoModeProvider'
      );
    });
  });

  describe('toggleDemoMode', () => {
    it('flips isDemoMode from false to true', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      act(() => {
        result.current.toggleDemoMode();
      });

      expect(result.current.isDemoMode).toBe(true);
    });

    it('flips isDemoMode back to false when toggled twice', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      act(() => {
        result.current.toggleDemoMode();
      });
      act(() => {
        result.current.toggleDemoMode();
      });

      expect(result.current.isDemoMode).toBe(false);
    });

    it('persists the new state to localStorage as the string "true"', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      act(() => {
        result.current.toggleDemoMode();
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });

    it('persists the new state to localStorage as the string "false" when toggled off', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      act(() => {
        result.current.toggleDemoMode();
      });
      act(() => {
        result.current.toggleDemoMode();
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
    });
  });

  describe('localStorage hydration on mount', () => {
    it('restores isDemoMode=true when localStorage has "true"', async () => {
      localStorage.setItem(STORAGE_KEY, 'true');

      const { result } = renderHook(() => useDemoMode(), { wrapper });

      await waitFor(() => {
        expect(result.current.isDemoMode).toBe(true);
      });
    });

    it('stays false when localStorage has "false"', () => {
      localStorage.setItem(STORAGE_KEY, 'false');

      const { result } = renderHook(() => useDemoMode(), { wrapper });

      expect(result.current.isDemoMode).toBe(false);
    });

    it('stays false when localStorage has an unrelated value', () => {
      localStorage.setItem(STORAGE_KEY, 'yes-please');

      const { result } = renderHook(() => useDemoMode(), { wrapper });

      expect(result.current.isDemoMode).toBe(false);
    });
  });

  describe('getDemoData (default item)', () => {
    const cases: Array<[DemoDataType, string | number]> = [
      ['animal_name', 'Chaltu'],
      ['milk_amount', 3],
      ['listing_price', 15000],
      ['listing_description', 'Healthy dairy cow, good milk production'],
      ['location', 'Bahir Dar, Amhara'],
      ['phone', '+251911111111'],
      ['farm_name', 'Green Valley Farm'],
      ['animal_type', 'cattle'],
      ['animal_subtype', 'Cow'],
    ];

    it.each(cases)('returns the first item of the %s pool', (type, expected) => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      expect(result.current.getDemoData(type)).toBe(expected);
    });

    it('returns null for an unknown data type', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      expect(
        result.current.getDemoData('not_a_real_type' as DemoDataType)
      ).toBeNull();
    });
  });

  describe('getRandomDemoData', () => {
    it('returns an item from the animal_name pool when Math.random returns 0', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      expect(result.current.getRandomDemoData('animal_name')).toBe('Chaltu');
    });

    it('returns the last item of the milk_amount pool when Math.random is just below 1', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.999999);
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      const milkAmount = result.current.getRandomDemoData('milk_amount');
      expect(milkAmount).toBe(8);
      expect([3, 5, 7, 4, 6, 8]).toContain(milkAmount);
    });

    it('always returns one of the known listing prices', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      const knownPrices = [15000, 25000, 35000, 20000, 30000, 40000];
      for (let i = 0; i < 25; i++) {
        const price = result.current.getRandomDemoData('listing_price');
        expect(knownPrices).toContain(price);
      }
    });

    it('returns null for an unknown data type', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      expect(
        result.current.getRandomDemoData('not_a_real_type' as DemoDataType)
      ).toBeNull();
    });
  });

  describe('keyboard shortcut (Ctrl+Shift+D)', () => {
    it('toggles demo mode on when the shortcut is pressed from off', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      expect(result.current.isDemoMode).toBe(false);

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'D',
            ctrlKey: true,
            shiftKey: true,
          })
        );
      });

      expect(result.current.isDemoMode).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });

    it('does not toggle on plain D without modifiers', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'D' })
        );
      });

      expect(result.current.isDemoMode).toBe(false);
    });

    it('does not toggle on Ctrl+D without Shift', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'D', ctrlKey: true })
        );
      });

      expect(result.current.isDemoMode).toBe(false);
    });

    it('does not toggle on Shift+D without Ctrl', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'D', shiftKey: true })
        );
      });

      expect(result.current.isDemoMode).toBe(false);
    });
  });

  describe('context value shape', () => {
    it('exposes isDemoMode, toggleDemoMode, getDemoData, and getRandomDemoData', () => {
      const { result } = renderHook(() => useDemoMode(), { wrapper });

      expect(typeof result.current.isDemoMode).toBe('boolean');
      expect(typeof result.current.toggleDemoMode).toBe('function');
      expect(typeof result.current.getDemoData).toBe('function');
      expect(typeof result.current.getRandomDemoData).toBe('function');
    });
  });
});
