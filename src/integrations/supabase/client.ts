// src/integrations/supabase/client.ts - Resilient Supabase Client with Fallback

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables for Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Check if environment variables are configured
const isConfigured = !!(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Create the client only if configured
let supabase: SupabaseClient<Database> | null = null;

if (isConfigured) {
  try {
    supabase = createClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (url, options) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          return fetch(url, {
            ...options,
            signal: controller.signal,
          }).finally(() => clearTimeout(timeout));
        },
      },
    });
    console.log('[Supabase] Client initialized successfully');
  } catch (error) {
    console.error('[Supabase] Failed to create client:', error);
  }
} else {
  console.warn('[Supabase] Missing environment variables - using offline mode');
}

// Demo mode for offline development
export const enableDemoMode = () => {
  if (!supabase) {
    console.log('[Demo Mode] Enabled - using local storage for auth');
  }
};

// Export the supabase client (may be null if not configured)
export { supabase };

// Export a flag to check if Supabase is configured
export const isSupabaseConfigured = isConfigured;