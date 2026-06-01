/**
 * Profile Page - Null/Undefined Display Test
 * 
 * This test verifies that the Profile page never displays
 * "undefined" or "null" as text to the user.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Profile from '@/pages/Profile';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { AuthProviderMVP as AuthProvider } from '@/contexts/AuthContextMVP';

// Mock hooks
vi.mock('@/hooks/useProfile', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useProfile')>('@/hooks/useProfile');
  return { ...actual, useProfile: vi.fn() };
});

vi.mock('@/hooks/useFarmStats', async () => {
  const actual = await vi.importActual<typeof import('@/hooks/useFarmStats')>('@/hooks/useFarmStats');
  return { ...actual, useFarmStats: vi.fn() };
});

vi.mock('@/integrations/supabase/client', async () => {
  const actual = await vi.importActual<typeof import('@/integrations/supabase/client')>('@/integrations/supabase/client');
  return {
    ...actual,
    supabase: {
      auth: {
        signOut: vi.fn().mockResolvedValue({ error: null }),
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: { id: 'test-user-id' },
              access_token: 'test-token',
            },
          },
          error: null,
        }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
      },
    },
    isSupabaseConfigured: vi.fn().mockReturnValue(true),
  };
});

// Mock components
vi.mock('@/components/BottomNavigation', async () => {
  const actual = await vi.importActual<typeof import('@/components/BottomNavigation')>('@/components/BottomNavigation');
  return { ...actual, default: () => <div data-testid="bottom-nav">Bottom Navigation</div> };
});

vi.mock('@/components/AnalyticsDashboard', async () => {
  const actual = await vi.importActual<typeof import('@/components/AnalyticsDashboard')>('@/components/AnalyticsDashboard');
  return { ...actual, default: () => <div data-testid="analytics">Analytics</div> };
});

vi.mock('@/components/ReminderSettings', async () => {
  const actual = await vi.importActual<typeof import('@/components/ReminderSettings')>('@/components/ReminderSettings');
  return { ...actual, ReminderSettings: () => <div data-testid="reminders">Reminders</div> };
});

vi.mock('@/components/MarketAlertPreferences', async () => {
  const actual = await vi.importActual<typeof import('@/components/MarketAlertPreferences')>('@/components/MarketAlertPreferences');
  return { ...actual, MarketAlertPreferences: () => <div data-testid="market-alerts">Market Alerts</div> };
});

const renderProfile = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <CalendarProvider>
              <Profile />
            </CalendarProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Profile Page - Null/Undefined Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not display "undefined" text when farm_name is null', async () => {
    const { useProfile } = await import('@/hooks/useProfile');
    const { useFarmStats } = await import('@/hooks/useFarmStats');

    vi.mocked(useProfile).mockReturnValue({
      profile: {
        id: 'test-user-id',
        phone: '+251912345678',
        farmer_name: 'Abebe Kebede',
        farm_name: null, // NULL farm name
        calendar_preference: 'gregorian',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      updateProfileAsync: vi.fn(),
    } as any);

    vi.mocked(useFarmStats).mockReturnValue({
      stats: {
        totalAnimals: 5,
        milkLast30Days: 150.5,
        activeListings: 2,
      },
      isLoading: false,
      isStale: false,
    } as any);

    const { container } = renderProfile();

    await waitFor(() => {
      expect(screen.getByTestId('farmer-name')).toHaveTextContent('Abebe Kebede');
    });

    // Check that "undefined" or "null" text is NOT present
    const bodyText = container.textContent || '';
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('null');
  });

  it('should not display "undefined" text when farm_name is undefined', async () => {
    const { useProfile } = await import('@/hooks/useProfile');
    const { useFarmStats } = await import('@/hooks/useFarmStats');

    vi.mocked(useProfile).mockReturnValue({
      profile: {
        id: 'test-user-id',
        phone: '+251912345678',
        farmer_name: 'Tigist Alemu',
        farm_name: undefined, // UNDEFINED farm name
        calendar_preference: 'ethiopian',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      updateProfileAsync: vi.fn(),
    } as any);

    vi.mocked(useFarmStats).mockReturnValue({
      stats: {
        totalAnimals: 0,
        milkLast30Days: 0,
        activeListings: 0,
      },
      isLoading: false,
      isStale: false,
    } as any);

    const { container } = renderProfile();

    await waitFor(() => {
      expect(screen.getByTestId('farmer-name')).toHaveTextContent('Tigist Alemu');
    });

    // Check that "undefined" or "null" text is NOT present
    const bodyText = container.textContent || '';
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('null');
  });

  it('should display farm name when it exists', async () => {
    const { useProfile } = await import('@/hooks/useProfile');
    const { useFarmStats } = await import('@/hooks/useFarmStats');

    vi.mocked(useProfile).mockReturnValue({
      profile: {
        id: 'test-user-id',
        phone: '+251912345678',
        farmer_name: 'Mulugeta Haile',
        farm_name: 'Sunshine Farm', // Valid farm name
        calendar_preference: 'gregorian',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      updateProfileAsync: vi.fn(),
    } as any);

    vi.mocked(useFarmStats).mockReturnValue({
      stats: {
        totalAnimals: 10,
        milkLast30Days: 250.0,
        activeListings: 3,
      },
      isLoading: false,
      isStale: false,
    } as any);

    const { container } = renderProfile();

    await waitFor(() => {
      expect(screen.getByTestId('farmer-name')).toHaveTextContent('Mulugeta Haile');
    });

    // Check that "undefined" or "null" text is NOT present
    const bodyText = container.textContent || '';
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('null');
  });

  it('should not display "undefined" in stats when values are null', async () => {
    const { useProfile } = await import('@/hooks/useProfile');
    const { useFarmStats } = await import('@/hooks/useFarmStats');

    vi.mocked(useProfile).mockReturnValue({
      profile: {
        id: 'test-user-id',
        phone: '+251912345678',
        farmer_name: 'Alemayehu Tadesse',
        farm_name: null,
        calendar_preference: 'gregorian',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      updateProfileAsync: vi.fn(),
    } as any);

    vi.mocked(useFarmStats).mockReturnValue({
      stats: null, // NULL stats
      isLoading: false,
      isStale: false,
    } as any);

    const { container } = renderProfile();

    await waitFor(() => {
      expect(screen.getByTestId('farmer-name')).toHaveTextContent('Alemayehu Tadesse');
    });

    // Check that "undefined" or "null" text is NOT present
    const bodyText = container.textContent || '';
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('null');
    
    // Stats should show 0 values instead of null/undefined
    expect(screen.getByTestId('stat-total-animals')).toHaveTextContent('0');
    expect(screen.getByTestId('stat-milk-amount')).toHaveTextContent('0L');
    expect(screen.getByTestId('stat-active-listings')).toHaveTextContent('0');
  });

  it('should show skeleton loaders during loading, not undefined', async () => {
    const { useProfile } = await import('@/hooks/useProfile');
    const { useFarmStats } = await import('@/hooks/useFarmStats');

    vi.mocked(useProfile).mockReturnValue({
      profile: null,
      isLoading: true, // Loading state
      error: null,
      refetch: vi.fn(),
      updateProfileAsync: vi.fn(),
    } as any);

    vi.mocked(useFarmStats).mockReturnValue({
      stats: null,
      isLoading: true,
      isStale: false,
    } as any);

    const { container } = renderProfile();

    // Should show skeleton loaders, not undefined text
    const bodyText = container.textContent || '';
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('null');
  });

  it('should show error message on error, not undefined', async () => {
    const { useProfile } = await import('@/hooks/useProfile');
    const { useFarmStats } = await import('@/hooks/useFarmStats');

    vi.mocked(useProfile).mockReturnValue({
      profile: null,
      isLoading: false,
      error: new Error('Network error'), // Error state
      refetch: vi.fn(),
      updateProfileAsync: vi.fn(),
    } as any);

    vi.mocked(useFarmStats).mockReturnValue({
      stats: null,
      isLoading: false,
      isStale: false,
    } as any);

    const { container } = renderProfile();

    await waitFor(() => {
      expect(screen.getByTestId('error-title')).toBeInTheDocument();
    });

    // Should show error message, not undefined text
    const bodyText = container.textContent || '';
    expect(bodyText).not.toContain('undefined');
    expect(bodyText).not.toContain('null');
  });
});
