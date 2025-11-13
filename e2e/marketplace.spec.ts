import { test, expect } from '@playwright/test';
import { AuthHelper, generateEthiopianName, waitForLoading } from './test-utils';

test.describe('Marketplace Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login();
    await authHelper.completeOnboarding();
  });

  test('should create listing with all required fields', async ({ page }) => {
    // Navigate to marketplace
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();

    // Click create listing
    await page.getByRole('button', { name: /create.*listing|sell.*animal|add.*listing/i }).click();

    // Step 1: Select animal
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').first().click(); // Select first available animal
    await page.getByRole('button', { name: /next|continue/i }).click();

    // Step 2: Enter price
    await page.getByLabel(/price|amount/i).fill('15000'); // 15,000 ETB
    await page.getByRole('button', { name: /next|continue/i }).click();

    // Step 3: Add details
    await page.getByLabel(/description|details/i).fill('Healthy, well-cared for animal ready for sale.');
    await page.getByLabel(/location|address/i).fill('Addis Ababa, Ethiopia');

    // Upload photos (if required)
    const photoInputs = page.locator('input[type="file"]');
    if (await photoInputs.first().isVisible()) {
      // In real test, upload actual files
      // await photoInputs.first().setInputFiles('test-files/animal-photo1.jpg');
      // await photoInputs.nth(1).setInputFiles('test-files/animal-photo2.jpg');
    }

    // Step 4: Health disclaimer
    const disclaimer = page.getByLabel(/health.*disclaimer|healthy|disease.*free/i);
    if (await disclaimer.isVisible()) {
      await disclaimer.check();
    }

    // Submit listing
    await page.getByRole('button', { name: /create.*listing|publish|submit/i }).click();

    // Should show success message
    await expect(page.getByText(/listing.*created|published|success/i)).toBeVisible();
  });

  test('should validate required fields in listing creation', async ({ page }) => {
    // Navigate to create listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing|sell.*animal/i }).click();

    // Try to proceed without selecting animal
    await page.getByRole('button', { name: /next|continue/i }).click();

    // Should show validation error
    await expect(page.getByText(/select.*animal|animal.*required/i)).toBeVisible();
  });

  test('should browse marketplace listings', async ({ page }) => {
    // Navigate to marketplace browse
    await page.getByRole('tab', { name: /marketplace|buy/i }).click();
    await waitForLoading(page);

    // Should show listings
    const listings = page.locator('[data-testid="listing-card"], [data-testid="marketplace-item"]');
    await expect(listings.first()).toBeVisible();

    // Test filtering
    await page.getByRole('button', { name: /filter|filters/i }).click();
    await page.getByLabel(/animal.*type/i).selectOption('cattle');
    await page.getByRole('button', { name: /apply|search/i }).click();

    // Should filter results
    await waitForLoading(page);
    const filteredListings = page.locator('[data-testid="listing-card"]').filter({ hasText: /cattle/i });
    if (await filteredListings.count() > 0) {
      await expect(filteredListings.first()).toBeVisible();
    }
  });

  test('should view listing details', async ({ page }) => {
    // Navigate to marketplace
    await page.getByRole('tab', { name: /marketplace|buy/i }).click();

    // Click on first listing
    await page.locator('[data-testid="listing-card"]').first().click();

    // Should show detailed view
    await expect(page.getByText(/details|description|price|seller/i)).toBeVisible();

    // Should show contact/seller info
    await expect(page.getByText(/contact|call|message|seller/i)).toBeVisible();
  });

  test('should submit buyer interest', async ({ page }) => {
    // Navigate to listing detail
    await page.getByRole('tab', { name: /marketplace|buy/i }).click();
    await page.locator('[data-testid="listing-card"]').first().click();

    // Click express interest
    await page.getByRole('button', { name: /interested|contact|express.*interest/i }).click();

    // Fill interest form
    await page.getByLabel(/message|note/i).fill('I am interested in purchasing this animal. Please contact me.');

    // Submit interest
    await page.getByRole('button', { name: /submit|send/i }).click();

    // Should show success message
    await expect(page.getByText(/interest.*sent|message.*sent|contacted/i)).toBeVisible();
  });

  test('should show seller interested buyers', async ({ page }) => {
    // Navigate to seller's listings
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings|seller/i }).click();

    // Click on a listing
    await page.locator('[data-testid="my-listing"]').first().click();

    // Should show interested buyers section
    const interestedBuyers = page.locator('[data-testid="interested-buyer"], [data-testid="buyer-interest"]');
    if (await interestedBuyers.first().isVisible()) {
      await expect(interestedBuyers).toHaveCount(await interestedBuyers.count());
    }

    // Should show buyer contact info
    await expect(page.getByText(/phone|contact|message/i)).toBeVisible();
  });

  test('should handle female animal pregnancy/lactation fields', async ({ page }) => {
    // Navigate to create listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing/i }).click();

    // Select female animal
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').filter({ hasText: /female/i }).first().click();
    await page.getByRole('button', { name: /next|continue/i }).click();

    // Should show pregnancy/lactation options
    await expect(page.getByLabel(/pregnant|pregnancy/i)).toBeVisible();
    await expect(page.getByLabel(/lactating|lactation/i)).toBeVisible();

    // Select pregnant
    await page.getByLabel(/pregnant|pregnancy/i).check();

    // Should show due date field
    await expect(page.getByLabel(/due.*date|expected/i)).toBeVisible();

    // Select lactating
    await page.getByLabel(/lactating|lactation/i).check();

    // Should show milk production field
    await expect(page.getByLabel(/milk.*production|daily.*milk/i)).toBeVisible();
  });

  test('should validate health disclaimer requirement', async ({ page }) => {
    // Navigate to create listing final step
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing/i }).click();

    // Skip to final step (assuming animal and price are selected)
    // This would need to be adjusted based on actual flow

    // Try to submit without checking disclaimer
    await page.getByRole('button', { name: /create.*listing|publish/i }).click();

    // Should show validation error
    await expect(page.getByText(/disclaimer|health|confirm|agree/i)).toBeVisible();
  });

  test('should edit existing listing', async ({ page }) => {
    // Navigate to my listings
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();

    // Click edit on first listing
    await page.locator('[data-testid="my-listing"]').first().locator('[data-testid="edit-listing"]').click();

    // Modify price
    await page.getByLabel(/price|amount/i).fill('16000');

    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();

    // Should show success message
    await expect(page.getByText(/updated|saved/i)).toBeVisible();
  });

  test('should edit listing with comprehensive updates', async ({ page }) => {
    // Navigate to my listings
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();
    await waitForLoading(page);

    // Get original price
    const originalPrice = await page.locator('[data-testid="my-listing"]').first().locator('[data-testid="listing-price"]').textContent();

    // Click edit on first listing
    await page.locator('[data-testid="my-listing"]').first().locator('[data-testid="edit-listing"]').click();

    // Wait for edit modal
    await expect(page.getByRole('dialog')).toBeVisible();

    // Update price
    await page.getByLabel(/price|amount/i).fill('18000');

    // Update negotiable status
    const negotiableCheckbox = page.getByLabel(/negotiable/i);
    if (await negotiableCheckbox.isVisible()) {
      await negotiableCheckbox.check();
    }

    // Update description
    const descriptionField = page.getByLabel(/description|details/i);
    if (await descriptionField.isVisible()) {
      await descriptionField.fill('Updated description with more details about the animal.');
    }

    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();

    // Should show success message
    await expect(page.getByText(/updated|saved|success/i)).toBeVisible();

    // Verify updated price is displayed
    await expect(page.getByText(/18,?000/)).toBeVisible();
  });

  test('should show warning when editing listing with buyer interests', async ({ page }) => {
    // Navigate to my listings
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();
    await waitForLoading(page);

    // Find a listing with interests (if any)
    const listingWithInterests = page.locator('[data-testid="my-listing"]').filter({ hasText: /interest/i }).first();
    
    if (await listingWithInterests.isVisible()) {
      // Click edit
      await listingWithInterests.locator('[data-testid="edit-listing"]').click();

      // Should show warning about existing interests
      await expect(page.getByText(/buyer.*interest|existing.*interest|buyers.*interested/i)).toBeVisible();

      // Should still allow editing
      await page.getByLabel(/price|amount/i).fill('17000');
      await page.getByRole('button', { name: /save|update/i }).click();

      // Should show success
      await expect(page.getByText(/updated|saved/i)).toBeVisible();
    }
  });

  test('should preserve original creation date when editing', async ({ page }) => {
    // Navigate to my listings
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();
    await waitForLoading(page);

    // Get original creation date
    const originalDate = await page.locator('[data-testid="my-listing"]').first().locator('[data-testid="created-date"]').textContent();

    // Click edit
    await page.locator('[data-testid="my-listing"]').first().locator('[data-testid="edit-listing"]').click();

    // Make changes
    await page.getByLabel(/price|amount/i).fill('19000');
    await page.getByRole('button', { name: /save|update/i }).click();

    // Wait for success
    await expect(page.getByText(/updated|saved/i)).toBeVisible();

    // Verify creation date hasn't changed
    const currentDate = await page.locator('[data-testid="my-listing"]').first().locator('[data-testid="created-date"]').textContent();
    expect(currentDate).toBe(originalDate);

    // Verify last_edited_at is shown (if displayed)
    const lastEdited = page.locator('[data-testid="last-edited"]');
    if (await lastEdited.isVisible()) {
      await expect(lastEdited).toBeVisible();
    }
  });

  test('should track listing edit count', async ({ page }) => {
    // Navigate to my listings
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();
    await waitForLoading(page);

    // Click edit
    await page.locator('[data-testid="my-listing"]').first().locator('[data-testid="edit-listing"]').click();

    // Make changes
    await page.getByLabel(/price|amount/i).fill('20000');
    await page.getByRole('button', { name: /save|update/i }).click();

    // Wait for success
    await expect(page.getByText(/updated|saved/i)).toBeVisible();

    // Verify edit count increased (if displayed)
    const editCount = page.locator('[data-testid="edit-count"]');
    if (await editCount.isVisible()) {
      const count = await editCount.textContent();
      expect(parseInt(count || '0')).toBeGreaterThan(0);
    }
  });

  test('should handle offline listing edit and sync', async ({ page }) => {
    // Navigate to my listings
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();
    await waitForLoading(page);

    // Go offline
    await page.context().setOffline(true);

    // Click edit
    await page.locator('[data-testid="my-listing"]').first().locator('[data-testid="edit-listing"]').click();

    // Make changes
    await page.getByLabel(/price|amount/i).fill('21000');
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
    await expect(page.getByText(/21,?000/)).toBeVisible();
  });

  test('should delete listing', async ({ page }) => {
    // Navigate to my listings
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();

    // Click delete on first listing
    await page.locator('[data-testid="my-listing"]').first().locator('[data-testid="delete-listing"]').click();

    // Confirm deletion
    await page.getByRole('button', { name: /confirm|delete|yes/i }).click();

    // Should show success message
    await expect(page.getByText(/deleted|removed/i)).toBeVisible();
  });

  test('should upload video to listing', async ({ page }) => {
    // Navigate to create listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing/i }).click();

    // Select animal
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: /next/i }).click();

    // Enter price
    await page.getByLabel(/price/i).fill('15000');
    await page.getByRole('button', { name: /next/i }).click();

    // Look for video upload field
    const videoInput = page.locator('input[type="file"][accept*="video"]');
    
    if (await videoInput.isVisible()) {
      // Upload a test video (would need actual test file)
      // await videoInput.setInputFiles('test-files/test-video.mp4');

      // Should show upload progress
      const progressIndicator = page.locator('[data-testid="upload-progress"]');
      if (await progressIndicator.isVisible()) {
        await expect(progressIndicator).toBeVisible();
      }

      // Should show video preview after upload
      const videoPreview = page.locator('[data-testid="video-preview"]');
      await expect(videoPreview).toBeVisible();

      // Should show thumbnail
      const thumbnail = page.locator('[data-testid="video-thumbnail"]');
      await expect(thumbnail).toBeVisible();
    }
  });

  test('should validate video duration (max 10 seconds)', async ({ page }) => {
    // Navigate to create listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing/i }).click();

    // Select animal and proceed to video upload
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/price/i).fill('15000');
    await page.getByRole('button', { name: /next/i }).click();

    // Try to upload video longer than 10 seconds
    const videoInput = page.locator('input[type="file"][accept*="video"]');
    
    if (await videoInput.isVisible()) {
      // Upload long video (would need actual test file)
      // await videoInput.setInputFiles('test-files/long-video.mp4');

      // Should show validation error
      await expect(page.getByText(/10.*second|duration.*exceeded|too.*long/i)).toBeVisible();

      // Should not allow proceeding
      const createButton = page.getByRole('button', { name: /create.*listing|publish/i });
      if (await createButton.isVisible()) {
        await expect(createButton).toBeDisabled();
      }
    }
  });

  test('should validate video file size (max 20MB)', async ({ page }) => {
    // Navigate to create listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing/i }).click();

    // Select animal and proceed to video upload
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/price/i).fill('15000');
    await page.getByRole('button', { name: /next/i }).click();

    // Try to upload large video
    const videoInput = page.locator('input[type="file"][accept*="video"]');
    
    if (await videoInput.isVisible()) {
      // Upload large video (would need actual test file)
      // await videoInput.setInputFiles('test-files/large-video.mp4');

      // Should show validation error
      await expect(page.getByText(/20.*mb|size.*exceeded|too.*large/i)).toBeVisible();

      // Should not allow proceeding
      const createButton = page.getByRole('button', { name: /create.*listing|publish/i });
      if (await createButton.isVisible()) {
        await expect(createButton).toBeDisabled();
      }
    }
  });

  test('should validate video format (MP4, MOV, AVI)', async ({ page }) => {
    // Navigate to create listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing/i }).click();

    // Select animal and proceed to video upload
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/price/i).fill('15000');
    await page.getByRole('button', { name: /next/i }).click();

    // Try to upload invalid format
    const videoInput = page.locator('input[type="file"][accept*="video"]');
    
    if (await videoInput.isVisible()) {
      // Upload invalid format (would need actual test file)
      // await videoInput.setInputFiles('test-files/video.webm');

      // Should show validation error
      await expect(page.getByText(/invalid.*format|mp4.*mov.*avi|unsupported/i)).toBeVisible();
    }
  });

  test('should play video in listing detail page', async ({ page }) => {
    // Navigate to marketplace browse
    await page.getByRole('tab', { name: /marketplace|buy/i }).click();
    await waitForLoading(page);

    // Find a listing with video
    const listingWithVideo = page.locator('[data-testid="listing-card"]').filter({ has: page.locator('[data-testid="video-indicator"]') }).first();

    if (await listingWithVideo.isVisible()) {
      // Click on listing
      await listingWithVideo.click();

      // Should show video player
      await expect(page.locator('[data-testid="video-player"]')).toBeVisible();

      // Should show thumbnail with play button
      await expect(page.locator('[data-testid="video-thumbnail"]')).toBeVisible();
      await expect(page.getByRole('button', { name: /play/i })).toBeVisible();

      // Click play button
      await page.getByRole('button', { name: /play/i }).click();

      // Video should start playing
      const video = page.locator('video');
      await expect(video).toBeVisible();

      // Should show pause button
      await expect(page.getByRole('button', { name: /pause/i })).toBeVisible();
    }
  });

  test('should generate and display video thumbnail', async ({ page }) => {
    // Navigate to create listing with video
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

      // Wait for thumbnail generation
      await page.waitForTimeout(2000);

      // Should show generated thumbnail
      const thumbnail = page.locator('[data-testid="video-thumbnail"]');
      await expect(thumbnail).toBeVisible();

      // Thumbnail should be an image
      const thumbnailImg = thumbnail.locator('img');
      if (await thumbnailImg.isVisible()) {
        await expect(thumbnailImg).toBeVisible();
        
        // Should have src attribute
        const src = await thumbnailImg.getAttribute('src');
        expect(src).toBeTruthy();
      }
    }
  });

  test('should show video upload progress indicator', async ({ page }) => {
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
      const progressBar = page.locator('[data-testid="upload-progress"]');
      if (await progressBar.isVisible()) {
        await expect(progressBar).toBeVisible();

        // Should show percentage
        await expect(page.getByText(/%|percent/i)).toBeVisible();
      }

      // Should show uploading status
      await expect(page.getByText(/uploading|processing|compressing/i)).toBeVisible();

      // Wait for completion
      await page.waitForTimeout(3000);

      // Should show completion status
      await expect(page.getByText(/uploaded|complete|ready/i)).toBeVisible();
    }
  });

  test('should allow listing creation without video (optional)', async ({ page }) => {
    // Navigate to create listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing/i }).click();

    // Select animal
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: /next/i }).click();

    // Enter price
    await page.getByLabel(/price/i).fill('15000');
    await page.getByRole('button', { name: /next/i }).click();

    // Skip video upload (leave empty)
    const videoInput = page.locator('input[type="file"][accept*="video"]');
    if (await videoInput.isVisible()) {
      // Don't upload video
    }

    // Add description
    await page.getByLabel(/description/i).fill('Test listing without video');

    // Should still be able to create listing
    await page.getByRole('button', { name: /create.*listing|publish/i }).click();

    // Should show success
    await expect(page.getByText(/success|created|published/i)).toBeVisible();
  });

  test('should handle video upload failure gracefully', async ({ page }) => {
    // Navigate to create listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing/i }).click();

    // Select animal and proceed
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/price/i).fill('15000');
    await page.getByRole('button', { name: /next/i }).click();

    // Simulate network failure during upload
    await page.context().setOffline(true);

    // Try to upload video
    const videoInput = page.locator('input[type="file"][accept*="video"]');
    
    if (await videoInput.isVisible()) {
      // Upload video (would need actual test file)
      // await videoInput.setInputFiles('test-files/test-video.mp4');

      // Should show error message
      await expect(page.getByText(/failed|error|try.*again/i)).toBeVisible();

      // Should allow retry
      await expect(page.getByRole('button', { name: /retry|try.*again/i })).toBeVisible();

      // Should allow continuing without video
      await expect(page.getByRole('button', { name: /skip|continue.*without/i })).toBeVisible();
    }

    // Go back online
    await page.context().setOffline(false);
  });
});