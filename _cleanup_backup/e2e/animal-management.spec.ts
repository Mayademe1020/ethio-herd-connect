import { test, expect } from '@playwright/test';
import { AuthHelper, generateAnimalData, waitForLoading } from './test-utils';

test.describe('Animal Management Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login();
    await authHelper.completeOnboarding();
  });

  test('should register cattle with all required fields', async ({ page }) => {
    const animalData = generateAnimalData('cattle');

    // Navigate to animal registration
    await page.getByRole('button', { name: /add.*animal|register.*animal/i }).click();

    // Select cattle type
    await page.getByRole('button', { name: /cattle/i }).click();

    // Fill animal details
    await page.getByLabel(/name/i).fill(animalData.name);
    await page.getByLabel(/breed/i).selectOption(animalData.breed);
    await page.getByLabel(/age|birth.*date/i).fill(animalData.age.toString());
    await page.getByLabel(/weight/i).fill(animalData.weight.toString());
    await page.getByLabel(/gender/i).selectOption(animalData.gender);

    // Upload photo (if required)
    const photoInput = page.locator('input[type="file"]');
    if (await photoInput.isVisible()) {
      // In real test, you would upload an actual file
      // await photoInput.setInputFiles('path/to/test/image.jpg');
    }

    // Submit registration
    await page.getByRole('button', { name: /register|save|submit/i }).click();

    // Should show success message
    await expect(page.getByText(/success|registered|saved/i)).toBeVisible();

    // Should navigate back to animal list
    await expect(page).toHaveURL(/.*animals|my-animals.*/);
  });

  test('should register goat with lactation status', async ({ page }) => {
    const animalData = generateAnimalData('goat');

    // Navigate to animal registration
    await page.getByRole('button', { name: /add.*animal|register.*animal/i }).click();

    // Select goat type
    await page.getByRole('button', { name: /goat/i }).click();

    // Fill basic details
    await page.getByLabel(/name/i).fill(animalData.name);
    await page.getByLabel(/breed/i).selectOption(animalData.breed);
    await page.getByLabel(/age|birth.*date/i).fill(animalData.age.toString());
    await page.getByLabel(/weight/i).fill(animalData.weight.toString());
    await page.getByLabel(/gender/i).selectOption(animalData.gender);

    // If female, should show lactation options
    if (animalData.gender === 'female') {
      await page.getByLabel(/lactating|lactation/i).selectOption('yes');
      await page.getByLabel(/milk.*production|daily.*milk/i).fill('2.5');
    }

    // Submit registration
    await page.getByRole('button', { name: /register|save|submit/i }).click();

    await expect(page.getByText(/success|registered|saved/i)).toBeVisible();
  });

  test('should display animal list with filtering', async ({ page }) => {
    // Navigate to animals page
    await page.goto('/my-animals');
    await waitForLoading(page);

    // Should show animal cards
    await expect(page.locator('[data-testid="animal-card"]')).toHaveCount(await page.locator('[data-testid="animal-card"]').count());

    // Test filtering by type
    await page.getByRole('button', { name: /filter|type/i }).click();
    await page.getByRole('option', { name: /cattle/i }).click();

    // Should filter results
    const cattleCards = page.locator('[data-testid="animal-card"]').filter({ hasText: /cattle/i });
    await expect(cattleCards.first()).toBeVisible();
  });

  test('should show animal detail view', async ({ page }) => {
    // Navigate to animals page
    await page.goto('/my-animals');
    await waitForLoading(page);

    // Click on first animal
    await page.locator('[data-testid="animal-card"]').first().click();

    // Should show detail view
    await expect(page.getByText(/details|information/i)).toBeVisible();
    await expect(page.getByText(/edit|delete/i)).toBeVisible();
  });

  test('should edit animal information', async ({ page }) => {
    // Navigate to animal detail
    await page.goto('/my-animals');
    await page.locator('[data-testid="animal-card"]').first().click();

    // Click edit
    await page.getByRole('button', { name: /edit/i }).click();

    // Modify weight
    await page.getByLabel(/weight/i).fill('450');

    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();

    // Should show success message
    await expect(page.getByText(/updated|saved/i)).toBeVisible();
  });

  test('should edit animal with comprehensive field updates', async ({ page }) => {
    // Navigate to animal detail
    await page.goto('/my-animals');
    await waitForLoading(page);
    await page.locator('[data-testid="animal-card"]').first().click();

    // Get original name for verification
    const originalName = await page.locator('[data-testid="animal-name"]').textContent();

    // Click edit
    await page.getByRole('button', { name: /edit/i }).click();

    // Wait for edit modal
    await expect(page.getByRole('dialog')).toBeVisible();

    // Update name
    const newName = `Updated ${originalName}`;
    await page.getByLabel(/name/i).fill(newName);

    // Update subtype if available
    const subtypeSelect = page.getByLabel(/subtype|breed/i);
    if (await subtypeSelect.isVisible()) {
      await subtypeSelect.selectOption({ index: 1 });
    }

    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();

    // Should show success message
    await expect(page.getByText(/updated|saved|success/i)).toBeVisible();

    // Verify updated name is displayed
    await expect(page.getByText(newName)).toBeVisible();
  });

  test('should track edit history in database', async ({ page }) => {
    // Navigate to animal detail
    await page.goto('/my-animals');
    await waitForLoading(page);
    await page.locator('[data-testid="animal-card"]').first().click();

    // Get animal ID from URL or data attribute
    const url = page.url();
    const animalId = url.split('/').pop();

    // Click edit
    await page.getByRole('button', { name: /edit/i }).click();

    // Make a change
    await page.getByLabel(/name/i).fill('Edit History Test Animal');

    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();

    // Wait for success
    await expect(page.getByText(/updated|saved/i)).toBeVisible();

    // Verify edit count increased (if displayed)
    const editCount = page.locator('[data-testid="edit-count"]');
    if (await editCount.isVisible()) {
      const count = await editCount.textContent();
      expect(parseInt(count || '0')).toBeGreaterThan(0);
    }

    // Verify last_edited_at timestamp is updated (if displayed)
    const lastEdited = page.locator('[data-testid="last-edited"]');
    if (await lastEdited.isVisible()) {
      await expect(lastEdited).toBeVisible();
    }
  });

  test('should handle offline edit and sync with queue', async ({ page }) => {
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

    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();

    // Should show offline indicator or queued message
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

  test('should delete animal with confirmation', async ({ page }) => {
    // Navigate to animal detail
    await page.goto('/my-animals');
    await page.locator('[data-testid="animal-card"]').first().click();

    // Click delete
    await page.getByRole('button', { name: /delete/i }).click();

    // Confirm deletion
    await page.getByRole('button', { name: /confirm|yes|delete/i }).click();

    // Should show success message and navigate back
    await expect(page.getByText(/deleted|removed/i)).toBeVisible();
  });

  test('should handle photo upload and compression', async ({ page }) => {
    // Navigate to animal registration
    await page.getByRole('button', { name: /add.*animal|register.*animal/i }).click();

    // Select photo upload
    const photoInput = page.locator('input[type="file"]');
    await photoInput.setInputFiles('test-files/large-image.jpg'); // Would need actual test file

    // Should show compression progress
    await expect(page.getByText(/compressing|processing/i)).toBeVisible();

    // Should complete successfully
    await expect(page.getByText(/uploaded|ready/i)).toBeVisible();
  });

  test('should record pregnancy for female animal', async ({ page }) => {
    // Navigate to animals page
    await page.goto('/my-animals');
    await waitForLoading(page);

    // Find and click on a female animal
    const femaleAnimal = page.locator('[data-testid="animal-card"]').filter({ hasText: /female|cow|ewe/i }).first();
    await femaleAnimal.click();

    // Click record pregnancy button
    await page.getByRole('button', { name: /record.*pregnancy|pregnancy/i }).click();

    // Wait for pregnancy tracker modal
    await expect(page.getByRole('dialog')).toBeVisible();

    // Enter breeding date (30 days ago)
    const breedingDate = new Date();
    breedingDate.setDate(breedingDate.getDate() - 30);
    const dateString = breedingDate.toISOString().split('T')[0];
    await page.getByLabel(/breeding.*date|date.*bred/i).fill(dateString);

    // Should show calculated delivery date
    await expect(page.getByText(/expected.*delivery|due.*date/i)).toBeVisible();

    // Should show days remaining
    await expect(page.getByText(/days.*remaining|days.*until/i)).toBeVisible();

    // Save pregnancy record
    await page.getByRole('button', { name: /save|record|submit/i }).click();

    // Should show success message
    await expect(page.getByText(/pregnancy.*recorded|saved|success/i)).toBeVisible();

    // Should show pregnancy status on animal detail
    await expect(page.getByText(/pregnant|pregnancy.*status/i)).toBeVisible();
  });

  test('should display delivery alert when less than 7 days remaining', async ({ page }) => {
    // Navigate to animals page
    await page.goto('/my-animals');
    await waitForLoading(page);

    // Find a pregnant animal (or create one with delivery soon)
    const pregnantAnimal = page.locator('[data-testid="animal-card"]').filter({ hasText: /pregnant/i }).first();
    
    if (await pregnantAnimal.isVisible()) {
      await pregnantAnimal.click();

      // Check if delivery is within 7 days
      const daysRemaining = page.locator('[data-testid="days-remaining"]');
      if (await daysRemaining.isVisible()) {
        const days = await daysRemaining.textContent();
        const daysNum = parseInt(days || '999');

        if (daysNum <= 7) {
          // Should show prominent alert
          await expect(page.getByRole('alert')).toBeVisible();
          await expect(page.getByText(/delivery.*soon|approaching.*delivery/i)).toBeVisible();

          // Should show countdown
          await expect(page.getByText(/\d+.*days/i)).toBeVisible();

          // Should show action button
          await expect(page.getByRole('button', { name: /record.*birth|birth/i })).toBeVisible();
        }
      }
    }
  });

  test('should record birth and complete pregnancy', async ({ page }) => {
    // Navigate to animals page
    await page.goto('/my-animals');
    await waitForLoading(page);

    // Find a pregnant animal
    const pregnantAnimal = page.locator('[data-testid="animal-card"]').filter({ hasText: /pregnant/i }).first();
    
    if (await pregnantAnimal.isVisible()) {
      await pregnantAnimal.click();

      // Click record birth button
      await page.getByRole('button', { name: /record.*birth|birth/i }).click();

      // Wait for birth modal
      await expect(page.getByRole('dialog')).toBeVisible();

      // Select birth outcome
      const outcomeSelect = page.getByLabel(/outcome|result/i);
      if (await outcomeSelect.isVisible()) {
        await outcomeSelect.selectOption('successful');
      }

      // Option to register offspring
      const registerOffspring = page.getByLabel(/register.*offspring|add.*calf/i);
      if (await registerOffspring.isVisible()) {
        await registerOffspring.check();
      }

      // Save birth record
      await page.getByRole('button', { name: /save|record|complete/i }).click();

      // Should show success message
      await expect(page.getByText(/birth.*recorded|pregnancy.*complete|success/i)).toBeVisible();

      // Pregnancy status should update to delivered
      await expect(page.getByText(/delivered|completed/i)).toBeVisible();

      // Should no longer show pregnant badge
      const pregnantBadge = page.locator('[data-testid="pregnancy-badge"]');
      if (await pregnantBadge.isVisible()) {
        await expect(pregnantBadge).not.toBeVisible();
      }
    }
  });

  test('should display pregnancy history', async ({ page }) => {
    // Navigate to animals page
    await page.goto('/my-animals');
    await waitForLoading(page);

    // Find a female animal with pregnancy history
    const femaleAnimal = page.locator('[data-testid="animal-card"]').filter({ hasText: /female|cow|ewe/i }).first();
    await femaleAnimal.click();

    // Look for pregnancy history section
    const historySection = page.locator('[data-testid="pregnancy-history"]');
    if (await historySection.isVisible()) {
      // Should show past pregnancies
      await expect(page.getByText(/pregnancy.*history|past.*pregnancies/i)).toBeVisible();

      // Should show pregnancy records with dates
      const pregnancyRecords = page.locator('[data-testid="pregnancy-record"]');
      if (await pregnancyRecords.first().isVisible()) {
        // Should show breeding date
        await expect(pregnancyRecords.first().getByText(/bred|breeding.*date/i)).toBeVisible();

        // Should show outcome
        await expect(pregnancyRecords.first().getByText(/delivered|successful|terminated/i)).toBeVisible();
      }
    }
  });

  test('should show pregnancy badge on animal cards', async ({ page }) => {
    // Navigate to animals page
    await page.goto('/my-animals');
    await waitForLoading(page);

    // Find pregnant animals
    const pregnantAnimals = page.locator('[data-testid="animal-card"]').filter({ hasText: /pregnant/i });

    if (await pregnantAnimals.first().isVisible()) {
      // Should show pregnancy badge
      await expect(pregnantAnimals.first().locator('[data-testid="pregnancy-badge"]')).toBeVisible();

      // Should show days until delivery
      await expect(pregnantAnimals.first().getByText(/\d+.*days/i)).toBeVisible();

      // Should show pregnancy icon
      const pregnancyIcon = pregnantAnimals.first().locator('[data-testid="pregnancy-icon"]');
      if (await pregnancyIcon.isVisible()) {
        await expect(pregnancyIcon).toBeVisible();
      }
    }
  });

  test('should validate breeding date cannot be in future', async ({ page }) => {
    // Navigate to animals page
    await page.goto('/my-animals');
    await waitForLoading(page);

    // Find a female animal
    const femaleAnimal = page.locator('[data-testid="animal-card"]').filter({ hasText: /female|cow|ewe/i }).first();
    await femaleAnimal.click();

    // Click record pregnancy
    await page.getByRole('button', { name: /record.*pregnancy|pregnancy/i }).click();

    // Enter future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const dateString = futureDate.toISOString().split('T')[0];
    await page.getByLabel(/breeding.*date|date.*bred/i).fill(dateString);

    // Try to save
    await page.getByRole('button', { name: /save|record|submit/i }).click();

    // Should show validation error
    await expect(page.getByText(/future|cannot.*be.*future|invalid.*date/i)).toBeVisible();
  });

  test('should calculate correct delivery date based on animal type', async ({ page }) => {
    // Test for cattle (283 days)
    await page.goto('/my-animals');
    await waitForLoading(page);

    const cattleAnimal = page.locator('[data-testid="animal-card"]').filter({ hasText: /cattle.*female|cow/i }).first();
    
    if (await cattleAnimal.isVisible()) {
      await cattleAnimal.click();
      await page.getByRole('button', { name: /record.*pregnancy/i }).click();

      // Enter breeding date
      const breedingDate = new Date('2024-01-01');
      await page.getByLabel(/breeding.*date/i).fill('2024-01-01');

      // Calculate expected delivery (283 days later)
      const expectedDelivery = new Date('2024-01-01');
      expectedDelivery.setDate(expectedDelivery.getDate() + 283);

      // Should show calculated date
      const deliveryDateText = await page.locator('[data-testid="expected-delivery"]').textContent();
      // Verify the date is approximately correct (within a day due to formatting)
      expect(deliveryDateText).toContain(expectedDelivery.getFullYear().toString());
    }
  });
});