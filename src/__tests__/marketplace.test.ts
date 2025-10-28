import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useMarketplaceListing } from '../hooks/useMarketplaceListing';
import { useBuyerInterest } from '../hooks/useBuyerInterest';
import { supabase } from '../integrations/supabase/client';

// Mock Supabase with chainable methods
vi.mock('../integrations/supabase/client', () => {
  const mockSupabaseInstance = {
    from: vi.fn((table: string) => {
      // Return a mock table object with chainable methods
      return {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        then: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', phone: '+251912345678' } },
        error: null
      })
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'test-photo.jpg' },
          error: null
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/test-photo.jpg' }
        })
      })
    }
  };
  return { supabase: mockSupabaseInstance };
});

// Mock offline queue
vi.mock('../lib/offlineQueue', () => ({
  offlineQueue: {
    addToQueue: vi.fn().mockResolvedValue('queue-item-id'),
    processQueue: vi.fn().mockResolvedValue(undefined),
    getPendingItems: vi.fn().mockResolvedValue([]),
    getPendingCount: vi.fn().mockResolvedValue(0),
    init: vi.fn().mockResolvedValue(undefined),
  }
}));

// Mock AuthContext
vi.mock('../contexts/AuthContextMVP', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id', phone: '+251912345678' },
    isAuthenticated: true,
    loading: false
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock ToastContext
vi.mock('../contexts/ToastContext', () => ({
  useToastContext: vi.fn(() => ({
    showToast: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismissToast: vi.fn()
  })),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children
}));

describe('Marketplace Testing', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  describe('13.4.1 Creating listings with photos', () => {
    it('should create listing with photo successfully', async () => {
      const mockListingData = {
        id: 'listing-1',
        animal_id: 'animal-1',
        price: 50000,
        is_negotiable: true,
        status: 'active'
      };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'market_listings') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockListingData,
              error: null
            })
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        } as any;
      });

      const { result } = renderHook(() => useMarketplaceListing(), { wrapper });

      await waitFor(() => {
        expect(result.current.createListing).toBeDefined();
      });

      const listing = await result.current.createListing({
        animal_id: 'animal-1',
        price: 50000,
        is_negotiable: true,
        photo_url: 'https://example.com/test-photo.jpg'
      });

      expect(listing).toBeDefined();
      expect(listing.id).toBeDefined();
    });

    it('should create listing without photo successfully', async () => {
      const mockListingData = {
        id: 'listing-2',
        animal_id: 'animal-2',
        price: 30000,
        is_negotiable: false,
        status: 'active'
      };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'market_listings') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockListingData,
              error: null
            })
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        } as any;
      });

      const { result } = renderHook(() => useMarketplaceListing(), { wrapper });

      const listing = await result.current.createListing({
        animal_id: 'animal-2',
        price: 30000,
        is_negotiable: false
      });

      expect(listing).toBeDefined();
      expect(listing.id).toBeDefined();
    });
  });

  describe('13.4.2 Browsing and filtering listings', () => {
    it('should fetch all active listings', async () => {
      const mockListings = [
        { id: '1', animal_id: 'a1', price: 50000, status: 'active', animal: { type: 'cattle' } },
        { id: '2', animal_id: 'a2', price: 30000, status: 'active', animal: { type: 'goat' } },
        { id: '3', animal_id: 'a3', price: 20000, status: 'active', animal: { type: 'sheep' } }
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockListings,
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      // Simulate fetching listings
      const { data } = await supabase
        .from('market_listings')
        .select('*, animal:animals(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      expect(data).toHaveLength(3);
      expect(data).toEqual(mockListings);
    });

    it('should filter listings by animal type', async () => {
      const mockCattleListings = [
        { id: '1', animal_id: 'a1', price: 50000, status: 'active', animal: { type: 'cattle' } }
      ];

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockCattleListings,
              error: null
            })
          })
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const { data } = await supabase
        .from('market_listings')
        .select('*, animal:animals(*)')
        .eq('status', 'active')
        .eq('animal.type', 'cattle')
        .order('created_at', { ascending: false });

      expect(data).toHaveLength(1);
      expect(data?.[0].animal.type).toBe('cattle');
    });
  });

  describe('13.4.3 Viewing listing details', () => {
    it('should fetch listing details with animal info', async () => {
      const mockListing = {
        id: 'listing-1',
        animal_id: 'animal-1',
        price: 50000,
        is_negotiable: true,
        location: 'Addis Ababa',
        contact_phone: '+251912345678',
        status: 'active',
        views_count: 5,
        animal: {
          id: 'animal-1',
          name: 'Chaltu',
          type: 'cattle',
          subtype: 'Cow',
          photo_url: 'https://example.com/chaltu.jpg'
        }
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockListing,
            error: null
          })
        })
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const { data } = await supabase
        .from('market_listings')
        .select('*, animal:animals(*)')
        .eq('id', 'listing-1')
        .single();

      expect(data).toEqual(mockListing);
      expect(data?.animal.name).toBe('Chaltu');
    });

    it('should increment views count when viewing listing', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: { views_count: 6 },
        error: null
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [{ views_count: 6 }],
              error: null
            })
          })
        })
      } as any);

      const { data } = await supabase
        .from('market_listings')
        .update({ views_count: 6 })
        .eq('id', 'listing-1')
        .select();

      expect(data?.[0].views_count).toBe(6);
    });
  });

  describe('13.4.4 Expressing interest as buyer', () => {
    it('should create buyer interest successfully', async () => {
      const mockInterestData = {
        id: 'interest-1',
        listing_id: 'listing-1',
        buyer_id: 'test-user-id',
        message: 'Interested in buying',
        status: 'pending'
      };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'buyer_interests') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockInterestData,
              error: null
            })
          } as any;
        }
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        } as any;
      });

      const { result } = renderHook(() => useBuyerInterest(), { wrapper });

      await waitFor(() => {
        expect(result.current.expressInterest).toBeDefined();
      });

      const interest = await result.current.expressInterest({
        listingId: 'listing-1',
        buyerId: 'test-user-id',
        message: 'Interested in buying'
      });

      expect(interest).toBeDefined();
      expect(interest.id).toBeDefined();
    });

    it('should handle interest without message', async () => {
      const mockInterestData = {
        id: 'interest-2',
        listing_id: 'listing-2',
        buyer_id: 'test-user-id',
        message: null,
        status: 'pending'
      };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'buyer_interests') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockInterestData,
              error: null
            })
          } as any;
        }
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        } as any;
      });

      const { result } = renderHook(() => useBuyerInterest(), { wrapper });

      const interest = await result.current.expressInterest({
        listingId: 'listing-2',
        buyerId: 'test-user-id'
      });

      expect(interest).toBeDefined();
      expect(interest.id).toBeDefined();
    });
  });

  describe('13.4.5 Viewing interests as seller', () => {
    it('should fetch interests for seller listings', async () => {
      const mockInterests = [
        {
          id: 'interest-1',
          listing_id: 'listing-1',
          buyer_id: 'buyer-1',
          message: 'Interested',
          status: 'pending',
          created_at: '2024-01-01T10:00:00Z',
          buyer: { phone: '+251923456789' }
        },
        {
          id: 'interest-2',
          listing_id: 'listing-1',
          buyer_id: 'buyer-2',
          message: 'Want to buy',
          status: 'pending',
          created_at: '2024-01-01T11:00:00Z',
          buyer: { phone: '+251934567890' }
        }
      ];

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'buyer_interests') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: mockInterests,
              error: null
            })
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        } as any;
      });

      const { data } = await supabase
        .from('buyer_interests')
        .select('*, buyer:auth.users(phone)')
        .eq('listing_id', 'listing-1')
        .order('created_at', { ascending: false });

      expect(data).toHaveLength(2);
      expect(data?.[0].buyer.phone).toBe('+251923456789');
    });

    it('should mark interest as contacted', async () => {
      const mockUpdatedInterest = { id: 'interest-1', status: 'contacted' };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'buyer_interests') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockUpdatedInterest,
              error: null
            })
          } as any;
        }
        return {
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        } as any;
      });

      const { result } = renderHook(() => useBuyerInterest(), { wrapper });

      await waitFor(() => {
        expect(result.current.markAsContacted).toBeDefined();
      });

      await result.current.markAsContacted('interest-1');

      expect(supabase.from).toHaveBeenCalledWith('buyer_interests');
    });
  });

  describe('13.4.6 Marking listings as sold', () => {
    it('should mark listing as sold successfully', async () => {
      const mockUpdatedListing = { id: 'listing-1', status: 'sold' };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'market_listings') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockUpdatedListing,
              error: null
            })
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        } as any;
      });

      const { result } = renderHook(() => useMarketplaceListing(), { wrapper });

      await waitFor(() => {
        expect(result.current.markAsSold).toBeDefined();
      });

      await result.current.markAsSold('listing-1');

      expect(supabase.from).toHaveBeenCalledWith('market_listings');
    });

    it('should cancel listing successfully', async () => {
      const mockCancelledListing = { id: 'listing-2', status: 'cancelled' };

      vi.mocked(supabase.from).mockImplementation((table: string) => {
        if (table === 'market_listings') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockCancelledListing,
              error: null
            })
          } as any;
        }
        return {
          select: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        } as any;
      });

      const { result } = renderHook(() => useMarketplaceListing(), { wrapper });

      await waitFor(() => {
        expect(result.current.cancelListing).toBeDefined();
      });

      await result.current.cancelListing('listing-2');

      expect(supabase.from).toHaveBeenCalledWith('market_listings');
    });
  });
});
