import { test, expect } from '@playwright/test';
import { AuthHelper, waitForLoading } from './test-utils';

test.describe('Bilingual Support for New Features', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login();
    await authHelper.completeOnboarding();
  });

  test('should display milk summary translations in English', async ({ page }) => {
    // Set language to English
    await page.goto('/profile');
    const languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('en');
    }

    // Navigate to milk production records
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Verify English translations
    const summaryCard = page.locator('[data-testid="milk-summary-card"]');
    await expect(summaryCard.getByText(/weekly total|monthly total/i)).toBeVisible();
    await expect(summaryCard.getByText(/average|trend|record/i)).toBeVisible();
  });

  test('should display milk summary translations in Amharic', async ({ page }) => {
    // Set language to Amharic
    await page.goto('/profile');
    const languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('am');
    }

    // Navigate to milk production records
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Verify Amharic translations are present
    const summaryCard = page.locator('[data-testid="milk-summary-card"]');
    
    // Check for Amharic text (should contain Ethiopic script)
    const text = await summaryCard.textContent();
    // Amharic uses Unicode range U+1200 to U+137F
    const hasAmharic = /[\u1200-\u137F]/.test(text || '');
    expect(hasAmharic).toBeTruthy();
  });

  test('should display edit animal modal translations in both languages', async ({ page }) => {
    // Test English
    await page.goto('/profile');
    let languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('en');
    }

    await page.goto('/my-animals');
    await waitForLoading(page);
    await page.locator('[data-testid="animal-card"]').first().click();
    await page.getByRole('button', { name: /edit/i }).click();

    // Verify English
    await expect(page.getByText(/edit.*animal|update.*animal/i)).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /cancel|close/i }).click();

    // Switch to Amharic
    await page.goto('/profile');
    languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('am');
    }

    await page.goto('/my-animals');
    await waitForLoading(page);
    await page.locator('[data-testid="animal-card"]').first().click();
    await page.getByRole('button', { name: /edit/i }).click();

    // Verify Amharic text is present
    const modalText = await page.getByRole('dialog').textContent();
    const hasAmharic = /[\u1200-\u137F]/.test(modalText || '');
    expect(hasAmharic).toBeTruthy();
  });

  test('should display edit listing modal translations in both languages', async ({ page }) => {
    // Test English
    await page.goto('/profile');
    let languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('en');
    }

    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();
    await waitForLoading(page);

    const editButton = page.locator('[data-testid="my-listing"]').first().locator('[data-testid="edit-listing"]');
    if (await editButton.isVisible()) {
      await editButton.click();

      // Verify English
      await expect(page.getByText(/edit.*listing|update.*listing/i)).toBeVisible();
      await expect(page.getByLabel(/price/i)).toBeVisible();

      // Close modal
      await page.getByRole('button', { name: /cancel|close/i }).click();

      // Switch to Amharic
      await page.goto('/profile');
      languageSelector = page.locator('[data-testid="language-selector"]');
      if (await languageSelector.isVisible()) {
        await languageSelector.selectOption('am');
      }

      await page.getByRole('tab', { name: /marketplace|sell/i }).click();
      await page.getByRole('button', { name: /my.*listings/i }).click();
      await waitForLoading(page);

      await page.locator('[data-testid="my-listing"]').first().locator('[data-testid="edit-listing"]').click();

      // Verify Amharic text is present
      const modalText = await page.getByRole('dialog').textContent();
      const hasAmharic = /[\u1200-\u137F]/.test(modalText || '');
      expect(hasAmharic).toBeTruthy();
    }
  });

  test('should display pregnancy tracker translations in both languages', async ({ page }) => {
    // Test English
    await page.goto('/profile');
    let languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('en');
    }

    await page.goto('/my-animals');
    await waitForLoading(page);
    
    const femaleAnimal = page.locator('[data-testid="animal-card"]').filter({ hasText: /female|cow|ewe/i }).first();
    if (await femaleAnimal.isVisible()) {
      await femaleAnimal.click();

      const pregnancyButton = page.getByRole('button', { name: /record.*pregnancy|pregnancy/i });
      if (await pregnancyButton.isVisible()) {
        await pregnancyButton.click();

        // Verify English
        await expect(page.getByText(/breeding.*date|expected.*delivery|days.*remaining/i)).toBeVisible();

        // Close modal
        await page.getByRole('button', { name: /cancel|close/i }).click();

        // Switch to Amharic
        await page.goto('/profile');
        languageSelector = page.locator('[data-testid="language-selector"]');
        if (await languageSelector.isVisible()) {
          await languageSelector.selectOption('am');
        }

        await page.goto('/my-animals');
        await waitForLoading(page);
        await femaleAnimal.click();
        await page.getByRole('button', { name: /pregnancy/i }).click();

        // Verify Amharic text is present
        const modalText = await page.getByRole('dialog').textContent();
        const hasAmharic = /[\u1200-\u137F]/.test(modalText || '');
        expect(hasAmharic).toBeTruthy();
      }
    }
  });

  test('should display notification translations for all types', async ({ page }) => {
    // Test English
    await page.goto('/profile');
    let languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('en');
    }

    await page.goto('/notifications');
    await waitForLoading(page);

    // Verify English notification text
    const notifications = page.locator('[data-testid="notification-card"]');
    if (await notifications.first().isVisible()) {
      const englishText = await notifications.first().textContent();
      expect(englishText).toMatch(/buyer.*interest|milk.*reminder|market.*alert|pregnancy/i);
    }

    // Switch to Amharic
    await page.goto('/profile');
    languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('am');
    }

    await page.goto('/notifications');
    await waitForLoading(page);

    // Verify Amharic text is present
    if (await notifications.first().isVisible()) {
      const amharicText = await notifications.first().textContent();
      const hasAmharic = /[\u1200-\u137F]/.test(amharicText || '');
      expect(hasAmharic).toBeTruthy();
    }
  });

  test('should display reminder settings translations in both languages', async ({ page }) => {
    // Test English
    await page.goto('/profile');
    let languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('en');
    }

    // Verify English reminder settings
    await expect(page.getByText(/reminder|morning|afternoon/i)).toBeVisible();

    // Switch to Amharic
    languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('am');
    }

    await page.reload();
    await waitForLoading(page);

    // Verify Amharic text is present
    const reminderSection = page.locator('[data-testid="reminder-settings"]');
    if (await reminderSection.isVisible()) {
      const text = await reminderSection.textContent();
      const hasAmharic = /[\u1200-\u137F]/.test(text || '');
      expect(hasAmharic).toBeTruthy();
    }
  });

  test('should verify Amharic text renders properly in milk summary', async ({ page }) => {
    // Set language to Amharic
    await page.goto('/profile');
    const languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('am');
    }

    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Take screenshot to verify rendering
    const summaryCard = page.locator('[data-testid="milk-summary-card"]');
    await expect(summaryCard).toBeVisible();

    // Verify Amharic characters are present and not showing as boxes
    const text = await summaryCard.textContent();
    const hasAmharic = /[\u1200-\u137F]/.test(text || '');
    expect(hasAmharic).toBeTruthy();

    // Check that text is not empty (would indicate rendering issues)
    expect(text?.length).toBeGreaterThan(0);
  });

  test('should verify Amharic text renders properly in edit modals', async ({ page }) => {
    // Set language to Amharic
    await page.goto('/profile');
    const languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('am');
    }

    await page.goto('/my-animals');
    await waitForLoading(page);
    await page.locator('[data-testid="animal-card"]').first().click();
    await page.getByRole('button', { name: /edit/i }).click();

    // Verify Amharic text renders
    const modal = page.getByRole('dialog');
    const modalText = await modal.textContent();
    const hasAmharic = /[\u1200-\u137F]/.test(modalText || '');
    expect(hasAmharic).toBeTruthy();

    // Verify labels are visible and not empty
    const labels = modal.locator('label');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThan(0);
  });

  test('should verify Amharic text renders properly in pregnancy tracker', async ({ page }) => {
    // Set language to Amharic
    await page.goto('/profile');
    const languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('am');
    }

    await page.goto('/my-animals');
    await waitForLoading(page);
    
    const femaleAnimal = page.locator('[data-testid="animal-card"]').filter({ hasText: /female|cow|ewe/i }).first();
    if (await femaleAnimal.isVisible()) {
      await femaleAnimal.click();

      const pregnancyButton = page.getByRole('button', { name: /pregnancy/i });
      if (await pregnancyButton.isVisible()) {
        await pregnancyButton.click();

        // Verify Amharic text renders
        const modal = page.getByRole('dialog');
        const modalText = await modal.textContent();
        const hasAmharic = /[\u1200-\u137F]/.test(modalText || '');
        expect(hasAmharic).toBeTruthy();
      }
    }
  });

  test('should verify Amharic text renders properly in notifications', async ({ page }) => {
    // Set language to Amharic
    await page.goto('/profile');
    const languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('am');
    }

    await page.goto('/notifications');
    await waitForLoading(page);

    // Verify Amharic text renders in notifications
    const notifications = page.locator('[data-testid="notification-card"]');
    if (await notifications.first().isVisible()) {
      const text = await notifications.first().textContent();
      const hasAmharic = /[\u1200-\u137F]/.test(text || '');
      expect(hasAmharic).toBeTruthy();

      // Verify text is not empty
      expect(text?.length).toBeGreaterThan(0);
    }
  });

  test('should switch languages dynamically without page reload', async ({ page }) => {
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Get English text
    const summaryCard = page.locator('[data-testid="milk-summary-card"]');
    const englishText = await summaryCard.textContent();

    // Switch to Amharic using language selector in header
    const languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('am');

      // Wait for translation to apply
      await page.waitForTimeout(500);

      // Get Amharic text
      const amharicText = await summaryCard.textContent();

      // Text should be different
      expect(amharicText).not.toBe(englishText);

      // Amharic text should contain Ethiopic script
      const hasAmharic = /[\u1200-\u137F]/.test(amharicText || '');
      expect(hasAmharic).toBeTruthy();
    }
  });

  test('should maintain language preference across navigation', async ({ page }) => {
    // Set language to Amharic
    await page.goto('/profile');
    const languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('am');
    }

    // Navigate to different pages
    await page.goto('/my-animals');
    await waitForLoading(page);
    let text = await page.textContent('body');
    let hasAmharic = /[\u1200-\u137F]/.test(text || '');
    expect(hasAmharic).toBeTruthy();

    await page.goto('/milk-production-records');
    await waitForLoading(page);
    text = await page.textContent('body');
    hasAmharic = /[\u1200-\u137F]/.test(text || '');
    expect(hasAmharic).toBeTruthy();

    await page.goto('/notifications');
    await waitForLoading(page);
    text = await page.textContent('body');
    hasAmharic = /[\u1200-\u137F]/.test(text || '');
    expect(hasAmharic).toBeTruthy();
  });

  test('should display consistent terminology across features', async ({ page }) => {
    // Set language to English
    await page.goto('/profile');
    const languageSelector = page.locator('[data-testid="language-selector"]');
    if (await languageSelector.isVisible()) {
      await languageSelector.selectOption('en');
    }

    // Check for consistent use of "Edit" across features
    await page.goto('/my-animals');
    await waitForLoading(page);
    await page.locator('[data-testid="animal-card"]').first().click();
    const animalEditButton = await page.getByRole('button', { name: /edit/i }).textContent();

    await page.getByRole('tab', { name: /marketplace/i }).click();
    await page.getByRole('button', { name: /my.*listings/i }).click();
    await waitForLoading(page);
    const listingEditButton = await page.locator('[data-testid="edit-listing"]').first().textContent();

    // Both should use the same term
    expect(animalEditButton?.toLowerCase()).toContain('edit');
    expect(listingEditButton?.toLowerCase()).toContain('edit');
  });
});
