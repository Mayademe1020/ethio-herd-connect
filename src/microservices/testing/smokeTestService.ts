/**
 * Microservice: Smoke Test Service
 * Responsibility: Run quick smoke tests on production deployment
 * Single File: HTTP requests only
 */

interface SmokeTestConfig {
  baseUrl: string;
  timeout: number;
}

interface TestResult {
  test: string;
  passed: boolean;
  duration: number;
  error?: string;
}

interface SmokeTestResults {
  total: number;
  passed: number;
  failed: number;
  tests: TestResult[];
  timestamp: string;
}

/**
 * Task 1: Test homepage loads
 * Files affected: None (network request)
 * Action: HTTP GET /
 */
async function testHomepage(config: SmokeTestConfig): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const response = await fetch(config.baseUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(config.timeout)
    });
    
    const passed = response.status === 200;
    
    return {
      test: 'Homepage loads',
      passed,
      duration: Date.now() - start,
      error: passed ? undefined : `Status ${response.status}`
    };
    
  } catch (error) {
    return {
      test: 'Homepage loads',
      passed: false,
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Task 2: Test assets are served
 * Files affected: None (network request)
 * Action: HTTP GET /assets/js/
 */
async function testAssets(config: SmokeTestConfig): Promise<TestResult> {
  const start = Date.now();
  
  try {
    // Try to fetch a JS file
    const response = await fetch(`${config.baseUrl}/assets/js/`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(config.timeout)
    });
    
    // 403 is OK (directory listing disabled), just check it's not 404
    const passed = response.status !== 404;
    
    return {
      test: 'Assets directory accessible',
      passed,
      duration: Date.now() - start,
      error: passed ? undefined : `Status ${response.status}`
    };
    
  } catch (error) {
    return {
      test: 'Assets directory accessible',
      passed: false,
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Task 3: Test Supabase connectivity
 * Files affected: None (network request)
 * Action: HTTP GET Supabase health endpoint
 */
async function testSupabase(config: SmokeTestConfig): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      return {
        test: 'Supabase connectivity',
        passed: false,
        duration: Date.now() - start,
        error: 'VITE_SUPABASE_URL not set'
      };
    }
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(config.timeout)
    });
    
    // 401 is OK (needs auth), just check it's reachable
    const passed = response.status !== 0;
    
    return {
      test: 'Supabase connectivity',
      passed,
      duration: Date.now() - start,
      error: passed ? undefined : 'Cannot reach Supabase'
    };
    
  } catch (error) {
    return {
      test: 'Supabase connectivity',
      passed: false,
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Task 4: Test mobile responsiveness
 * Files affected: None (network request)
 * Action: Check viewport meta tag
 */
async function testMobileResponsive(config: SmokeTestConfig): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const response = await fetch(config.baseUrl, {
      signal: AbortSignal.timeout(config.timeout)
    });
    
    const html = await response.text();
    const hasViewport = html.includes('viewport');
    const hasMobileMeta = html.includes('width=device-width');
    
    const passed = hasViewport && hasMobileMeta;
    
    return {
      test: 'Mobile responsive meta tags',
      passed,
      duration: Date.now() - start,
      error: passed ? undefined : 'Missing viewport meta tag'
    };
    
  } catch (error) {
    return {
      test: 'Mobile responsive meta tags',
      passed: false,
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Single action export
export async function executeSmokeTests(baseUrl: string): Promise<SmokeTestResults> {
  console.log('🧪 Running smoke tests...\n');
  
  const config: SmokeTestConfig = {
    baseUrl,
    timeout: 10000
  };
  
  const tests = await Promise.all([
    testHomepage(config),
    testAssets(config),
    testSupabase(config),
    testMobileResponsive(config)
  ]);
  
  const passed = tests.filter(t => t.passed).length;
  const failed = tests.filter(t => !t.passed).length;
  
  const results: SmokeTestResults = {
    total: tests.length,
    passed,
    failed,
    tests,
    timestamp: new Date().toISOString()
  };
  
  // Print results
  console.log(`\n📊 Smoke Test Results:`);
  console.log(`   Total: ${results.total}`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`\n📋 Details:`);
  
  tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌';
    console.log(`   ${icon} ${test.test} (${test.duration}ms)`);
    if (test.error) {
      console.log(`      Error: ${test.error}`);
    }
  });
  
  return results;
}
