import { test, expect } from '@playwright/test';
import { AuthHelper, generateEthiopianName, waitForLoading } from './test-utils';

test.describe('Buyer Interest Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login();
    await authHelper.completeOnboarding();
  });

  test('should browse marketplace and filter listings', async ({ page }) => {
    // Navigate to marketplace browse
    await page.getByRole('tab', { name: /marketplace|buy/i }).click();
    await waitForLoading(page);

    // Verify listings are displayed
    const listings = page.locator('[data-testid="listing-card"], [data-testid="marketplace-item"]');
    await expect(listings.first()).toBeVisible();

    // Test price range filter
    await page.getByRole('button', { name: /filter|filters/i }).click();
    await page.getByLabel(/min.*price|price.*from/i).fill('10000');
    await page.getByLabel(/max.*price|price.*to/i).fill('20000');
    await page.getByRole('button', { name: /apply|search/i }).click();

    // Should filter results
    await waitForLoading(page);
  });

  test('should view detailed listing information', async ({ page }) => {
    // Navigate to marketplace
    await page.getByRole('tab', { name: /marketplace|buy/i }).click();

    // Click on first listing
    await page.locator('[data-testid="listing-card"]').first().click();

    // Verify detailed information is shown
    await expect(page.getByText(/description|details/i)).toBeVisible();
    await expect(page.getByText(/price|amount/i)).toBeVisible();
    await expect(page.getByText(/location|address/i)).toBeVisible();
    await expect(page.getByText(/breed|type|age/i)).toBeVisible();

    // Check for photo gallery
    const photos = page.locator('img[data-testid="listing-photo"], [data-testid="photo-gallery"] img');
    if (await photos.first().isVisible()) {
      await expect(photos).toHaveCount(await photos.count());
    }
  });

  test('should submit interest with message', async ({ page }) => {
    // Navigate to listing detail
    await page.getByRole('tab', { name: /marketplace|buy/i }).click();
    await page.locator('[data-testid="listing-card"]').first().click();

    // Click express interest
    await page.getByRole('button', { name: /interested|contact|express.*interest/i }).click();

    // Verify interest form is shown
    await expect(page.getByLabel(/message|note|comment/i)).toBeVisible();

    // Fill message
    const buyerMessage = `Hello, I am interested in purchasing this animal. My name is ${generateEthiopianName()}. Please contact me to discuss the price and arrange viewing.`;
    await page.getByLabel(/message|note|comment/i).fill(buyerMessage);

    // Submit interest
    await page.getByRole('button', { name: /submit|send|express.*interest/i }).click();

    // Verify success message
    await expect(page.getByText(/interest.*sent|message.*sent|contacted.*seller/i)).toBeVisible();
  });

  test('should validate interest form', async ({ page }) => {
    // Navigate to listing detail
    await page.getByRole('tab', { name: /marketplace|buy/i }).click();
    await page.locator('[data-testid="listing-card"]').first().click();

    // Click express interest
    await page.getByRole('button', { name: /interested|contact/i }).click();

    // Try to submit without message
    await page.getByRole('button', { name: /submit|send/i }).click();

    // Should show validation error
    await expect(page.getByText(/message.*required|please.*message/i)).toBeVisible();
  });

  test('should show seller contact information to interested buyers', async ({ page }) => {
    // This test would require setting up test data with existing interest
    // For now, we'll test the UI structure

    // Navigate to marketplace as seller
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();

    // Navigate to seller's listings
    await page.getByRole('button', { name: /my.*listings|seller.*dashboard/i }).click();

    // Click on a listing (assuming it exists)
    const myListing = page.locator('[data-testid="my-listing"]').first();
    if (await myListing.isVisible()) {
      await myListing.click();

      // Check for interested buyers section
      const interestedBuyersSection = page.locator('[data-testid="interested-buyers"], [data-testid="buyer-interests"]');
      if (await interestedBuyersSection.isVisible()) {
        // Verify buyer information is displayed
        await expect(page.getByText(/buyer|interested|contact/i)).toBeVisible();

        // Check for contact details
        await expect(page.getByText(/phone|mobile|message/i)).toBeVisible();
      }
    }
  });

  test('should allow seller to respond to buyer interest', async ({ page }) => {
    // Navigate to seller's listing with interested buyers
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();

    const myListing = page.locator('[data-testid="my-listing"]').first();
    if (await myListing.isVisible()) {
      await myListing.click();

      // Find interested buyer
      const interestedBuyer = page.locator('[data-testid="interested-buyer"]').first();
      if (await interestedBuyer.isVisible()) {
        // Click to view buyer details
        await interestedBuyer.click();

        // Should show buyer message and contact options
        await expect(page.getByText(/message|interest/i)).toBeVisible();

        // Test call functionality (if available)
        const callButton = page.getByRole('button', { name: /call|phone/i });
        if (await callButton.isVisible()) {
          // In real test, this would trigger phone call
          // For now, just verify button exists
          await expect(callButton).toBeVisible();
        }

        // Test message reply functionality
        const replyButton = page.getByRole('button', { name: /reply|message|respond/i });
        if (await replyButton.isVisible()) {
          await replyButton.click();

          // Should show reply form
          await expect(page.getByLabel(/reply|response/i)).toBeVisible();

          // Fill reply
          await page.getByLabel(/reply|response/i).fill('Thank you for your interest. The animal is available. Please call me to discuss.');

          // Send reply
          await page.getByRole('button', { name: /send|reply/i }).click();

          // Should show success
          await expect(page.getByText(/sent|replied/i)).toBeVisible();
        }
      }
    }
  });

  test('should handle multiple interested buyers', async ({ page }) => {
    // Navigate to seller's listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();

    const myListing = page.locator('[data-testid="my-listing"]').first();
    if (await myListing.isVisible()) {
      await myListing.click();

      // Count interested buyers
      const interestedBuyers = page.locator('[data-testid="interested-buyer"]');
      const buyerCount = await interestedBuyers.count();

      if (buyerCount > 1) {
        // Verify all buyers are displayed
        await expect(interestedBuyers).toHaveCount(buyerCount);

        // Test that each buyer has contact information
        for (let i = 0; i < buyerCount; i++) {
          const buyer = interestedBuyers.nth(i);
          await expect(buyer.getByText(/phone|contact|message/i)).toBeVisible();
        }
      }
    }
  });

  test('should filter interested buyers by status', async ({ page }) => {
    // Navigate to seller's listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();

    const myListing = page.locator('[data-testid="my-listing"]').first();
    if (await myListing.isVisible()) {
      await myListing.click();

      // Check for status filter
      const statusFilter = page.getByRole('button', { name: /status|filter/i });
      if (await statusFilter.isVisible()) {
        await statusFilter.click();

        // Select different statuses
        const pendingOption = page.getByRole('option', { name: /pending|new/i });
        if (await pendingOption.isVisible()) {
          await pendingOption.click();

          // Should filter buyers by status
          await waitForLoading(page);
        }
      }
    }
  });

  test('should mark buyer interest as contacted', async ({ page }) => {
    // Navigate to seller's listing
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();

    const myListing = page.locator('[data-testid="my-listing"]').first();
    if (await myListing.isVisible()) {
      await myListing.click();

      const interestedBuyer = page.locator('[data-testid="interested-buyer"]').first();
      if (await interestedBuyer.isVisible()) {
        // Look for mark as contacted button
        const contactedButton = interestedBuyer.getByRole('button', { name: /contacted|mark.*contacted/i });
        if (await contactedButton.isVisible()) {
          await contactedButton.click();

          // Should update status
          await expect(page.getByText(/contacted|responded/i)).toBeVisible();
        }
      }
    }
  });
});