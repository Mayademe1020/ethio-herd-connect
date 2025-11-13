import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FarmStatsCard } from '@/components/FarmStatsCard';
import type { FarmStats } from '@/hooks/useFarmStats';

// Mock the useTranslation hook
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'profile.farmStatistics': 'Farm Statistics',
        'profile.animals': 'Animals',
        'profile.milkLast30Days': 'Milk (30 days)',
        'profile.listings': 'Listings',
      };
      return translations[key] || key;
    },
  }),
}));

describe('FarmStatsCard', () => {
  it('should render loading skeleton when isLoading is true', () => {
    const { container } = render(<FarmStatsCard stats={null} isLoading={true} />);
    
    // Check for skeleton elements
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render stats when data is provided', () => {
    const mockStats: FarmStats = {
      totalAnimals: 5,
      milkLast30Days: 150.5,
      activeListings: 2,
    };

    render(<FarmStatsCard stats={mockStats} isLoading={false} />);

    // Check for title
    expect(screen.getByText('Farm Statistics')).toBeInTheDocument();

    // Check for stat values
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('150.5 L')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Check for labels
    expect(screen.getByText('Animals')).toBeInTheDocument();
    expect(screen.getByText('Milk (30 days)')).toBeInTheDocument();
    expect(screen.getByText('Listings')).toBeInTheDocument();
  });

  it('should handle zero values gracefully', () => {
    const mockStats: FarmStats = {
      totalAnimals: 0,
      milkLast30Days: 0,
      activeListings: 0,
    };

    render(<FarmStatsCard stats={mockStats} isLoading={false} />);

    // Check that zeros are displayed
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getByText('0 L')).toBeInTheDocument();
  });

  it('should handle null stats by showing zeros', () => {
    render(<FarmStatsCard stats={null} isLoading={false} />);

    // Check that zeros are displayed when stats is null
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getByText('0 L')).toBeInTheDocument();
  });

  it('should display animal icon', () => {
    const mockStats: FarmStats = {
      totalAnimals: 5,
      milkLast30Days: 150.5,
      activeListings: 2,
    };

    const { container } = render(<FarmStatsCard stats={mockStats} isLoading={false} />);

    // Check for cow emoji
    expect(container.textContent).toContain('🐄');
  });

  it('should render in a 3-column grid', () => {
    const mockStats: FarmStats = {
      totalAnimals: 5,
      milkLast30Days: 150.5,
      activeListings: 2,
    };

    const { container } = render(<FarmStatsCard stats={mockStats} isLoading={false} />);

    // Check for grid layout
    const grid = container.querySelector('.grid-cols-3');
    expect(grid).toBeInTheDocument();
  });
});
