// src/__tests__/useFarmStats.test.tsx - Tests for useFarmStats hook

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFarmStats } from '@/hooks/useFarmStats';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Mock the auth context
vi.mock('@/contexts/AuthContextMVP', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}));

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('useFarmStats', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch and return farm statistics', async () => {
    // Mock animals count
    const animalsMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        count: 5,
        error: null
      })
    };

    // Mock milk production data
    const milkMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({
        data: [
          { total_yield: 10.5 },
          { total_yield: 12.3 },
          { total_yield: 8.7 }
        ],
        error: null
      })
    };

    // Mock market listings count - needs to chain two .eq() calls
    const listingsMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn(function(this: any) {
        return this; // Return this to allow chaining
      }).mockReturnThis(),
    };
    // Add the final resolved value after the second eq call
    Object.assign(listingsMock, {
      eq: vi.fn().mockReturnThis()
    });
    listingsMock.eq = vi.fn()
      .mockReturnValueOnce(listingsMock) // First eq() returns this for chaining
      .mockResolvedValueOnce({ // Second eq() returns the result
        count: 2,
        error: null
      });

    // Setup mock to return different mocks based on table name
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'animals') {
        return animalsMock as any;
      } else if (table === 'milk_production') {
        return milkMock as any;
      } else if (table === 'market_listings') {
        return listingsMock as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useFarmStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.stats).toMatchObject({
      totalAnimals: 5,
      milkLast30Days: 31.5,
      activeListings: 2
    });
    expect(result.current.stats?.lastUpdated).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('should handle zero values gracefully', async () => {
    // Mock empty results
    const animalsMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        count: 0,
        error: null
      })
    };

    const milkMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({
        data: [],
        error: null
      })
    };

    const listingsMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn()
        .mockReturnValueOnce({ eq: vi.fn().mockResolvedValue({ count: 0, error: null }) })
    };

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'animals') return animalsMock as any;
      if (table === 'milk_production') return milkMock as any;
      if (table === 'market_listings') return listingsMock as any;
      return {} as any;
    });

    const { result } = renderHook(() => useFarmStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.stats).toMatchObject({
      totalAnimals: 0,
      milkLast30Days: 0,
      activeListings: 0
    });
    expect(result.current.stats?.lastUpdated).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const errorMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        count: null,
        error: { message: 'Database error' }
      })
    };

    vi.mocked(supabase.from).mockReturnValue(errorMock as any);

    const { result } = renderHook(() => useFarmStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    }, { timeout: 5000 });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.stats).toBeUndefined();
  });
});
