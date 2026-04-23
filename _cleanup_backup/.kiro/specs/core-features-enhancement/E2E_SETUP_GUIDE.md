# E2E Test Setup Guide

## Issue: Connection Refused Error

The E2E tests are failing with `ERR_CONNECTION_REFUSED at http://localhost:8082/` because the development server is not running.

---

## Solution: Start Dev Server Before Running Tests

E2E tests require the application to be running. You need to start the development server in one terminal and run tests in another.

### Step 1: Start the Development Server

Open a terminal and run:
```bash
npm run dev
```

This will start the Vite development server at `http://localhost:8082/` (or the port configured in your playwright.config.ts).

**Keep this terminal running** - don't close it while tests are executing.

### Step 2: Run E2E Tests (in a new terminal)

Open a **second terminal** and run:
```bash
npm run test:e2e
```

---

## Alternative: Use Playwright's Web Server Feature

Playwright can automatically start and stop the dev server for you. Check if your `playwright.config.ts` has the `webServer` configuration:

```typescript
export default defineConfig({
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8082',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  // ... other config
});
```

If this is configured, Playwright will automatically:
1. Start the dev server before tests
2. Wait for it to be ready
3. Run the tests
4. Stop the server after tests complete

---

## Quick Start Commands

### Option 1: Manual (Recommended for Development)

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
npm run test:e2e
```

### Option 2: Automatic (If webServer is configured)

**Single Terminal:**
```bash
npm run test:e2e
```

Playwright will handle starting/stopping the server automatically.

---

## Verify Setup

1. **Check if dev server is running:**
   - Open browser to `http://localhost:8082/`
   - You should see the application login page

2. **Check Playwright config:**
   ```bash
   # View the config
   cat playwright.config.ts
   ```

3. **Run a single test to verify:**
   ```bash
   npm run test:e2e -- auth.spec.ts
   ```

---

## Common Issues

### Issue: Port Already in Use

**Error:** `Port 8082 is already in use`

**Solution:**
```bash
# Find and kill the process using port 8082
# Windows:
netstat -ano | findstr :8082
taskkill /PID <PID> /F

# Or just restart your computer
```

### Issue: Tests Still Failing

**Check:**
1. Is the dev server actually running? (`http://localhost:8082/`)
2. Is the port correct in `playwright.config.ts`?
3. Are there any build errors in the dev server terminal?

### Issue: Slow Test Startup

**Solution:** Use `reuseExistingServer: true` in playwright.config.ts to reuse an already-running dev server during development.

---

## Recommended Workflow

### For Development:
1. Start dev server once: `npm run dev`
2. Keep it running
3. Run tests as needed: `npm run test:e2e`
4. Make code changes
5. Tests will use the updated code automatically (Vite HMR)

### For CI/CD:
Use the webServer configuration so tests can run automatically without manual server management.

---

## Next Steps

1. **Start the dev server** in one terminal
2. **Run the tests** in another terminal
3. **View the results** at http://localhost:9323 (test report)
4. **Fix any failing tests**
5. **Proceed with manual testing**

---

## Test Execution Checklist

- [ ] Dev server is running (`npm run dev`)
- [ ] Can access app at `http://localhost:8082/`
- [ ] No build errors in dev server terminal
- [ ] Run E2E tests (`npm run test:e2e`)
- [ ] View test report (http://localhost:9323)
- [ ] Document any failures
- [ ] Fix issues and retest

---

**Remember:** E2E tests test the actual running application, so the app must be running first!
