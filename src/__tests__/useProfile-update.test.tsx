import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

// Mock the auth context
vi.mock('@/contexts/AuthContextMVP', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('useProfile - Update Mutation', () => {
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

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should validate farmer name before update', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.updateProfileAsync).toBeDefined();
    });

    // Try to update with invalid name (single word)
    try {
      await result.current.updateProfileAsync?.({
        farmer_name: 'SingleName',
        farm_name: 'Test Farm'
      });
      expect.fail('Should have thrown validation error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('full name');
    }
  });

  it('should successfully update profile with valid data', async () => {
    const mockUpdate = vi.fn();
    const mockSelect = vi.fn();
    const mockSingle = vi.fn();
    const mockEq = vi.fn();

    // Setup the chain for update: update().eq().select().single()
    mockSingle.mockResolvedValue({
      data: {
        id: 'test-user-id',
        farmer_name: 'John Doe',
        farm_name: 'Test Farm',
        phone: '+251912345678',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      error: null
    });

    mockSelect.mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ select: mockSelect });
    mockUpdate.mockReturnValue({ eq: mockEq });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: 'test-user-id',
                  farmer_name: 'Old Name Here',
                  farm_name: 'Old Farm',
                  phone: '+251912345678',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                error: null
              })
            })
          }),
          update: mockUpdate
        };
      }
      return {};
    });

    (supabase.from as any).mockImplementation(mockFrom);

    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });

    // Update profile with valid data
    await result.current.updateProfileAsync?.({
      farmer_name: 'John Doe',
      farm_name: 'Test Farm'
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        farmer_name: 'John Doe',
        farm_name: 'Test Farm'
      })
    );
  });

  it('should handle network errors gracefully', async () => {
    const mockUpdate = vi.fn();
    const mockSelect = vi.fn();
    const mockSingle = vi.fn();
    const mockEq = vi.fn();

    // Setup the chain for update with error
    mockSingle.mockResolvedValue({
      data: null,
      error: {
        message: 'network error',
        code: 'NETWORK_ERROR'
      }
    });

    mockSelect.mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ select: mockSelect });
    mockUpdate.mockReturnValue({ eq: mockEq });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: 'test-user-id',
                  farmer_name: 'Test User',
                  farm_name: 'Test Farm',
                  phone: '+251912345678',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                error: null
              })
            })
          }),
          update: mockUpdate
        };
      }
      return {};
    });

    (supabase.from as any).mockImplementation(mockFrom);

    const { result } = renderHook(() => useProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });

    // Try to update with network error
    try {
      await result.current.updateProfileAsync?.({
        farmer_name: 'John Doe',
        farm_name: 'Test Farm'
      });
      expect.fail('Should have thrown network error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Network error');
    }
  });
});
