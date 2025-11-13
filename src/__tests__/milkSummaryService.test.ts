// Unit tests for milk summary calculation service

import {
  calculateWeeklySummary,
  calculateMonthlySummary,
  calculateTrend,
  getTrendIcon,
  getTrendColor
} from '../services/milkSummaryService';

describe('milkSummaryService', () => {
  describe('calculateTrend', () => {
    it('should return increasing trend when current > previous', () => {
      const result = calculateTrend(100, 80);
      expect(result.trend).toBe('increasing');
      expect(result.trendPercentage).toBe(25);
    });

    it('should return decreasing trend when current < previous', () => {
      const result = calculateTrend(80, 100);
      expect(result.trend).toBe('decreasing');
      expect(result.trendPercentage).toBe(20);
    });

    it('should return stable trend when change < 5%', () => {
      const result = calculateTrend(100, 98);
      expect(result.trend).toBe('stable');
      expect(result.trendPercentage).toBeCloseTo(2, 1);
    });

    it('should return stable when no previous data', () => {
      const result = calculateTrend(100, 0);
      expect(result.trend).toBe('stable');
      expect(result.trendPercentage).toBe(0);
    });
  });

  describe('calculateWeeklySummary', () => {
    it('should calculate correct weekly totals', () => {
      const now = new Date();
      const records = [
        {
          id: '1',
          liters: 5,
          recorded_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          session: 'morning' as const
        },
        {
          id: '2',
          liters: 4,
          recorded_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          session: 'afternoon' as const
        },
        {
          id: '3',
          liters: 6,
          recorded_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          session: 'morning' as const
        }
      ];

      const summary = calculateWeeklySummary(records);

      expect(summary.totalLiters).toBe(15);
      expect(summary.recordCount).toBe(3);
      expect(summary.averagePerDay).toBeCloseTo(2.1, 1);
    });

    it('should handle empty records', () => {
      const summary = calculateWeeklySummary([]);

      expect(summary.totalLiters).toBe(0);
      expect(summary.recordCount).toBe(0);
      expect(summary.averagePerDay).toBe(0);
    });
  });

  describe('calculateMonthlySummary', () => {
    it('should calculate correct monthly totals', () => {
      const now = new Date();
      const records = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        liters: 5,
        recorded_at: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
        session: i % 2 === 0 ? 'morning' as const : 'afternoon' as const
      }));

      const summary = calculateMonthlySummary(records);

      expect(summary.totalLiters).toBe(50);
      expect(summary.recordCount).toBe(10);
      expect(summary.averagePerDay).toBeCloseTo(1.7, 1);
    });
  });

  describe('getTrendIcon', () => {
    it('should return correct icons', () => {
      expect(getTrendIcon('increasing')).toBe('↑');
      expect(getTrendIcon('decreasing')).toBe('↓');
      expect(getTrendIcon('stable')).toBe('→');
    });
  });

  describe('getTrendColor', () => {
    it('should return correct colors', () => {
      expect(getTrendColor('increasing')).toBe('text-green-600');
      expect(getTrendColor('decreasing')).toBe('text-red-600');
      expect(getTrendColor('stable')).toBe('text-gray-600');
    });
  });
});
