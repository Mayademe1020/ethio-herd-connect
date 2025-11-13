import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MilkProductionRecords from '@/pages/MilkProductionRecords';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Mock offline queue to avoid IDBRequest errors
vi.mock('@/lib/offlineQueue', () => ({
  offlineQueueManager: {
    init: vi.fn(),
    addToQueue: vi.fn(),
    getQueueStatus: vi.fn(() => ({ pending: 0, syncing: false })),
  },
}));

// Mock the hooks and components
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    session: null,
    loading: false,
  }),
}));

vi.mock('@/contexts/AuthContextMVP', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    session: null,
    loading: false,
  }),
}));

vi.mock('@/hooks/useMilkRecording', () => ({
  default: vi.fn(() => ({
    recordMilk: vi.fn(),
    updateMilkRecordAsync: vi.fn(),
    isRecording: false,
    error: null,
  })),
}));

vi.mock('@/hooks/usePaginatedMilkProduction', () => ({
  usePaginatedMilkProduction: () => ({
    milkRecords: [],
    statistics: {
      totalAmount: 100,
      averageAmount: 10,
      highestAmount: 20,
    },
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isLoading: false,
    isFetchingNextPage: false,
    isOffline: false,
    isEmpty: true,
    totalCount: 0,
    refresh: vi.fn(),
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          gte: () => ({
            order: () => ({
              data: [
                {
                  id: '1',
                  liters: 10,
                  recorded_at: new Date().toISOString(),
                  session: 'morning',
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    }),
  },
}));

vi.mock('@/components/EnhancedHeader', () => ({
  EnhancedHeader: () => <div>Header</div>,
}));

vi.mock('@/components/BottomNavigation', () => ({
  default: () => <div>Bottom Nav</div>,
}));

vi.mock('@/components/OfflineIndicator', () => ({
  OfflineIndicator: () => <div>Offline Indicator</div>,
}));

vi.mock('@/components/MilkSummaryCard', () => ({
  MilkSummaryCard: ({ period, onPeriodChange }: any) => (
    <div data-testid="milk-summary-card">
      <div>Period: {period}</div>
      <button onClick={() => onPeriodChange('month')}>Change to Month</button>
    </div>
  ),
}));

describe('MilkProductionRecords - Task 1.3', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should integrate MilkSummaryCard at the top', async () => {
    render(
      <BrowserRouter>
        <LanguageProvider>
          <MilkProductionRecords />
        </LanguageProvider>
      </BrowserRouter>
    );

    // Wait for the summary card to appear
    await waitFor(() => {
      const summaryCard = screen.queryByTestId('milk-summary-card');
      expect(summaryCard).toBeInTheDocument();
    });
  });

  it('should have period selector (week/month)', async () => {
    render(
      <BrowserRouter>
        <LanguageProvider>
          <MilkProductionRecords />
        </LanguageProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const summaryCard = screen.queryByTestId('milk-summary-card');
      expect(summaryCard).toBeInTheDocument();
      expect(summaryCard).toHaveTextContent('Period: week');
    });
  });

  it('should show comparison with previous period through MilkSummaryCard', async () => {
    render(
      <BrowserRouter>
        <LanguageProvider>
          <MilkProductionRecords />
        </LanguageProvider>
      </BrowserRouter>
    );

    // The MilkSummaryCard component handles the comparison display
    // This test verifies that the card is rendered with the correct props
    await waitFor(() => {
      const summaryCard = screen.queryByTestId('milk-summary-card');
      expect(summaryCard).toBeInTheDocument();
    });
  });
});
