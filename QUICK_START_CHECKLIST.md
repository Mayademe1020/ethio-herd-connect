# Quick Start Checklist - Exhibition Sprint

**Print this and keep it visible while working!**

---

## 🎯 TODAY'S FOCUS

**Current Task:** _________________  
**Time Started:** _________________  
**Expected Completion:** _________________

---

## ✅ CRITICAL PATH (Must Complete)

### Phase 1: Demo Data (3.5 hours)
- [ ] Create `scripts/seed-demo-data.ts`
- [ ] Seed 3 demo accounts
- [ ] Seed 20 animals
- [ ] Seed 30 milk records
- [ ] Seed 10 marketplace listings
- [ ] Test: `npm run seed:demo` works

### Phase 2: Demo Mode (4 hours)
- [ ] Create `DemoModeContext.tsx`
- [ ] Add keyboard shortcut (Ctrl+Shift+D)
- [ ] Add UI indicator (🎬 DEMO MODE)
- [ ] Pre-fill animal registration
- [ ] Pre-fill milk recording
- [ ] Pre-fill marketplace listing
- [ ] Test: Toggle works on all pages

### Phase 3: Analytics (3 hours)
- [ ] Create analytics Supabase table
- [ ] Create `src/lib/analytics.ts`
- [ ] Track animal registration
- [ ] Track milk recording
- [ ] Track marketplace actions
- [ ] Create analytics dashboard
- [ ] Test: Events appear in dashboard

### Phase 4: Photo Compression (2 hours)
- [ ] Update `compressImage()` to target 100KB
- [ ] Add progress indicator
- [ ] Show before/after sizes
- [ ] Add upload progress
- [ ] Test: 5MB photo → <100KB in <2 seconds

### Phase 5: Core Tests (2.5 hours)
- [ ] Animal registration tests
- [ ] Milk recording tests
- [ ] Marketplace tests
- [ ] Offline queue tests
- [ ] Test: `npm test` passes

### Phase 6: Deploy (1 hour)
- [ ] Create GitHub Actions workflow
- [ ] Set up Vercel project
- [ ] Configure environment variables
- [ ] Deploy to production
- [ ] Test: Production URL works

**TOTAL: 16 hours (Critical Path)**

---

## 🔥 QUICK WINS (Do These First)

1. **Demo Data Seeding** - Enables everything else
2. **Demo Mode Toggle** - Makes demos smooth
3. **Photo Compression** - Fixes slow uploads
4. **Critical Bug Fixes** - Improves UX

---

## 🚨 BLOCKERS TO WATCH FOR

- [ ] Supabase connection issues
- [ ] TypeScript errors
- [ ] Test failures
- [ ] Build errors
- [ ] Deployment failures

**If blocked:** Check troubleshooting section in execution guide

---

## 📱 TESTING CHECKLIST

### Before Each Commit
- [ ] `npm run type-check` passes
- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] Manual test in browser

### Before End of Day
- [ ] All day's tasks complete
- [ ] Tests pass
- [ ] Code committed
- [ ] Progress updated

### Before Exhibition
- [ ] All critical path complete
- [ ] Tested on 3+ devices
- [ ] Demo script practiced
- [ ] Backup plan ready

---

## 🎬 DEMO MODE SHORTCUTS

**Toggle Demo Mode:** `Ctrl + Shift + D`  
**Seed Demo Data:** `npm run seed:demo`  
**Reset Demo Data:** `npm run reset:demo`

---

## 📊 DAILY PROGRESS

### Day 1 Target: 8 hours
- [ ] Demo data seeding (3.5h)
- [ ] Demo mode basics (2.5h)
- [ ] Analytics setup (2h)

### Day 2 Target: 8 hours
- [ ] Complete demo mode (1.5h)
- [ ] Complete analytics (1h)
- [ ] Photo compression (2h)
- [ ] Core tests (2.5h)
- [ ] Bug fixes (1h)

### Day 3 Target: 8 hours
- [ ] Stress testing (2h)
- [ ] Device testing (2h)
- [ ] Production deploy (2h)
- [ ] Exhibition prep (2h)

---

## 🎯 SUCCESS METRICS

**By End of Sprint:**
- ✅ Demo data seeds in <30 seconds
- ✅ Demo mode works on all pages
- ✅ Analytics tracks all key events
- ✅ Photos compress to <100KB
- ✅ Tests pass (>60% coverage)
- ✅ Deployed to production
- ✅ Demo script ready

---

## 💡 REMEMBER

1. **Focus on critical path first**
2. **Test as you go**
3. **Commit often**
4. **Ask for help if blocked**
5. **Take breaks every 2 hours**

---

## 📞 EMERGENCY CONTACTS

**Supabase Issues:** Check dashboard first  
**Build Issues:** Clear cache, reinstall deps  
**Test Issues:** Run with `--verbose` flag  
**Deploy Issues:** Check Vercel logs

---

## ✨ YOU'VE GOT THIS!

**Current Sprint Day:** _____ of 3  
**Hours Completed:** _____ of 24  
**Tasks Completed:** _____ of 10  
**Confidence Level:** 😰 😐 😊 😎 🚀

**Next Task:** _____________________

