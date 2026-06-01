import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FarmStatsCard } from '@/components/FarmStatsCard';
import type { FarmStats } from '@/hooks/useFarmStats';

// Mock LanguageContext to provide English translations
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en', setLanguage: vi.fn(), isAmharic: false, isEnglish: true }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
    expect(screen.getByTestId('stat-total-animals')).toHaveTextContent('5');
    expect(screen.getByTestId('stat-milk-amount')).toHaveTextContent('150.5L');
    expect(screen.getByTestId('stat-active-listings')).toHaveTextContent('2');

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
    expect(screen.getByTestId('stat-total-animals')).toHaveTextContent('0');
    expect(screen.getByTestId('stat-milk-amount')).toHaveTextContent('0L');
    expect(screen.getByTestId('stat-active-listings')).toHaveTextContent('0');
  });

  it('should handle null stats by showing zeros', () => {
    render(<FarmStatsCard stats={null} isLoading={false} />);

    // Check that zeros are displayed when stats is null
    expect(screen.getByTestId('stat-total-animals')).toHaveTextContent('0');
    expect(screen.getByTestId('stat-milk-amount')).toHaveTextContent('0L');
    expect(screen.getByTestId('stat-active-listings')).toHaveTextContent('0');
  });

  it('should display animal icon', () => {
    const mockStats: FarmStats = {
      totalAnimals: 5,
      milkLast30Days: 150.5,
      activeListings: 2,
    };

    const { container } = render(<FarmStatsCard stats={mockStats} isLoading={false} />);

    // Check for Beef icon
    const beefIcon = container.querySelector('.lucide-beef');
    expect(beefIcon).toBeInTheDocument();
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
