# Performance Testing Guide for Ethiopian Farmers

## Overview

This guide provides step-by-step instructions for testing the performance optimizations implemented for Ethio Herd Connect. The application is optimized for Ethiopian farmers with basic smartphones (2GB RAM), slow 3G connections, and limited mobile data.

## Performance Targets

### Bundle Size (Gzipped)
- ✅ **Initial Bundle**: ~230 KB (Target: < 250 KB)
  - vendor-core: 61.44 KB
  - vendor-misc: 78.40 KB
  - vendor-data: 32.78 KB
  - vendor-ui: 31.62 KB
  - index: 26.64 KB
- ✅ **Total Bundle**: ~300 KB (Target: < 500 KB)
- ✅ **Largest Chunk**: 78.40 KB (Target: < 100 KB)

### Load Time Metrics
- **First Contentful Paint (FCP)**: < 2s on 3G
- **Time to Interactive (TTI)**: < 4s on 3G
- **Largest Contentful Paint (LCP)**: < 3s on 3G
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Total Blocking Time (TBT)**: < 300ms

### Resource Limits
- **JavaScript**: < 500 KB (gzipped)
- **CSS**: < 50 KB (gzipped)
- **Images**: < 1 MB per page
- **Memory Usage**: < 100 MB

## Testing Procedures

### 1. Bundle Size Analysis

#### Run Build and Analysis
```bash
# Build for production
npm run build

# Analyze bundle
node scripts/analyze-bundle.js
```

#### Expected Results
- Total JavaScript: < 500 KB (gzipped)
- CSS: < 50 KB (gzipped)
- No single chunk > 100 KB (gzipped)
- Detailed visualization at `dist/stats.html`

#### What to Check
- [ ] All vendor chunks are properly split
- [ ] Route components are lazy-loaded
- [ ] Heavy components (charts) are in separate chunks
- [ ] No duplicate dependencies

### 2. Network Performance Testing

#### Chrome DevTools Network Throttling

1. **Open Chrome DevTools** (F12)
2. **Go to Network tab**
3. **Select "Slow 3G" from throttling dropdown**
4. **Disable cache** (check "Disable cache")
5. **Reload page** (Ctrl+Shift+R)

#### Metrics to Measure
- [ ] **Page Load Time**: < 4 seconds
- [ ] **First Contentful Paint**: < 2 seconds
- [ ] **Time to Interactive**: < 4 seconds
- [ ] **Total Page Weight**: < 1 MB

#### Test Scenarios
1. **Home Page Load**
   - Clear cache
   - Navigate to `/`
   - Measure load time
   - Expected: < 3s on Slow 3G

2. **Animals Page Load**
   - Navigate to `/animals`
   - Measure lazy loading of route
   - Expected: < 2s additional load time

3. **Marketplace Page Load**
   - Navigate to `/marketplace`
   - Measure image lazy loading
   - Expected: Images load as you scroll

4. **Offline to Online Transition**
   - Go offline (DevTools Network: Offline)
   - Navigate pages (should work from cache)
   - Go online
   - Verify sync works

### 3. Image Optimization Testing

#### Lazy Loading Verification

1. **Open Chrome DevTools** (F12)
2. **Go to Network tab**
3. **Filter by "Img"**
4. **Scroll slowly through page**

#### What to Check
- [ ] Images only load when entering viewport
- [ ] Placeholder shown before image loads
- [ ] Progressive loading (blur to sharp)
- [ ] No images load above the fold initially

#### Network-Aware Quality

1. **Test on Fast 4G**
   - Images should load at high quality
   - Quick loading

2. **Test on Slow 3G**
   - Images should load at medium quality
   - Smaller file sizes

3. **Test with Data Saver**
   - Enable data saver in browser
   - Images should load at low quality
   - Minimal data usage

### 4. Code Splitting Verification

#### Route-Based Splitting

1. **Open Chrome DevTools** (F12)
2. **Go to Network tab**
3. **Filter by "JS"**
4. **Navigate between routes**

#### What to Check
- [ ] Only initial bundle loads on home page
- [ ] Route chunks load on demand
- [ ] Vendor chunks cached between routes
- [ ] No duplicate code in chunks

#### Component-Based Splitting

1. **Navigate to Analytics page**
   - Charts should lazy load
   - Separate chunk for recharts

2. **Open Advanced Filters**
   - Filter component should lazy load
   - Separate chunk for filters

### 5. Low-End Device Testing

#### Simulated Low-End Device (Chrome DevTools)

1. **Open Chrome DevTools** (F12)
2. **Go to Performance tab**
3. **Click gear icon**
4. **Set CPU throttling to "6x slowdown"**
5. **Set Network to "Slow 3G"**
6. **Record performance**

#### Metrics to Check
- [ ] **Scripting Time**: < 2s
- [ ] **Rendering Time**: < 1s
- [ ] **Painting Time**: < 500ms
- [ ] **No long tasks** (> 50ms)

#### Real Device Testing

**Recommended Test Devices:**
- Samsung Galaxy J2 (2GB RAM)
- Nokia 2.1 (1GB RAM)
- Tecno Spark 2 (1GB RAM)

**Test Scenarios:**
1. **App Launch**
   - Time from tap to interactive
   - Expected: < 5s

2. **Page Navigation**
   - Time between route changes
   - Expected: < 2s

3. **Scroll Performance**
   - Smooth scrolling (60fps)
   - No jank or stuttering

4. **Form Interactions**
   - Input responsiveness
   - No lag when typing

5. **Memory Usage**
   - Monitor RAM usage
   - Expected: < 100 MB

### 6. Lighthouse Audit

#### Run Lighthouse

1. **Open Chrome DevTools** (F12)
2. **Go to Lighthouse tab**
3. **Select "Mobile" device**
4. **Select "Slow 4G" throttling**
5. **Check all categories**
6. **Click "Generate report"**

#### Target Scores
- [ ] **Performance**: > 90
- [ ] **Accessibility**: > 90
- [ ] **Best Practices**: > 90
- [ ] **SEO**: > 90

#### Key Metrics
- [ ] **First Contentful Paint**: < 2s
- [ ] **Speed Index**: < 4s
- [ ] **Largest Contentful Paint**: < 3s
- [ ] **Time to Interactive**: < 4s
- [ ] **Total Blocking Time**: < 300ms
- [ ] **Cumulative Layout Shift**: < 0.1

### 7. Memory Profiling

#### Chrome DevTools Memory Profiler

1. **Open Chrome DevTools** (F12)
2. **Go to Memory tab**
3. **Take heap snapshot**
4. **Navigate through app**
5. **Take another snapshot**
6. **Compare snapshots**

#### What to Check
- [ ] No memory leaks (increasing heap size)
- [ ] Detached DOM nodes cleaned up
- [ ] Event listeners removed on unmount
- [ ] Images garbage collected
- [ ] Total memory < 100 MB

### 8. Offline Functionality Testing

#### Service Worker Verification

1. **Open Chrome DevTools** (F12)
2. **Go to Application tab**
3. **Check Service Workers**
4. **Verify registration**

#### Offline Test Scenarios

1. **View Animal Records Offline**
   - Load animals page online
   - Go offline
   - Refresh page
   - Expected: Animals still visible

2. **Record Health Event Offline**
   - Go offline
   - Record health event
   - Expected: Saved to queue

3. **Sync When Online**
   - Go online
   - Expected: Queue syncs automatically
   - Notification shown

4. **Offline Indicator**
   - Go offline
   - Expected: Offline indicator visible
   - Clear messaging

### 9. Real-World Testing

#### Ethiopian Network Simulation

**Tools:**
- Network Link Conditioner (Mac)
- Charles Proxy
- Throttle (Chrome Extension)

**Network Profiles:**
- **Urban 3G**: 750 Kbps, 100ms latency
- **Rural 3G**: 400 Kbps, 200ms latency
- **2G Fallback**: 250 Kbps, 400ms latency

#### Test Locations (If Possible)
- Addis Ababa (urban)
- Bahir Dar (semi-urban)
- Rural areas (if accessible)

#### User Testing
- Recruit 5-10 Ethiopian farmers
- Provide test devices
- Observe usage patterns
- Collect feedback

### 10. Continuous Monitoring

#### Production Monitoring

**Metrics to Track:**
- Page load times
- Error rates
- User device types
- Network speeds
- Memory usage
- Crash reports

**Tools:**
- Google Analytics
- Sentry (error tracking)
- Custom performance monitoring

#### Performance Budget

Set up alerts for:
- Bundle size > 500 KB
- Page load time > 5s
- Error rate > 1%
- Memory usage > 150 MB

## Troubleshooting

### Slow Page Load

**Symptoms:**
- Page takes > 5s to load
- White screen for extended period

**Diagnosis:**
1. Check bundle size
2. Verify lazy loading
3. Check network tab for large resources
4. Profile with Lighthouse

**Solutions:**
- Reduce bundle size
- Lazy load more components
- Optimize images
- Enable compression

### High Memory Usage

**Symptoms:**
- App crashes on low-end devices
- Slow performance over time

**Diagnosis:**
1. Take memory snapshots
2. Check for memory leaks
3. Profile component renders

**Solutions:**
- Fix memory leaks
- Optimize component re-renders
- Reduce cached data
- Implement pagination

### Images Not Loading

**Symptoms:**
- Broken image icons
- Images don't appear

**Diagnosis:**
1. Check network tab
2. Verify image URLs
3. Check lazy loading implementation

**Solutions:**
- Fix image URLs
- Verify lazy loading observer
- Check error handling
- Optimize image sizes

### Offline Sync Issues

**Symptoms:**
- Data not syncing when online
- Duplicate entries

**Diagnosis:**
1. Check offline queue
2. Verify service worker
3. Check sync logic

**Solutions:**
- Fix queue processing
- Verify deduplication
- Check error handling
- Test retry logic

## Performance Checklist

Before deploying to production:

### Build & Bundle
- [ ] Run production build
- [ ] Analyze bundle size
- [ ] Verify code splitting
- [ ] Check for duplicates
- [ ] Review stats.html

### Network Performance
- [ ] Test on Slow 3G
- [ ] Verify lazy loading
- [ ] Check image optimization
- [ ] Test offline functionality
- [ ] Verify caching

### Device Performance
- [ ] Test on low-end device
- [ ] Check memory usage
- [ ] Verify smooth scrolling
- [ ] Test form interactions
- [ ] Check battery usage

### Quality Metrics
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Verify accessibility
- [ ] Test SEO
- [ ] Review best practices

### User Experience
- [ ] Test with real users
- [ ] Collect feedback
- [ ] Verify translations
- [ ] Check error handling
- [ ] Test edge cases

## Resources

### Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)

### Documentation
- [Web Vitals](https://web.dev/vitals/)
- [Performance Optimization](https://web.dev/fast/)
- [Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Code Splitting](https://web.dev/reduce-javascript-payloads-with-code-splitting/)

### Ethiopian Context
- [Mobile Data Costs in Ethiopia](https://www.cable.co.uk/mobiles/worldwide-data-pricing/)
- [Network Coverage in Ethiopia](https://www.gsma.com/coverage/)
- [Device Statistics](https://gs.statcounter.com/vendor-market-share/mobile/ethiopia)

---

**Last Updated:** January 2025
**Target Audience:** Developers, QA Engineers
**Maintenance:** Update after each major release
