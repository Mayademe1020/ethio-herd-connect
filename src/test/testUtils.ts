// Test utilities for mocking Supabase and other dependencies
import { vi } from 'vitest';

// Create a mock query builder that properly chains Supabase methods
export const createMockQueryBuilder = (data: unknown, error: unknown = null) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data, error }),
  maybeSingle: vi.fn().mockResolvedValue({ data, error }),
});

// Mock supabase client
export const mockSupabase = {
  from: vi.fn(() => createMockQueryBuilder(null)),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithOtp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
};

// Mock the auth context
export const mockAuthContext = {
  user: { id: 'test-user-id', phone: '912345678' },
  signIn: vi.fn(),
  signOut: vi.fn(),
};
