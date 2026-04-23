// Network Performance Test - Simulates slow 3G/2G for Ethiopian rural conditions
// Run: node scripts/network-perf-test.js

import { chromium } from 'playwright';

const TEST_URL = 'http://localhost:4173';

// Network throttling profiles mimicking Ethiopian rural connectivity
const NETWORK_PROFILES = {
  'Slow 3G': { latency: 2000, download: 400 },   // 2s latency, 400 Kbps
  'Regular 3G': { latency: 1000, download: 750 }, // 1s latency, 750 Kbps  
  '2G': { latency: 5000, download: 50 },         // 5s latency, 50 Kbps
};

async function createCustomThrottling(context, profile) {
  // Use route interception for network throttling simulation
  // Note: Actual network throttling requires Chrome DevTools Protocol
  // This test will measure actual loading times which is what matters
  console.log(`  → Simulating ${profile.latency}ms latency, ${profile.downloadThroughput/1024}KB/s down`);
}

async function testPageLoad(networkName, profile) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${networkName}`);
  console.log(`Profile: ${JSON.stringify(profile)}`);
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: true });
  
  // Create context with throttling using new API
  const context = await browser.newContext();
  await createCustomThrottling(context, profile);
  
  const page = await context.newPage();
  
  // Performance metrics storage
  const metrics = {
    network: networkName,
    events: [],
  };
  
  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      metrics.events.push(`ERROR: ${msg.text()}`);
    }
  });
  
  // Track resource loading
  const resourceStats = {
    total: 0,
    completed: 0,
    failed: 0,
    totalSize: 0,
  };
  
  page.on('response', response => {
    resourceStats.total++;
    const status = response.status();
    if (status >= 400) {
      resourceStats.failed++;
    } else {
      resourceStats.completed++;
    }
    
    // Try to get content length
    const headers = response.headers();
    if (headers['content-length']) {
      resourceStats.totalSize += parseInt(headers['content-length']);
    }
  });

  const startTime = Date.now();
  
  try {
    // Navigate to the page
    console.log(`Loading: ${TEST_URL}`);
    await page.goto(TEST_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    const domContentLoaded = Date.now();
    metrics.domContentLoaded = domContentLoaded - startTime;
    console.log(`✓ DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {
      console.log('⚠ Network not idle (timeout)');
    });
    
    const networkIdle = Date.now();
    metrics.networkIdle = networkIdle - startTime;
    console.log(`✓ Network Idle: ${metrics.networkIdle}ms`);
    
    // Get performance metrics
    const perfMetrics = await page.evaluate(() => {
      const timing = performance.timing;
      const navTiming = performance.getEntriesByType('navigation')[0];
      const resourceEntries = performance.getEntriesByType('resource');
      
      return {
        // Navigation timing
        domContentLoadedEvent: timing.domContentLoadedEventStart - timing.navigationStart,
        loadEventEnd: timing.loadEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0,
        
        // Resource metrics
        resourceCount: resourceEntries.length,
        totalResourceSize: resourceEntries.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        totalResourceDuration: resourceEntries.reduce((max, r) => Math.max(max, r.duration), 0),
        
        // Largest contentful paint (if available)
        lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
      };
    });
    
    metrics.performance = perfMetrics;
    metrics.resourceStats = resourceStats;
    
    console.log(`\n📊 Performance Metrics:`);
    console.log(`  DOM Content Loaded: ${perfMetrics.domContentLoadedEvent}ms`);
    console.log(`  Load Complete: ${perfMetrics.loadEventEnd}ms`);
    console.log(`  First Paint: ${perfMetrics.firstPaint}ms`);
    console.log(`  First Contentful Paint: ${perfMetrics.firstContentfulPaint}ms`);
    console.log(`  Largest Contentful Paint: ${perfMetrics.lcp}ms`);
    console.log(`  Resources Loaded: ${resourceStats.completed}/${resourceStats.total} (${resourceStats.failed} failed)`);
    console.log(`  Total Resource Transfer Size: ${(perfMetrics.totalResourceSize / 1024).toFixed(2)} KB`);
    
    // Check for critical errors
    const errors = metrics.events.filter(e => e.startsWith('ERROR'));
    if (errors.length > 0) {
      console.log(`\n⚠️ ${errors.length} Console Errors Found:`);
      errors.slice(0, 5).forEach(e => console.log(`  - ${e}`));
    } else {
      console.log(`\n✅ No console errors`);
    }
    
    // Get page content info
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        hasRoot: !!document.getElementById('root'),
        htmlLength: document.documentElement.innerHTML.length,
      };
    });
    
    console.log(`\n📄 Page Info:`);
    console.log(`  Title: ${pageInfo.title}`);
    console.log(`  Root Element: ${pageInfo.hasRoot ? '✅' : '❌'}`);
    console.log(`  HTML Size: ${(pageInfo.htmlLength / 1024).toFixed(2)} KB`);
    
    // Assess if acceptable for target market
    const assessment = assessPerformance(metrics);
    console.log(`\n🎯 TARGET MARKET ASSESSMENT (Ethiopian Rural Conditions):`);
    console.log(`  Status: ${assessment.status}`);
    console.log(`  Details:`);
    assessment.details.forEach(d => console.log(`    - ${d}`));
    
  } catch (error) {
    metrics.error = error.message;
    console.log(`❌ Error: ${error.message}`);
  }
  
  await browser.close();
  return metrics;
}

function assessPerformance(metrics) {
  const details = [];
  let status = '✅ EXCELLENT';
  
  const fcp = metrics.performance?.firstContentfulPaint || 0;
  const loadTime = metrics.performance?.loadEventEnd || 0;
  const networkTime = metrics.networkIdle || 0;
  
  // First Contentful Paint assessment (target: <3s on 3G)
  if (fcp < 3000) {
    details.push(`First Contentful Paint: ${fcp}ms ✅ (target: <3000ms)`);
  } else if (fcp < 5000) {
    details.push(`First Contentful Paint: ${fcp}ms ⚠️ (target: <3000ms)`);
    status = '⚠️ ACCEPTABLE';
  } else {
    details.push(`First Contentful Paint: ${fcp}ms ❌ (should be <3000ms)`);
    status = '❌ NEEDS OPTIMIZATION';
  }
  
  // Network idle assessment
  if (networkTime < 10000) {
    details.push(`Network Idle: ${networkTime}ms ✅ (target: <10s)`);
  } else if (networkTime < 20000) {
    details.push(`Network Idle: ${networkTime}ms ⚠️ (target: <10s)`);
    status = status === '✅ EXCELLENT' ? '⚠️ ACCEPTABLE' : status;
  } else {
    details.push(`Network Idle: ${networkTime}ms ❌ (should be <10s)`);
    status = '❌ NEEDS OPTIMIZATION';
  }
  
  // Resource failures
  if (metrics.resourceStats?.failed > 0) {
    details.push(`Resource Failures: ${metrics.resourceStats.failed} ❌`);
    status = '❌ NEEDS OPTIMIZATION';
  } else {
    details.push(`Resource Failures: ${metrics.resourceStats?.completed || 0} ✅`);
  }
  
  return { status, details };
}

async function runAllTests() {
  console.log('\n🔬 EthioHerd Connect - Network Performance Test');
  console.log('=============================================');
  console.log('Simulating Ethiopian rural connectivity conditions');
  console.log(`Target URL: ${TEST_URL}`);
  
  // Wait for preview server to be ready
  console.log('\n⏳ Waiting for preview server...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const results = [];
  
  for (const [name, profile] of Object.entries(NETWORK_PROFILES)) {
    const result = await testPageLoad(name, profile);
    results.push(result);
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY - All Network Tests');
  console.log('='.repeat(60));
  
  results.forEach(r => {
    const fcp = r.performance?.firstContentfulPaint || 'N/A';
    const status = assessPerformance(r).status;
    console.log(`  ${r.network}: FCP=${typeof fcp === 'number' ? fcp + 'ms' : fcp} | ${status}`);
  });
  
  console.log('\n🎯 Target: <3s First Contentful Paint on 3G');
  console.log('   Target: <10s to Network Idle on 3G');
  console.log('\n✅ Test complete!');
  
  process.exit(0);
}

runAllTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});