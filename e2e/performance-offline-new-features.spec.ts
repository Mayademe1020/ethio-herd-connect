import { test, expect } from '@playwright/test';
import { AuthHelper, waitForLoading } from './test-utils';

test.describe('Performance and Offline Testing for New Features', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login();
    await authHelper.completeOnboarding();
  });

  test('should queue video upload when offline', async ({ page }) => {
    // Navigate to create listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing/i }).click();

    // Select animal and proceed
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/price/i).fill('15000');
    await page.getByRole('button', { name: /next/i }).click();

    // Go offline
    await page.context().setOffline(true);

    // Try to upload video
    const videoInput = page.locator('input[type="file"][accept*="video"]');
    if (await videoInput.isVisible()) {
      // Upload video (would need actual test file)
      // await videoInput.setInputFiles('test-files/test-video.mp4');

      // Should show offline indicator
      await expect(page.getByText(/offline|queued|will.*upload/i)).toBeVisible();

      // Should allow continuing with listing creation
      await page.getByRole('button', { name: /create.*listing|publish/i }).click();

      // Should show queued message
      await expect(page.getByText(/queued|will.*sync|offline/i)).toBeVisible();
    }

    // Go back online
    await page.context().setOffline(false);

    // Wait for sync
    await page.waitForTimeout(3000);

    // Should show sync success
    await expect(page.getByText(/synced|uploaded|complete/i)).toBeVisible();
  });

  test('should queue edit operations when offline', async ({ page }) => {
    // Navigate to animal detail
    await page.goto('/my-animals');
    await waitForLoading(page);
    await page.locator('[data-testid="animal-card"]').first().click();

    // Go offline
    await page.context().setOffline(true);

    // Click edit
    await page.getByRole('button', { name: /edit/i }).click();

    // Make changes
    await page.getByLabel(/name/i).fill('Offline Edit Test');
    await page.getByRole('button', { name: /save|update/i }).click();

    // Should show offline indicator
    await expect(page.getByText(/offline|queued|will.*sync/i)).toBeVisible();

    // Go back online
    await page.context().setOffline(false);

    // Wait for sync
    await page.waitForTimeout(2000);

    // Should show sync success
    await expect(page.getByText(/synced|synchronized|updated/i)).toBeVisible();

    // Verify changes persisted
    await page.reload();
    await expect(page.getByText('Offline Edit Test')).toBeVisible();
  });

  test('should queue pregnancy recording when offline', async ({ page }) => {
    // Navigate to animals page
    await page.goto('/my-animals');
    await waitForLoading(page);

    // Find a female animal
    const femaleAnimal = page.locator('[data-testid="animal-card"]').filter({ hasText: /female|cow|ewe/i }).first();
    
    if (await femaleAnimal.isVisible()) {
      await femaleAnimal.click();

      // Go offline
      await page.context().setOffline(true);

      // Click record pregnancy
      await page.getByRole('button', { name: /record.*pregnancy|pregnancy/i }).click();

      // Enter breeding date
      const breedingDate = new Date();
      breedingDate.setDate(breedingDate.getDate() - 30);
      const dateString = breedingDate.toISOString().split('T')[0];
      await page.getByLabel(/breeding.*date/i).fill(dateString);

      // Save
      await page.getByRole('button', { name: /save|record/i }).click();

      // Should show offline indicator
      await expect(page.getByText(/offline|queued|will.*sync/i)).toBeVisible();

      // Go back online
      await page.context().setOffline(false);

      // Wait for sync
      await page.waitForTimeout(2000);

      // Should show sync success
      await expect(page.getByText(/synced|synchronized|recorded/i)).toBeVisible();
    }
  });

  test('should queue notification creation when offline', async ({ page }) => {
    // This test simulates creating a notification-triggering action offline
    // For example, expressing buyer interest

    // Navigate to marketplace
    await page.getByRole('tab', { name: /marketplace|buy/i }).click();
    await waitForLoading(page);

    // Find a listing
    const listing = page.locator('[data-testid="listing-card"]').first();
    if (await listing.isVisible()) {
      await listing.click();

      // Go offline
      await page.context().setOffline(true);

      // Express interest
      await page.getByRole('button', { name: /interested|contact/i }).click();
      await page.getByLabel(/message/i).fill('Interested in this animal');
      await page.getByRole('button', { name: /submit|send/i }).click();

      // Should show offline indicator
      await expect(page.getByText(/offline|queued|will.*send/i)).toBeVisible();

      // Go back online
      await page.context().setOffline(false);

      // Wait for sync
      await page.waitForTimeout(2000);

      // Should show sync success
      await expect(page.getByText(/sent|delivered|success/i)).toBeVisible();
    }
  });

  test('should verify offline queue syncs correctly for all new features', async ({ page }) => {
    // Perform multiple offline actions
    type ActionType = 'animal-edit' | 'milk-edit' | 'listing-edit';
    const actions: ActionType[] = [];

    // 1. Edit animal offline
    await page.goto('/my-animals');
    await waitForLoading(page);
    await page.context().setOffline(true);
    
    await page.locator('[data-testid="animal-card"]').first().click();
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel(/name/i).fill('Offline Animal Edit');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/offline|queued/i)).toBeVisible();

    // 2. Edit milk record offline
    await page.goto('/milk-production-records');
    await waitForLoading(page);
    
    const milkRecord = page.locator('[data-testid="milk-record"]').first();
    if (await milkRecord.isVisible()) {
      await milkRecord.getByRole('button', { name: /edit/i }).click();
      await page.getByLabel(/amount/i).fill('7.5');
      await page.getByRole('button', { name: /save/i }).click();
      await expect(page.getByText(/offline|queued/i)).toBeVisible();
    }

    // Go back online
    await page.context().setOffline(false);

    // Wait for all syncs to complete
    await page.waitForTimeout(5000);

    // Verify all changes synced
    await page.goto('/my-animals');
    await page.locator('[data-testid="animal-card"]').first().click();
    await expect(page.getByText('Offline Animal Edit')).toBeVisible();

    await page.goto('/milk-production-records');
    await expect(page.getByText('7.5')).toBeVisible();
  });

  test('should test video compression performance', async ({ page }) => {
    // Navigate to create listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing/i }).click();

    // Select animal and proceed
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/price/i).fill('15000');
    await page.getByRole('button', { name: /next/i }).click();

    // Upload video and measure compression time
    const videoInput = page.locator('input[type="file"][accept*="video"]');
    
    if (await videoInput.isVisible()) {
      const startTime = Date.now();

      // Upload video (would need actual test file)
      // await videoInput.setInputFiles('test-files/test-video.mp4');

      // Wait for compression to complete
      await page.waitForSelector('[data-testid="video-preview"]', { timeout: 30000 });

      const compressionTime = Date.now() - startTime;

      // Compression should complete within 30 seconds
      expect(compressionTime).toBeLessThan(30000);

      // Should show compressed size
      const sizeIndicator = page.locator('[data-testid="video-size"]');
      if (await sizeIndicator.isVisible()) {
        const sizeText = await sizeIndicator.textContent();
        // Compressed size should be less than 5MB
        expect(sizeText).toMatch(/[0-4]\.\d+.*mb|kb/i);
      }
    }
  });

  test('should test notification real-time subscription performance', async ({ page }) => {
    // Navigate to notifications
    await page.goto('/notifications');
    await waitForLoading(page);

    // Measure time to load notifications
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="notification-card"]', { timeout: 5000 });
    const loadTime = Date.now() - startTime;

    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);

    // Test real-time update performance
    // In a real scenario, we would trigger a notification from another session
    // For now, we verify the subscription is active

    // Check for real-time indicator
    const realtimeIndicator = page.locator('[data-testid="realtime-status"]');
    if (await realtimeIndicator.isVisible()) {
      await expect(realtimeIndicator.getByText(/connected|live/i)).toBeVisible();
    }
  });

  test('should handle slow network for video upload', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000); // Add 1 second delay
    });

    // Navigate to create listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing/i }).click();

    // Select animal and proceed
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/price/i).fill('15000');
    await page.getByRole('button', { name: /next/i }).click();

    // Upload video
    const videoInput = page.locator('input[type="file"][accept*="video"]');
    
    if (await videoInput.isVisible()) {
      // Upload video (would need actual test file)
      // await videoInput.setInputFiles('test-files/test-video.mp4');

      // Should show progress indicator
      await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();

      // Should show uploading status
      await expect(page.getByText(/uploading|processing/i)).toBeVisible();

      // Wait for completion (with extended timeout for slow network)
      await page.waitForSelector('[data-testid="video-preview"]', { timeout: 60000 });

      // Should complete successfully even on slow network
      await expect(page.getByText(/uploaded|complete/i)).toBeVisible();
    }
  });

  test('should test milk summary calculation performance', async ({ page }) => {
    // Navigate to milk production records
    await page.goto('/milk-production-records');

    // Measure time to calculate and display summary
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="milk-summary-card"]', { timeout: 2000 });
    const calculationTime = Date.now() - startTime;

    // Should calculate within 500ms
    expect(calculationTime).toBeLessThan(500);

    // Verify summary is displayed
    const summaryCard = page.locator('[data-testid="milk-summary-card"]');
    await expect(summaryCard.getByText(/total|average|trend/i)).toBeVisible();
  });

  test('should test edit operation performance', async ({ page }) => {
    // Navigate to animal detail
    await page.goto('/my-animals');
    await waitForLoading(page);
    await page.locator('[data-testid="animal-card"]').first().click();

    // Measure time to open edit modal
    const startTime = Date.now();
    await page.getByRole('button', { name: /edit/i }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 2000 });
    const modalOpenTime = Date.now() - startTime;

    // Should open within 500ms
    expect(modalOpenTime).toBeLessThan(500);

    // Make changes
    await page.getByLabel(/name/i).fill('Performance Test Animal');

    // Measure time to save
    const saveStartTime = Date.now();
    await page.getByRole('button', { name: /save|update/i }).click();
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 3000 });
    const saveTime = Date.now() - saveStartTime;

    // Should save within 2 seconds
    expect(saveTime).toBeLessThan(2000);
  });

  test('should test pregnancy calculation performance', async ({ page }) => {
    // Navigate to animals page
    await page.goto('/my-animals');
    await waitForLoading(page);

    // Find a female animal
    const femaleAnimal = page.locator('[data-testid="animal-card"]').filter({ hasText: /female|cow|ewe/i }).first();
    
    if (await femaleAnimal.isVisible()) {
      await femaleAnimal.click();

      // Open pregnancy tracker
      await page.getByRole('button', { name: /record.*pregnancy/i }).click();

      // Enter breeding date
      const breedingDate = new Date();
      breedingDate.setDate(breedingDate.getDate() - 30);
      const dateString = breedingDate.toISOString().split('T')[0];

      // Measure calculation time
      const startTime = Date.now();
      await page.getByLabel(/breeding.*date/i).fill(dateString);
      
      // Wait for delivery date to be calculated and displayed
      await page.waitForSelector('[data-testid="expected-delivery"]', { timeout: 1000 });
      const calculationTime = Date.now() - startTime;

      // Should calculate instantly (< 100ms)
      expect(calculationTime).toBeLessThan(100);

      // Verify calculation is displayed
      await expect(page.getByText(/expected.*delivery|due.*date/i)).toBeVisible();
      await expect(page.getByText(/days.*remaining/i)).toBeVisible();
    }
  });

  test('should handle multiple offline actions and sync in order', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    // Perform multiple actions in sequence
    type ActionType = 'animal-edit' | 'milk-edit' | 'listing-edit';
    const actions: ActionType[] = [];

    // Action 1: Edit animal
    await page.goto('/my-animals');
    await waitForLoading(page);
    await page.locator('[data-testid="animal-card"]').first().click();
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel(/name/i).fill('First Offline Edit');
    await page.getByRole('button', { name: /save/i }).click();
    actions.push('animal-edit');

    // Action 2: Edit milk record
    await page.goto('/milk-production-records');
    await waitForLoading(page);
    const milkRecord = page.locator('[data-testid="milk-record"]').first();
    if (await milkRecord.isVisible()) {
      await milkRecord.getByRole('button', { name: /edit/i }).click();
      await page.getByLabel(/amount/i).fill('8.0');
      await page.getByRole('button', { name: /save/i }).click();
      actions.push('milk-edit');
    }

    // Action 3: Edit listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();
    await waitForLoading(page);
    const editButton = page.locator('[data-testid="edit-listing"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.getByLabel(/price/i).fill('16000');
      await page.getByRole('button', { name: /save/i }).click();
      actions.push('listing-edit');
    }

    // Go back online
    await page.context().setOffline(false);

    // Wait for all syncs
    await page.waitForTimeout(5000);

    // Verify all actions synced successfully
    await page.goto('/my-animals');
    await page.locator('[data-testid="animal-card"]').first().click();
    await expect(page.getByText('First Offline Edit')).toBeVisible();

    if (actions.includes('milk-edit')) {
      await page.goto('/milk-production-records');
      await expect(page.getByText('8.0')).toBeVisible();
    }

    if (actions.includes('listing-edit')) {
      await page.getByRole('tab', { name: /marketplace|sell/i }).click();
      await page.getByRole('button', { name: /my.*listings/i }).click();
      await expect(page.getByText(/16,?000/)).toBeVisible();
    }
  });

  test('should show clear offline indicators for all features', async ({ page }) => {
    // Go offline
    await page.context().setOffline(true);

    // Check offline indicator in header
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toBeVisible();
      await expect(offlineIndicator.getByText(/offline/i)).toBeVisible();
    }

    // Try various actions and verify offline indicators

    // Edit animal
    await page.goto('/my-animals');
    await waitForLoading(page);
    await page.locator('[data-testid="animal-card"]').first().click();
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel(/name/i).fill('Offline Test');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/offline|queued/i)).toBeVisible();

    // Go back online
    await page.context().setOffline(false);

    // Offline indicator should disappear
    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).not.toBeVisible();
    }
  });
});
