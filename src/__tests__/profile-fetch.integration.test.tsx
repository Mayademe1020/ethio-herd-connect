// src/__tests__/profile-fetch.integration.test.tsx - Integration Tests for Profile Fetch and Error Handling

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfile } from '@/hooks/useProfile';
import type { ReactNode } from 'react';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContextMVP', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '123', email: '911234567@ethioherd.app' },
    loading: false,
  })),
}));

describe('Profile Fetch Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retry for tests
        },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('Successful Profile Fetch', () => {
    it('should fetch profile successfully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockProfile = {
        id: '123',
        phone: '911234567',
        farmer_name: 'Abebe Tesema',
        farm_name: 'Abebe Farm',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should return null when profile does not exist (PGRST116)', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should cache profile data', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockProfile = {
        id: '123',
        phone: '911234567',
        farmer_name: 'Abebe Tesema',
        farm_name: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({ select: mockSelect });

      // First render
      const { result: result1 } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result1.current.profile).toEqual(mockProfile);
      });

      // Second render should use cached data
      const { result: result2 } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result2.current.profile).toEqual(mockProfile);
      });

      // Should only call once due to caching
      expect(mockSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Profile Fetch Errors', () => {
    it('should handle 406 Not Acceptable error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { 
                message: '406 Not Acceptable',
                code: '406'
              },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toContain('Unable to load profile');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Profile fetch 406 error:',
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle generic database errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { 
                message: 'Database connection failed',
                code: 'DB_ERROR'
              },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toContain('Database connection failed');
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle network errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Failed to fetch')),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toContain('Failed to fetch');
      });

      consoleErrorSpy.mockRestore();
    });

    it('should log errors to console', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Test error')),
          }),
        }),
      });

      renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Profile fetch error:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Retry Functionality', () => {
    it('should provide refetch function', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockProfile = {
        id: '123',
        phone: '911234567',
        farmer_name: 'Abebe Tesema',
        farm_name: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).toEqual(mockProfile);
      });

      expect(result.current.refetch).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should retry after error when refetch is called', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      let callCount = 0;
      const mockSingle = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            data: null,
            error: { message: 'Temporary error', code: 'TEMP_ERROR' },
          });
        }
        return Promise.resolve({
          data: {
            id: '123',
            phone: '911234567',
            farmer_name: 'Abebe Tesema',
            farm_name: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          error: null,
        });
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      // Wait for initial error
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Call refetch
      result.current.refetch();

      // Wait for successful retry
      await waitFor(() => {
        expect(result.current.profile).toBeTruthy();
        expect(result.current.error).toBeNull();
      });

      expect(callCount).toBe(2);
      consoleErrorSpy.mockRestore();
    });

    it('should implement exponential backoff for retries', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Create a new query client with retry enabled
      const retryQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      });

      const retryWrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={retryQueryClient}>{children}</QueryClientProvider>
      );

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      let callCount = 0;
      const mockSingle = vi.fn(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.resolve({
            data: null,
            error: { message: 'Temporary error', code: 'TEMP_ERROR' },
          });
        }
        return Promise.resolve({
          data: {
            id: '123',
            phone: '911234567',
            farmer_name: 'Abebe Tesema',
            farm_name: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          error: null,
        });
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper: retryWrapper });

      // Should eventually succeed after retries
      await waitFor(
        () => {
          expect(result.current.profile).toBeTruthy();
          expect(callCount).toBeGreaterThan(1);
        },
        { timeout: 10000 }
      );

      consoleErrorSpy.mockRestore();
      retryQueryClient.clear();
    });
  });

  describe('Query Enablement', () => {
    it('should not fetch when user is null', async () => {
      const { useAuth } = await import('@/contexts/AuthContextMVP');
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Override mock to return null user
      (useAuth as any).mockReturnValue({
        user: null,
        loading: false,
      });

      const mockSelect = vi.fn();
      (supabase.from as any).mockReturnValue({ select: mockSelect });

      renderHook(() => useProfile(), { wrapper });

      // Wait a bit to ensure no fetch happens
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockSelect).not.toHaveBeenCalled();
    });

    it('should fetch when user is present', async () => {
      const { useAuth } = await import('@/contexts/AuthContextMVP');
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Ensure user is present
      (useAuth as any).mockReturnValue({
        user: { id: '123', email: '911234567@ethioherd.app' },
        loading: false,
      });

      const mockProfile = {
        id: '123',
        phone: '911234567',
        farmer_name: 'Abebe Tesema',
        farm_name: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      });

      (supabase.from as any).mockReturnValue({ select: mockSelect });

      renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(mockSelect).toHaveBeenCalled();
      });
    });
  });

  describe('Profile Data Structure', () => {
    it('should return profile with correct structure', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockProfile = {
        id: '123',
        phone: '911234567',
        farmer_name: 'Abebe Tesema',
        farm_name: 'Abebe Farm',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).toMatchObject({
          id: expect.any(String),
          phone: expect.any(String),
          farmer_name: expect.any(String),
          farm_name: expect.any(String),
          created_at: expect.any(String),
          updated_at: expect.any(String),
        });
      });
    });

    it('should handle null farm_name', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockProfile = {
        id: '123',
        phone: '911234567',
        farmer_name: 'Abebe Tesema',
        farm_name: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile?.farm_name).toBeNull();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state initially', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockReturnValue(new Promise(() => {})), // Never resolves
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.profile).toBeUndefined();
    });

    it('should clear loading state after successful fetch', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockProfile = {
        id: '123',
        phone: '911234567',
        farmer_name: 'Abebe Tesema',
        farm_name: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear loading state after error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Test error')),
          }),
        }),
      });

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeTruthy();
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
