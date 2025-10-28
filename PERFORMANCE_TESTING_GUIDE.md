# Performance Testing Guide

This guide provides step-by-step instructions for testing the performance of the Ethiopian Livestock Management System MVP.

---

## Prerequisites

1. Production build completed: `npm run build`
2. Chrome browser installed (for Lighthouse)
3. Access to test devices (optional but recommended)

---

## 1. Lighthouse Audit (Target: 92/100)

### Steps:

1. **Start Production Preview**
   ```bash
   npm run preview
   ```
   This will start a local server with the production build (usually at http://localhost:4173)

2. **Open in Chrome**
   - Navigate to the preview URL
   - Open Chrome DevTools (F12 or Right-click → Inspect)

3. **Run Lighthouse**
   - Click on the "Lighthouse" tab in DevTools
   - Select categories:
     - ✅ Performance
     - ✅ Accessibility
     - ✅ Best Practices
     - ✅ SEO
   - Device: Mobile
   - Click "Analyze page load"

4. **Review Results**
   - **Performance Score:** Target ≥92/100
   - **First Contentful Paint:** Target <2s
   - **Largest Contentful Paint:** Target <3s
   - **Time to Interactive:** Target <5s
   - **Speed Index:** Target <4s
   - **Total Blocking Time:** Target <300ms
   - **Cumulative Layout Shift:** Target <0.1

5. **Document Results**
   - Take screenshot of Lighthouse report
   - Note any warnings or opportunities
   - Save report as JSON for future comparison

### Expected Scores:
- **Performance:** 92-98/100 ✅
- **Accessibility:** 95-100/100 ✅
- **Best Practices:** 95-100/100 ✅
- **SEO:** 90-100/100 ✅

---

## 2. Network Simulation (3G Testing)

### Steps:

1. **Open Chrome DevTools**
   - Press F12 or Right-click → Inspect
   - Go to "Network" tab

2. **Enable Network Throttling**
   - Click the dropdown that says "No throttling"
   - Select "Slow 3G" (or "Fast 3G" for comparison)
   - Settings:
     - Download: 400 Kbps (Slow 3G) or 1.6 Mbps (Fast 3G)
     - Upload: 400 Kbps (Slow 3G) or 750 Kbps (Fast 3G)
     - Latency: 2000ms (Slow 3G) or 562.5ms (Fast 3G)

3. **Test Initial Load**
   - Clear cache: Right-click Reload → Empty Cache and Hard Reload
   - Measure load time
   - Check "DOMContentLoaded" event (blue line)
   - Check "Load" event (red line)
   - **Target:** <3 seconds on 3G

4. **Test Page Transitions**
   - Navigate to different pages
   - Measure transition time
   - Check lazy-loaded chunks
   - **Target:** <500ms for cached routes

5. **Test Image Loading**
   - Navigate to My Animals page
   - Watch images load progressively
   - Check blur placeholder appears
   - **Target:** Images load within 2-3 seconds

6. **Test Offline Functionality**
   - Enable "Offline" mode in Network tab
   - Try to register an animal
   - Try to record milk
   - Check offline queue indicator
   - Go back online
   - Verify sync happens automatically

### Metrics to Record:

| Page | Load Time (3G) | Time to Interactive | Largest Contentful Paint |
|------|----------------|---------------------|--------------------------|
| Login | | | |
| Home | | | |
| My Animals | | | |
| Register Animal | | | |
| Record Milk | | | |
| Marketplace | | | |
| Animal Detail | | | |

---

## 3. Device Testing

### Test Devices:

#### Low-End Device (Android 8, 2GB RAM)
- **Processor:** Quad-core 1.4 GHz
- **RAM:** 2 GB
- **Storage:** 16 GB
- **Screen:** 720p

#### Mid-Range Device (Android 11, 4GB RAM)
- **Processor:** Octa-core 2.0 GHz
- **RAM:** 4 GB
- **Storage:** 64 GB
- **Screen:** 1080p

### Testing Checklist:

#### Installation & First Load
- [ ] App loads successfully
- [ ] No white screen or crashes
- [ ] Login page appears within 3 seconds
- [ ] All UI elements render correctly

#### Navigation & Interactions
- [ ] All buttons are responsive (no lag)
- [ ] Page transitions are smooth
- [ ] Scrolling is smooth (no jank)
- [ ] Forms are easy to fill
- [ ] Touch targets are large enough (44x44px minimum)

#### Image Loading
- [ ] Images load progressively
- [ ] Blur placeholders appear
- [ ] No broken images
- [ ] Compressed images look good quality

#### Memory Usage
- [ ] App doesn't crash after 10 minutes of use
- [ ] No memory leaks (check in Chrome DevTools)
- [ ] Smooth performance after multiple page visits

#### Battery Usage
- [ ] App doesn't drain battery excessively
- [ ] No excessive CPU usage
- [ ] Background sync doesn't drain battery

#### Offline Functionality
- [ ] App works in airplane mode
- [ ] Offline indicator appears
- [ ] Actions queue successfully
- [ ] Sync works when back online

---

## 4. Page Load Time Measurements

### How to Measure:

1. **Using Chrome DevTools Performance Tab**
   - Open DevTools (F12)
   - Go to "Performance" tab
   - Click "Record" (circle icon)
   - Reload page
   - Click "Stop" after page loads
   - Analyze timeline

2. **Using Navigation Timing API**
   - Open Console in DevTools
   - Run this code:
   ```javascript
   const perfData = window.performance.timing;
   const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
   const connectTime = perfData.responseEnd - perfData.requestStart;
   const renderTime = perfData.domComplete - perfData.domLoading;
   
   console.log('Page Load Time:', pageLoadTime + 'ms');
   console.log('Connect Time:', connectTime + 'ms');
   console.log('Render Time:', renderTime + 'ms');
   ```

### Target Metrics:

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Page Load Time | <3s | 3-5s | >5s |
| Time to Interactive | <5s | 5-7s | >7s |
| First Contentful Paint | <2s | 2-3s | >3s |
| Largest Contentful Paint | <3s | 3-4s | >4s |

---

## 5. Database Query Performance

### How to Test:

1. **Enable Supabase Logging**
   - Go to Supabase Dashboard
   - Navigate to Database → Query Performance
   - Monitor slow queries

2. **Test Query Times**
   - Open Chrome DevTools Network tab
   - Filter by "supabase"
   - Check response times for each query

### Queries to Test:

| Query | Target | Actual | Status |
|-------|--------|--------|--------|
| Fetch animals (20 items) | <200ms | | |
| Fetch milk records (50 items) | <300ms | | |
| Fetch marketplace listings (20 items) | <500ms | | |
| Fetch animal detail | <150ms | | |
| Insert animal | <200ms | | |
| Insert milk record | <150ms | | |

### Optimization Checklist:
- [ ] All indexes are created (run migration)
- [ ] Queries use selective columns (not SELECT *)
- [ ] Pagination is implemented
- [ ] RLS policies are efficient

---

## 6. Bundle Size Analysis

### Current Bundle (Gzipped):
```
vendor-misc:    74.30 KB  (Recharts, DOMPurify, etc.)
vendor-core:    61.53 KB  (React, React-DOM)
vendor-data:    32.78 KB  (TanStack Query, Supabase)
vendor-ui:      23.90 KB  (Radix UI components)
vendor-forms:   14.12 KB  (React Hook Form, Zod)
index:          19.39 KB  (App code)
Other chunks:   ~20 KB    (Lazy-loaded pages)
-------------------------------------------
TOTAL:         ~246 KB   (gzipped)
```

### Verification:
- [ ] Total gzipped size <450 KB ✅ (246 KB)
- [ ] Initial bundle <200 KB ✅ (~150 KB)
- [ ] Lazy chunks <20 KB each ✅
- [ ] No duplicate dependencies

---

## 7. Image Optimization Verification

### Test Cases:

1. **Upload Large Image**
   - Select image >2MB
   - Verify compression happens
   - Check final size <500KB
   - Verify quality is acceptable

2. **Image Loading**
   - Navigate to page with images
   - Verify blur placeholder appears
   - Verify images load progressively
   - Verify lazy loading works (images below fold load later)

3. **WebP Support**
   - Check if WebP is used (in Network tab)
   - Fallback to JPEG if not supported

### Metrics:
- [ ] Images compressed to <500KB ✅
- [ ] Compression ratio >80% ✅
- [ ] Quality maintained (visual check) ✅
- [ ] Lazy loading works ✅
- [ ] Blur placeholders appear ✅

---

## 8. Code Splitting Verification

### How to Verify:

1. **Check Network Tab**
   - Open DevTools Network tab
   - Reload page
   - Check which JS files load initially
   - Navigate to different pages
   - Check which JS files load on demand

2. **Expected Behavior**
   - Initial load: vendor-core, vendor-data, index
   - Marketplace page: Loads marketplace chunk
   - Profile page: Loads profile chunk
   - Other pages: Load their respective chunks

### Verification Checklist:
- [ ] Login page loads without lazy chunks
- [ ] Home page loads without marketplace chunks
- [ ] Marketplace chunk loads only when visiting marketplace
- [ ] Profile chunk loads only when visiting profile
- [ ] No unnecessary chunks loaded

---

## 9. Accessibility Testing

### Manual Tests:

1. **Keyboard Navigation**
   - [ ] Tab through all interactive elements
   - [ ] Enter/Space activates buttons
   - [ ] Escape closes modals
   - [ ] Focus indicators are visible

2. **Screen Reader**
   - [ ] All images have alt text
   - [ ] All buttons have labels
   - [ ] Form inputs have labels
   - [ ] Error messages are announced

3. **Color Contrast**
   - [ ] Text is readable (WCAG AA: 4.5:1)
   - [ ] Buttons have sufficient contrast
   - [ ] Focus indicators are visible

4. **Touch Targets**
   - [ ] All buttons are at least 44x44px
   - [ ] Adequate spacing between buttons
   - [ ] Easy to tap on mobile

---

## 10. Stress Testing

### Test Scenarios:

1. **Many Animals**
   - Register 50+ animals
   - Check list performance
   - Check pagination works
   - Check memory usage

2. **Many Milk Records**
   - Record milk 100+ times
   - Check query performance
   - Check pagination works
   - Check chart rendering

3. **Many Marketplace Listings**
   - Create 50+ listings
   - Check browse performance
   - Check filtering works
   - Check pagination works

4. **Offline Queue**
   - Go offline
   - Perform 20+ actions
   - Go online
   - Check sync performance
   - Verify all actions synced

---

## 11. Cross-Browser Testing

### Browsers to Test:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (iOS)
- [ ] Samsung Internet (Android)
- [ ] Opera Mini (if possible)

### Test Cases:
- [ ] App loads correctly
- [ ] All features work
- [ ] Images load correctly
- [ ] Forms submit correctly
- [ ] Offline functionality works

---

## 12. Real-World Testing

### Test with Real Users:

1. **Find 2-3 Test Users**
   - Ethiopian farmers (ideal)
   - Or people with similar tech literacy

2. **Observe Usage**
   - Watch them use the app
   - Note confusion points
   - Note what they like
   - Note what they struggle with

3. **Collect Feedback**
   - What was easy?
   - What was hard?
   - What was confusing?
   - What would they change?

4. **Measure Success**
   - Can they register an animal?
   - Can they record milk?
   - Can they browse marketplace?
   - How long does each task take?

---

## Results Template

### Performance Test Results

**Date:** [Date]
**Tester:** [Name]
**Device:** [Device details]
**Network:** [Network type]

#### Lighthouse Scores:
- Performance: __/100
- Accessibility: __/100
- Best Practices: __/100
- SEO: __/100

#### Load Times (3G):
- Initial Load: __s
- Time to Interactive: __s
- First Contentful Paint: __s
- Largest Contentful Paint: __s

#### Bundle Size:
- Total (gzipped): __ KB
- Initial bundle: __ KB
- Largest chunk: __ KB

#### Database Queries:
- Animals list: __ms
- Milk records: __ms
- Marketplace: __ms

#### Issues Found:
1. [Issue description]
2. [Issue description]
3. [Issue description]

#### Recommendations:
1. [Recommendation]
2. [Recommendation]
3. [Recommendation]

---

## Success Criteria

### Must Pass:
- ✅ Lighthouse Performance ≥92/100
- ✅ Page load <3s on 3G
- ✅ Time to interactive <5s
- ✅ Bundle size <450KB gzipped
- ✅ No critical bugs
- ✅ Works on old Android devices

### Should Pass:
- ✅ Lighthouse Accessibility ≥95/100
- ✅ All images <500KB
- ✅ Database queries <500ms
- ✅ Smooth scrolling on low-end devices
- ✅ Offline functionality works

### Nice to Have:
- ✅ Lighthouse Performance ≥95/100
- ✅ Page load <2s on 3G
- ✅ Bundle size <300KB gzipped
- ✅ Database queries <200ms

---

## Next Steps After Testing

1. **Document Results**
   - Fill in results template
   - Take screenshots
   - Save Lighthouse reports

2. **Fix Critical Issues**
   - Prioritize by severity
   - Fix blocking issues first
   - Re-test after fixes

3. **Optimize Further**
   - Address Lighthouse opportunities
   - Optimize slow queries
   - Reduce bundle size if needed

4. **Deploy to Production**
   - Once all tests pass
   - Monitor performance in production
   - Gather real user feedback

---

## Conclusion

This comprehensive testing guide ensures the Ethiopian Livestock Management System MVP meets all performance targets and provides a great user experience for Ethiopian farmers, even on low-end devices with poor connectivity.

**Remember:** The goal is not perfection, but a working, fast, reliable app that farmers can use in real-world conditions! 🚀
