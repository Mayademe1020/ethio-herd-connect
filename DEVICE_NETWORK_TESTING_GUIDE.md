# Device and Network Testing Guide

## Overview

This guide provides comprehensive instructions for testing the Ethiopian Livestock Management System across different devices and network conditions to ensure optimal performance for Ethiopian farmers.

## Testing Requirements

Based on Requirements 6.1 and 6.2:
- App must work on old Android devices (Android 8, 2GB RAM)
- App must function on 2G/3G networks
- Offline functionality must be robust
- Performance must be acceptable in low battery mode

---

## 1. Old Android Device Testing (Android 8, 2GB RAM)

### Setup
- **Target Device**: Android 8.0 (Oreo) or equivalent emulator
- **RAM**: 2GB
- **Storage**: Minimum 16GB

### Chrome DevTools Emulation (Alternative)
If physical device unavailable:
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "Edit..." → "Add custom device"
4. Configure:
   - Device Name: "Old Android"
   - Width: 360px, Height: 640px
   - Device pixel ratio: 2
   - User agent: Mozilla/5.0 (Linux; Android 8.0.0; SM-G950F) AppleWebKit/537.36

### Test Cases

#### 1.1 App Launch Performance
- [ ] App loads within 5 seconds on first visit
- [ ] App loads within 3 seconds on subsequent visits (cached)
- [ ] No white screen or crash during load
- [ ] Service worker registers successfully

**How to Test**:
```bash
# Clear cache and reload
# In DevTools Console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
localStorage.clear();
sessionStorage.clear();
location.reload();
```

#### 1.2 Memory Usage
- [ ] App uses <100MB RAM during normal operation
- [ ] No memory leaks during extended use (30+ minutes)
- [ ] App doesn't crash when backgrounded and restored

**How to Test**:
1. Open Chrome DevTools → Performance → Memory
2. Take heap snapshot before actions
3. Perform 20+ actions (register animals, record milk, browse marketplace)
4. Take heap snapshot after
5. Compare memory usage - should not grow unbounded

#### 1.3 UI Responsiveness
- [ ] All buttons respond within 100ms
- [ ] Form inputs don't lag when typing
- [ ] Scrolling is smooth (no jank)
- [ ] Image loading doesn't block UI

**How to Test**:
1. Open DevTools → Performance
2. Record while interacting with app
3. Check for long tasks (>50ms)
4. Verify FPS stays above 30

#### 1.4 Feature Functionality
- [ ] Authentication works (OTP send/verify)
- [ ] Animal registration completes successfully
- [ ] Milk recording saves correctly
- [ ] Marketplace browsing loads listings
- [ ] Photo upload works (with compression)
- [ ] Offline queue processes correctly

---

## 2. Mid-Range Android Device Testing

### Setup
- **Target Device**: Android 11+ with 4GB RAM
- **Purpose**: Verify optimal performance on typical devices

### Test Cases

#### 2.1 Performance Benchmarks
- [ ] App loads within 2 seconds
- [ ] Lighthouse score ≥92/100
- [ ] Time to Interactive <3 seconds
- [ ] First Contentful Paint <1.5 seconds

**How to Test**:
```bash
# Run Lighthouse audit
npm run build
npx serve dist
# Open Chrome DevTools → Lighthouse → Run audit
```

#### 2.2 Advanced Features
- [ ] Multiple photo uploads work smoothly
- [ ] Large animal lists (50+) scroll smoothly
- [ ] Marketplace filtering is instant
- [ ] Sync processes multiple items quickly

---

## 3. 2G Network Simulation Testing

### Setup in Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Change throttling to "Slow 3G" or custom:
   - Download: 50 Kbps
   - Upload: 20 Kbps
   - Latency: 2000ms

### Test Cases

#### 3.1 Initial Load
- [ ] App loads within 10 seconds on 2G
- [ ] Critical content visible within 5 seconds
- [ ] Loading indicators show progress
- [ ] User can interact with cached content immediately

**Expected Behavior**:
- Service worker serves cached assets
- App shell loads first
- Data loads progressively

#### 3.2 Data Operations
- [ ] Animal registration queues offline if timeout
- [ ] Milk recording saves locally immediately
- [ ] Marketplace listings load with pagination
- [ ] Images load progressively (blur → full)

#### 3.3 User Feedback
- [ ] Loading states visible for all async operations
- [ ] Timeout errors show user-friendly messages
- [ ] Retry buttons work correctly
- [ ] Offline indicator appears when appropriate

**How to Test**:
```javascript
// In DevTools Console - simulate network timeout
const originalFetch = window.fetch;
window.fetch = (...args) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Network timeout')), 5000);
  });
};
```

---

## 4. 3G Network Simulation Testing

### Setup in Chrome DevTools
1. Network tab → Throttling → "Fast 3G"
2. Or custom:
   - Download: 1.6 Mbps
   - Upload: 750 Kbps
   - Latency: 150ms

### Test Cases

#### 4.1 Normal Operations
- [ ] App loads within 3 seconds
- [ ] All features work smoothly
- [ ] Images load within 2 seconds
- [ ] Form submissions complete within 1 second

#### 4.2 Concurrent Operations
- [ ] Multiple milk records can be submitted
- [ ] Browsing marketplace while syncing works
- [ ] Photo uploads don't block other operations
- [ ] Background sync processes queue

#### 4.3 Sync Performance
- [ ] Offline queue syncs within 5 seconds per item
- [ ] Retry logic works (exponential backoff)
- [ ] Sync status indicator updates correctly
- [ ] Failed syncs show appropriate errors

---

## 5. Low Battery Mode Testing

### Setup

#### Android
1. Settings → Battery → Battery Saver → ON
2. Or drain battery to <15% (triggers automatically)

#### Chrome Simulation
```javascript
// In DevTools Console
// Simulate reduced performance
performance.setResourceTimingBufferSize(10);
```

### Test Cases

#### 5.1 Core Functionality
- [ ] App remains functional in battery saver mode
- [ ] Critical features work (auth, register, record)
- [ ] Background sync may be delayed (acceptable)
- [ ] No crashes or freezes

#### 5.2 Performance Degradation
- [ ] Animations may be reduced (acceptable)
- [ ] Image loading may be slower (acceptable)
- [ ] Sync may be less frequent (acceptable)
- [ ] App doesn't drain battery excessively

#### 5.3 User Experience
- [ ] User can still complete essential tasks
- [ ] Offline mode works reliably
- [ ] Data is not lost
- [ ] App can be backgrounded and restored

---

## 6. Automated Testing Script

Create a test script to verify key functionality:

```javascript
// test-device-network.js
async function runDeviceNetworkTests() {
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Service Worker Registration
  try {
    const registration = await navigator.serviceWorker.ready;
    results.tests.push({ name: 'Service Worker', status: 'PASS' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Service Worker', status: 'FAIL', error });
    results.failed++;
  }

  // Test 2: IndexedDB Available
  try {
    const db = await indexedDB.open('test-db', 1);
    db.close();
    results.tests.push({ name: 'IndexedDB', status: 'PASS' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'IndexedDB', status: 'FAIL', error });
    results.failed++;
  }

  // Test 3: Local Storage Available
  try {
    localStorage.setItem('test', 'value');
    localStorage.removeItem('test');
    results.tests.push({ name: 'LocalStorage', status: 'PASS' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'LocalStorage', status: 'FAIL', error });
    results.failed++;
  }

  // Test 4: Network Detection
  try {
    const online = navigator.onLine;
    results.tests.push({ 
      name: 'Network Detection', 
      status: 'PASS',
      info: `Online: ${online}`
    });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Network Detection', status: 'FAIL', error });
    results.failed++;
  }

  // Test 5: Performance API
  try {
    const timing = performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    results.tests.push({ 
      name: 'Performance API', 
      status: 'PASS',
      info: `Load time: ${loadTime}ms`
    });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Performance API', status: 'FAIL', error });
    results.failed++;
  }

  return results;
}

// Run tests
runDeviceNetworkTests().then(results => {
  console.log('=== Device & Network Test Results ===');
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log('\nDetails:');
  results.tests.forEach(test => {
    console.log(`${test.status}: ${test.name}`, test.info || test.error || '');
  });
});
```

---

## 7. Manual Testing Checklist

### Pre-Testing Setup
- [ ] Build production bundle: `npm run build`
- [ ] Serve locally: `npx serve dist`
- [ ] Open in Chrome with DevTools

### Test Sequence

#### Round 1: Old Android + 2G
- [ ] Set device emulation to old Android
- [ ] Set network to Slow 3G
- [ ] Clear cache and reload
- [ ] Complete full user journey (auth → register animal → record milk)
- [ ] Document any issues

#### Round 2: Old Android + 3G
- [ ] Keep device emulation
- [ ] Change network to Fast 3G
- [ ] Test all features
- [ ] Verify performance improvements

#### Round 3: Mid-Range + 2G
- [ ] Change to mid-range device emulation
- [ ] Set network to Slow 3G
- [ ] Test all features
- [ ] Compare with Round 1

#### Round 4: Mid-Range + 3G
- [ ] Keep mid-range device
- [ ] Change network to Fast 3G
- [ ] Run Lighthouse audit
- [ ] Verify optimal performance

#### Round 5: Low Battery Simulation
- [ ] Enable battery saver mode (if on device)
- [ ] Or reduce CPU throttling in DevTools
- [ ] Test core features
- [ ] Verify no crashes

---

## 8. Performance Metrics to Collect

### Load Performance
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

### Runtime Performance
- JavaScript heap size
- DOM nodes count
- Event listener count
- Long tasks (>50ms)
- Frame rate (FPS)

### Network Performance
- Total requests
- Total transfer size
- Cached resources
- Failed requests
- Average request time

---

## 9. Common Issues and Solutions

### Issue: App doesn't load on old Android
**Solution**: Check for unsupported JavaScript features, add polyfills

### Issue: Images don't load on 2G
**Solution**: Verify image compression, implement progressive loading

### Issue: Offline sync fails
**Solution**: Check IndexedDB support, verify service worker registration

### Issue: App crashes in low battery mode
**Solution**: Reduce background operations, optimize animations

### Issue: Forms lag on old devices
**Solution**: Debounce input handlers, reduce re-renders

---

## 10. Success Criteria

### Must Pass
- ✅ App loads on Android 8 with 2GB RAM
- ✅ Core features work on 2G network
- ✅ Offline functionality works reliably
- ✅ No crashes in low battery mode
- ✅ Load time <5 seconds on 3G

### Should Pass
- ✅ Lighthouse score ≥92 on mid-range device
- ✅ Smooth scrolling on old devices
- ✅ Images load progressively
- ✅ Sync completes within 10 seconds

### Nice to Have
- ✅ Load time <3 seconds on 3G
- ✅ 60 FPS on mid-range devices
- ✅ Instant UI feedback on all devices

---

## 11. Reporting Template

```markdown
## Device & Network Testing Report

**Date**: [Date]
**Tester**: [Name]
**Build Version**: [Version]

### Test Environment
- Device: [Device name/emulation]
- OS: [Android version]
- RAM: [Amount]
- Network: [2G/3G/4G]
- Battery: [Normal/Low]

### Results Summary
- Total Tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Blocked: [Number]

### Critical Issues
1. [Issue description]
   - Severity: [Critical/High/Medium/Low]
   - Steps to reproduce: [Steps]
   - Expected: [Expected behavior]
   - Actual: [Actual behavior]

### Performance Metrics
- Load Time: [Seconds]
- TTI: [Seconds]
- Lighthouse Score: [Score]
- Memory Usage: [MB]

### Recommendations
1. [Recommendation]
2. [Recommendation]

### Screenshots
[Attach relevant screenshots]
```

---

## Next Steps

After completing all tests:
1. Document all findings in test report
2. Prioritize issues by severity
3. Fix critical issues immediately
4. Create backlog for non-critical issues
5. Re-test after fixes
6. Get sign-off before exhibition

