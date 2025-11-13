# Exhibition Sprint Execution Guide
**Start Date:** Today  
**Duration:** 20-24 hours (3 days)  
**Goal:** Production-ready, demo-polished app

---

## 🚀 QUICK START (Next 30 Minutes)

### Step 1: Review the Spec
```bash
# Read these files in order:
1. .kiro/specs/exhibition-readiness/requirements.md  (10 min)
2. .kiro/specs/exhibition-readiness/design.md        (10 min)
3. .kiro/specs/exhibition-readiness/tasks.md         (10 min)
```

### Step 2: Set Up Your Environment
```bash
# Install any missing dependencies
npm install

# Verify tests run
npm test

# Verify build works
npm run build

# Start dev server
npm run dev
```

### Step 3: Start with Task 1.1
Open the tasks file and click "Start task" next to:
**Task 1.1: Create demo data seeding script**

---

## 📋 EXECUTION STRATEGY

### Day 1: Foundation (8 hours)
**Focus:** Demo infrastructure that everything else depends on

**Morning (4 hours):**
- ✅ Task 1.1-1.5: Demo data seeding system
- ✅ Task 1.6: Test demo data

**Afternoon (4 hours):**
- ✅ Task 2.1-2.3: Demo mode context and animal registration
- ✅ Task 3.1-3.2: Analytics infrastructure and animal tracking

**End of Day 1 Checkpoint:**
- Can run `npm run seed:demo` successfully
- Demo mode toggle works
- Analytics tracks animal registration

---

### Day 2: Features & Testing (8 hours)
**Focus:** Complete features and ensure quality

**Morning (4 hours):**
- ✅ Task 2.4-2.6: Complete demo mode integration
- ✅ Task 3.3-3.6: Complete analytics integration
- ✅ Task 4.1-4.3: Photo compression optimization

**Afternoon (4 hours):**
- ✅ Task 5.1-5.5: Core test suite
- ✅ Task 10.1-10.5: Critical bug fixes

**End of Day 2 Checkpoint:**
- Demo mode works on all pages
- Analytics tracks all key events
- Photo compression targets 100KB
- Core tests pass

---

### Day 3: Polish & Deploy (8 hours)
**Focus:** Testing, deployment, and exhibition prep

**Morning (4 hours):**
- ✅ Task 5.6-5.9: Complete test suite
- ✅ Task 6.1-6.5: Stress testing
- ✅ Task 7.1-7.3: Device testing (start)

**Afternoon (4 hours):**
- ✅ Task 7.4-7.7: Complete device testing
- ✅ Task 8.1-8.5: Production deployment
- ✅ Task 9.1-9.4: Exhibition materials

**End of Day 3 Checkpoint:**
- All tests pass
- Deployed to production
- Demo script ready
- Exhibition checklist complete

---

## 🎯 PRIORITY MATRIX

### MUST HAVE (Critical Path - 16 hours)
1. **Demo Data Seeding** (3.5h) - Tasks 1.1-1.6
2. **Demo Mode** (4h) - Tasks 2.1-2.6
3. **Analytics** (3h) - Tasks 3.1-3.6
4. **Photo Compression** (2h) - Tasks 4.1-4.3
5. **Core Tests** (2.5h) - Tasks 5.1-5.5
6. **Production Deploy** (1h) - Tasks 8.1, 8.2

### SHOULD HAVE (High Value - 6 hours)
7. **Stress Testing** (2h) - Tasks 6.1-6.5
8. **Device Testing** (2h) - Tasks 7.1-7.5
9. **Bug Fixes** (2h) - Tasks 10.1-10.5

### NICE TO HAVE (Polish - 2 hours)
10. **Complete Test Suite** (1h) - Tasks 5.6-5.9
11. **Exhibition Docs** (1h) - Tasks 9.1-9.4

---

## 🔧 TOOLS & COMMANDS

### Demo Data Management
```bash
# Seed demo data
npm run seed:demo

# Reset demo data
npm run reset:demo

# Verify demo data
npm run verify:demo
```

### Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test demo-mode.test.ts

# Run tests in watch mode
npm test -- --watch

# Check coverage
npm test -- --coverage
```

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

### Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Rollback
npm run deploy:rollback
```

---

## 📊 PROGRESS TRACKING

### Use This Checklist Daily

**Day 1 End:**
- [ ] Demo data seeding works
- [ ] Demo mode toggle implemented
- [ ] Analytics infrastructure ready
- [ ] Can demo animal registration with pre-filled data

**Day 2 End:**
- [ ] Demo mode works on all pages
- [ ] Analytics tracks all key events
- [ ] Photo compression optimized
- [ ] Core tests pass
- [ ] Critical bugs fixed

**Day 3 End:**
- [ ] All tests pass (>60% coverage)
- [ ] Stress tests completed
- [ ] Tested on 3+ devices
- [ ] Deployed to production
- [ ] Demo script ready
- [ ] Exhibition checklist complete

---

## 🚨 TROUBLESHOOTING

### If Demo Data Seeding Fails
```bash
# Check Supabase connection
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Check database tables exist
# Go to Supabase dashboard → SQL Editor
SELECT * FROM animals LIMIT 1;

# Clear existing demo data manually
DELETE FROM animals WHERE user_id IN (
  SELECT id FROM auth.users WHERE phone IN ('+251911234567', '+251922345678', '+251933456789')
);
```

### If Tests Fail
```bash
# Clear test cache
npm test -- --clearCache

# Run tests with verbose output
npm test -- --verbose

# Check for TypeScript errors
npm run type-check
```

### If Deployment Fails
```bash
# Check build locally
npm run build

# Check environment variables
vercel env ls

# View deployment logs
vercel logs
```

---

## 💡 PRO TIPS

### Speed Up Development
1. **Use Demo Mode** - Toggle it on while developing to skip uploads
2. **Hot Module Reload** - Keep dev server running, changes reflect instantly
3. **Test as You Go** - Write tests alongside features, not after
4. **Commit Often** - Small commits make it easier to rollback if needed

### Avoid Common Pitfalls
1. **Don't Skip Testing** - Bugs found late are expensive to fix
2. **Don't Optimize Prematurely** - Get it working first, then optimize
3. **Don't Forget Mobile** - Test on real devices, not just desktop
4. **Don't Ignore Errors** - Fix console errors as they appear

### Demo Day Success
1. **Practice Your Demo** - Run through it 3 times before exhibition
2. **Have Backup** - Second device with app loaded
3. **Know Your Data** - Memorize demo account credentials
4. **Stay Calm** - If something breaks, switch to backup or skip that feature

---

## 📞 SUPPORT RESOURCES

### Documentation
- Supabase Docs: https://supabase.com/docs
- React Query Docs: https://tanstack.com/query/latest
- Vite Docs: https://vitejs.dev/guide/

### Community
- Supabase Discord: https://discord.supabase.com
- React Discord: https://discord.gg/react

### Emergency Contacts
- Supabase Support: support@supabase.io
- Vercel Support: support@vercel.com

---

## ✅ FINAL CHECKLIST

Before exhibition, verify:

### Technical
- [ ] `npm run seed:demo` works
- [ ] `npm run reset:demo` works
- [ ] `npm test` passes (>60% coverage)
- [ ] `npm run build` succeeds
- [ ] Production URL loads correctly
- [ ] SSL certificate valid
- [ ] Error monitoring active
- [ ] Uptime monitoring configured

### Demo Readiness
- [ ] Demo mode toggle works (Ctrl+Shift+D)
- [ ] All forms pre-fill in demo mode
- [ ] Placeholder images load
- [ ] Analytics dashboard shows data
- [ ] Offline mode demonstrates smoothly
- [ ] Language switching works
- [ ] 2-tap milk recording is fast

### Documentation
- [ ] Demo script written
- [ ] Troubleshooting guide ready
- [ ] FAQ prepared
- [ ] Backup credentials documented
- [ ] Reset procedure documented

### Testing
- [ ] Tested on Android device
- [ ] Tested on iOS device
- [ ] Tested on 3G network
- [ ] Stress tested (100 clicks, 20 uploads)
- [ ] 6-hour session completed
- [ ] Airplane mode toggle tested

---

## 🎬 YOU'RE READY!

Once all checkboxes are complete, you have:
- ✅ Production-ready app
- ✅ Smooth demo experience
- ✅ Comprehensive testing
- ✅ Monitoring and alerts
- ✅ Exhibition materials

**Now go build something amazing! 🚀**

---

## 📈 TRACKING YOUR PROGRESS

Update this section daily:

**Day 1 Progress:** ___/16 hours completed
**Day 2 Progress:** ___/16 hours completed  
**Day 3 Progress:** ___/16 hours completed

**Blockers:**
1. _____________________
2. _____________________

**Wins:**
1. _____________________
2. _____________________

**Next Session Focus:**
_____________________

