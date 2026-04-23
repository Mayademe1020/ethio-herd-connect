/**
 * Error Diagnostics Utility
 * Helps identify and report runtime errors
 */

interface ErrorReport {
  timestamp: string;
  page: string;
  error: string;
  stack?: string;
  userAgent: string;
}

export const errorLog: ErrorReport[] = [];

/**
 * Initialize global error handlers
 */
export function initErrorHandlers() {
  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    console.error('🔴 UNHANDLED ERROR:', event.error);
    logError({
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      error: event.message || 'Unknown error',
      stack: event.error?.stack,
      userAgent: navigator.userAgent
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🔴 UNHANDLED PROMISE:', event.reason);
    logError({
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      error: event.reason?.message || 'Promise rejected',
      stack: event.reason?.stack,
      userAgent: navigator.userAgent
    });
  });

  console.log('✅ Error handlers initialized');
}

function logError(report: ErrorReport) {
  errorLog.push(report);
  
  // Keep only last 50 errors
  if (errorLog.length > 50) {
    errorLog.shift();
  }
}

/**
 * Get all logged errors
 */
export function getErrorLog(): ErrorReport[] {
  return [...errorLog];
}

/**
 * Clear error log
 */
export function clearErrorLog() {
  errorLog.length = 0;
}

/**
 * Check for common configuration issues
 */
export function checkConfiguration(): string[] {
  const issues: string[] = [];

  // Check Supabase URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    issues.push('❌ VITE_SUPABASE_URL not set in environment');
  } else if (!supabaseUrl.includes('supabase.co')) {
    issues.push('⚠️ VITE_SUPABASE_URL may be invalid');
  }

  // Check Supabase key
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseKey) {
    issues.push('❌ VITE_SUPABASE_PUBLISHABLE_KEY not set in environment');
  }

  // Check if running locally
  if (window.location.hostname === 'localhost') {
    console.log('ℹ️ Running on localhost');
  }

  return issues;
}

/**
 * Test Supabase connectivity
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
      }
    });
    
    if (response.ok || response.status === 401) {
      return { success: true };
    }
    
    return { 
      success: false, 
      error: `HTTP ${response.status}: ${response.statusText}` 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

export default {
  initErrorHandlers,
  getErrorLog,
  clearErrorLog,
  checkConfiguration,
  testSupabaseConnection
};
