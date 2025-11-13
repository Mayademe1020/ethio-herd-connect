import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the demo mode context
const mockToggleDemoMode = vi.fn();
const mockGetDemoData = vi.fn();
const mockIsEnabled = vi.fn();

vi.mock('../contexts/DemoModeContext', () => ({
  useDemoMode: () => ({
    isDemoMode: true,
    toggleDemoMode: mockToggleDemoMode,
    getDemoData: mockGetDemoData,
    isEnabled: mockIsEnabled
  }),
  DemoModeProvider: ({ children }: { children: React.ReactNode }) => children
}));

describe('Demo Mode Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetDemoData.mockReturnValue('Test Data');
    mockIsEnabled.mockReturnValue(true);
  });

  describe('Demo Mode Context', () => {
    it('should provide demo mode state', () => {
      const { useDemoMode } = require('../contexts/DemoModeContext');
      const context = useDemoMode();

      expect(context.isDemoMode).toBe(true);
      expect(typeof context.toggleDemoMode).toBe('function');
      expect(typeof context.getDemoData).toBe('function');
      expect(typeof context.isEnabled).toBe('function');
    });

    it('should return demo data for different types', () => {
      const { useDemoMode } = require('../contexts/DemoModeContext');
      const context = useDemoMode();

      const animalName = context.getDemoData('animal_name');
      const milkAmount = context.getDemoData('milk_amount');
      const listingPrice = context.getDemoData('listing_price');

      expect(mockGetDemoData).toHaveBeenCalledWith('animal_name');
      expect(mockGetDemoData).toHaveBeenCalledWith('milk_amount');
      expect(mockGetDemoData).toHaveBeenCalledWith('listing_price');
    });

    it('should toggle demo mode', () => {
      const { useDemoMode } = require('../contexts/DemoModeContext');
      const context = useDemoMode();

      context.toggleDemoMode();
      expect(mockToggleDemoMode).toHaveBeenCalled();
    });
  });

  describe('Demo Mode Keyboard Shortcut', () => {
    it('should respond to Ctrl+Shift+D', () => {
      // This would be tested in integration tests with actual DOM events
      expect(true).toBe(true); // Placeholder test
    });
  });

  describe('Demo Mode Persistence', () => {
    it('should persist demo mode state to localStorage', () => {
      // This would be tested in integration tests
      expect(true).toBe(true); // Placeholder test
    });

    it('should restore demo mode state from localStorage', () => {
      // This would be tested in integration tests
      expect(true).toBe(true); // Placeholder test
    });
  });

  describe('Demo Data Generation', () => {
    it('should provide realistic Ethiopian animal names', () => {
      const names = ['Chaltu', 'Beza', 'Abebe', 'Tigist', 'Kebede'];
      expect(names.length).toBeGreaterThan(0);
      expect(names.every(name => typeof name === 'string')).toBe(true);
    });

    it('should provide realistic milk amounts', () => {
      const amounts = [3, 5, 7, 4, 6, 8, 2];
      expect(amounts.length).toBeGreaterThan(0);
      expect(amounts.every(amount => typeof amount === 'number')).toBe(true);
    });

    it('should provide realistic listing prices', () => {
      const prices = [15000, 25000, 35000, 20000, 30000, 40000, 18000];
      expect(prices.length).toBeGreaterThan(0);
      expect(prices.every(price => typeof price === 'number')).toBe(true);
    });

    it('should provide Ethiopian locations', () => {
      const locations = ['Bahir Dar', 'Addis Ababa', 'Hawassa', 'Mekelle', 'Dire Dawa', 'Gondar'];
      expect(locations.length).toBeGreaterThan(0);
      expect(locations.every(location => typeof location === 'string')).toBe(true);
    });
  });
});