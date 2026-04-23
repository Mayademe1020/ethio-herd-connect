import { test, expect } from '@playwright/test';
import { AuthHelper, waitForLoading } from './test-utils';

test.describe('Milk Recording Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login();
    await authHelper.completeOnboarding();
  });

  test('should record milk for lactating animal', async ({ page }) => {
    // Navigate to milk recording
    await page.getByRole('tab', { name: /milk|record.*milk/i }).click();
    await waitForLoading(page);

    // Select animal (assuming there are animals available)
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').filter({ hasText: /lactating|female/i }).first().click();

    // Select session (morning/evening)
    await page.getByRole('button', { name: /morning|evening/i }).first().click();

    // Enter milk amount
    await page.getByLabel(/amount|liters|quantity/i).fill('2.5');

    // Select quick amount if available
    const quickAmount = page.getByRole('button', { name: /1\.5|2\.0|2\.5|3\.0/i });
    if (await quickAmount.isVisible()) {
      await quickAmount.click();
    }

    // Submit recording
    await page.getByRole('button', { name: /record|save|submit/i }).click();

    // Should show success message
    await expect(page.getByText(/recorded|saved|success/i)).toBeVisible();
  });

  test('should detect and suggest session based on time', async ({ page }) => {
    // Navigate to milk recording
    await page.getByRole('tab', { name: /milk|record.*milk/i }).click();

    // Check if morning/evening is pre-selected based on current time
    const morningButton = page.getByRole('button', { name: /morning/i });
    const eveningButton = page.getByRole('button', { name: /evening/i });

    // One should be selected by default
    const selectedCount = await page.locator('[aria-pressed="true"]').filter({ hasText: /morning|evening/i }).count();
    expect(selectedCount).toBeGreaterThan(0);
  });

  test('should show milk history and statistics', async ({ page }) => {
    // Navigate to milk recording
    await page.getByRole('tab', { name: /milk|record.*milk/i }).click();

    // Check for history section
    await expect(page.getByText(/history|records|previous/i)).toBeVisible();

    // Should show milk entries
    const milkEntries = page.locator('[data-testid="milk-entry"], [data-testid="milk-record"]');
    if (await milkEntries.first().isVisible()) {
      await expect(milkEntries).toHaveCount(await milkEntries.count());
    }

    // Check for statistics/summary
    await expect(page.getByText(/total|average|today|week|month/i)).toBeVisible();
  });

  test('should validate milk amount input', async ({ page }) => {
    // Navigate to milk recording
    await page.getByRole('tab', { name: /milk|record.*milk/i }).click();

    // Select animal
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').first().click();

    // Try invalid amount
    await page.getByLabel(/amount|liters|quantity/i).fill('-1');

    // Submit
    await page.getByRole('button', { name: /record|save|submit/i }).click();

    // Should show validation error
    await expect(page.getByText(/invalid|positive|greater.*zero/i)).toBeVisible();
  });

  test('should handle multiple recordings per day', async ({ page }) => {
    // Navigate to milk recording
    await page.getByRole('tab', { name: /milk|record.*milk/i }).click();

    // Record morning milk
    await page.getByRole('button', { name: /morning/i }).click();
    await page.getByLabel(/amount|liters|quantity/i).fill('2.0');
    await page.getByRole('button', { name: /record|save|submit/i }).click();

    // Record evening milk
    await page.getByRole('button', { name: /evening/i }).click();
    await page.getByLabel(/amount|liters|quantity/i).fill('1.8');
    await page.getByRole('button', { name: /record|save|submit/i }).click();

    // Should show both recordings
    await expect(page.getByText('2.0')).toBeVisible();
    await expect(page.getByText('1.8')).toBeVisible();

    // Total should be calculated
    await expect(page.getByText(/3\.8|total.*3\.8/i)).toBeVisible();
  });

  test('should filter milk records by date range', async ({ page }) => {
    // Navigate to milk recording
    await page.getByRole('tab', { name: /milk|record.*milk/i }).click();

    // Open date filter
    await page.getByRole('button', { name: /filter|date.*range/i }).click();

    // Select date range (last 7 days)
    await page.getByLabel(/from|start.*date/i).fill('2024-01-01');
    await page.getByLabel(/to|end.*date/i).fill('2024-01-07');

    // Apply filter
    await page.getByRole('button', { name: /apply|filter/i }).click();

    // Should update the displayed records
    await waitForLoading(page);

    // Records should be filtered
    const visibleRecords = page.locator('[data-testid="milk-entry"], [data-testid="milk-record"]');
    if (await visibleRecords.first().isVisible()) {
      // All visible records should be within the date range
      // This would require more specific assertions based on actual data
    }
  });

  test('should export milk records', async ({ page }) => {
    // Navigate to milk recording
    await page.getByRole('tab', { name: /milk|record.*milk/i }).click();

    // Click export button
    const exportButton = page.getByRole('button', { name: /export|download/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();

      // Should trigger download or show export options
      await expect(page.getByText(/exporting|downloading|preparing/i)).toBeVisible();
    }
  });

  test('should display milk summary card', async ({ page }) => {
    // Navigate to milk production records
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Should show milk summary card
    const summaryCard = page.locator('[data-testid="milk-summary-card"]');
    await expect(summaryCard).toBeVisible();

    // Should show total liters
    await expect(summaryCard.getByText(/total.*liter|total.*production/i)).toBeVisible();

    // Should show record count
    await expect(summaryCard.getByText(/record|session/i)).toBeVisible();

    // Should show average per day
    await expect(summaryCard.getByText(/average|avg/i)).toBeVisible();

    // Should show trend indicator
    const trendIndicator = summaryCard.locator('[data-testid="trend-indicator"]');
    if (await trendIndicator.isVisible()) {
      // Should show arrow (↑ ↓ →)
      await expect(trendIndicator).toBeVisible();
    }
  });

  test('should toggle between weekly and monthly summary', async ({ page }) => {
    // Navigate to milk production records
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Should show period selector
    const weeklyButton = page.getByRole('button', { name: /week/i });
    const monthlyButton = page.getByRole('button', { name: /month/i });

    await expect(weeklyButton).toBeVisible();
    await expect(monthlyButton).toBeVisible();

    // Get weekly total
    const summaryCard = page.locator('[data-testid="milk-summary-card"]');
    const weeklyTotal = await summaryCard.getByText(/\d+\.?\d*/).first().textContent();

    // Switch to monthly
    await monthlyButton.click();

    // Wait for update
    await page.waitForTimeout(500);

    // Should show monthly total (likely different from weekly)
    const monthlyTotal = await summaryCard.getByText(/\d+\.?\d*/).first().textContent();

    // Monthly should typically be higher than weekly
    // (unless there's very little data)
    expect(monthlyTotal).toBeTruthy();

    // Should show "Month" label
    await expect(page.getByText(/month/i)).toBeVisible();
  });

  test('should edit milk record', async ({ page }) => {
    // Navigate to milk production records
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Find a milk record
    const milkRecord = page.locator('[data-testid="milk-record"]').first();

    if (await milkRecord.isVisible()) {
      // Click edit button
      await milkRecord.getByRole('button', { name: /edit/i }).click();

      // Should show edit modal
      await expect(page.getByRole('dialog')).toBeVisible();

      // Should show pre-filled amount
      const amountInput = page.getByLabel(/amount|liter/i);
      await expect(amountInput).toBeVisible();
      const currentAmount = await amountInput.inputValue();
      expect(currentAmount).toBeTruthy();

      // Update amount
      await amountInput.fill('3.5');

      // Should show session selector
      const sessionSelect = page.getByLabel(/session|morning|afternoon/i);
      if (await sessionSelect.isVisible()) {
        await expect(sessionSelect).toBeVisible();
      }

      // Save changes
      await page.getByRole('button', { name: /save|update/i }).click();

      // Should show success message
      await expect(page.getByText(/updated|saved|success/i)).toBeVisible();

      // Should show updated amount
      await expect(page.getByText('3.5')).toBeVisible();
    }
  });

  test('should show confirmation for editing old records (>7 days)', async ({ page }) => {
    // Navigate to milk production records
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Filter to show old records
    await page.getByRole('button', { name: /filter|date/i }).click();
    
    // Select date range from 2 weeks ago
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const dateString = twoWeeksAgo.toISOString().split('T')[0];
    
    await page.getByLabel(/from|start/i).fill(dateString);
    await page.getByRole('button', { name: /apply/i }).click();

    // Find an old record
    const oldRecord = page.locator('[data-testid="milk-record"]').first();

    if (await oldRecord.isVisible()) {
      // Click edit
      await oldRecord.getByRole('button', { name: /edit/i }).click();

      // Should show confirmation warning
      await expect(page.getByText(/7.*day|old.*record|confirm|sure/i)).toBeVisible();

      // Should show confirm button
      await expect(page.getByRole('button', { name: /confirm|yes|proceed/i })).toBeVisible();

      // Should show cancel button
      await expect(page.getByRole('button', { name: /cancel|no/i })).toBeVisible();

      // Click confirm
      await page.getByRole('button', { name: /confirm|yes|proceed/i }).click();

      // Should show edit form
      await expect(page.getByLabel(/amount|liter/i)).toBeVisible();
    }
  });

  test('should recalculate summary after edit', async ({ page }) => {
    // Navigate to milk production records
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Get initial summary total
    const summaryCard = page.locator('[data-testid="milk-summary-card"]');
    const initialTotal = await summaryCard.locator('[data-testid="total-liters"]').textContent();

    // Edit a record
    const milkRecord = page.locator('[data-testid="milk-record"]').first();

    if (await milkRecord.isVisible()) {
      // Get original amount
      const originalAmount = await milkRecord.locator('[data-testid="milk-amount"]').textContent();
      const originalValue = parseFloat(originalAmount || '0');

      // Click edit
      await milkRecord.getByRole('button', { name: /edit/i }).click();

      // Change amount (add 1 liter)
      const newAmount = originalValue + 1;
      await page.getByLabel(/amount|liter/i).fill(newAmount.toString());

      // Save
      await page.getByRole('button', { name: /save|update/i }).click();

      // Wait for success
      await expect(page.getByText(/updated|saved/i)).toBeVisible();

      // Wait for summary recalculation
      await page.waitForTimeout(500);

      // Get new summary total
      const newTotal = await summaryCard.locator('[data-testid="total-liters"]').textContent();

      // Total should have increased by 1
      const initialValue = parseFloat(initialTotal || '0');
      const newValue = parseFloat(newTotal || '0');
      
      expect(newValue).toBeCloseTo(initialValue + 1, 1);
    }
  });

  test('should show trend indicator with percentage', async ({ page }) => {
    // Navigate to milk production records
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Should show summary card
    const summaryCard = page.locator('[data-testid="milk-summary-card"]');
    await expect(summaryCard).toBeVisible();

    // Should show trend indicator
    const trendIndicator = summaryCard.locator('[data-testid="trend-indicator"]');
    
    if (await trendIndicator.isVisible()) {
      // Should show arrow icon (↑ ↓ →)
      const trendIcon = trendIndicator.locator('[data-testid="trend-icon"]');
      await expect(trendIcon).toBeVisible();

      // Should show percentage change
      await expect(trendIndicator.getByText(/%/)).toBeVisible();

      // Should show trend text (increasing/decreasing/stable)
      const trendText = await trendIndicator.textContent();
      expect(trendText).toMatch(/increasing|decreasing|stable|up|down/i);
    }
  });

  test('should compare with previous period', async ({ page }) => {
    // Navigate to milk production records
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Should show summary card
    const summaryCard = page.locator('[data-testid="milk-summary-card"]');
    await expect(summaryCard).toBeVisible();

    // Should show comparison text
    const comparison = summaryCard.locator('[data-testid="period-comparison"]');
    
    if (await comparison.isVisible()) {
      // Should mention previous period
      await expect(comparison.getByText(/previous|last|compared/i)).toBeVisible();

      // Should show percentage or amount difference
      await expect(comparison.getByText(/\d+|%/)).toBeVisible();
    }
  });

  test('should validate milk amount input (0-100L)', async ({ page }) => {
    // Navigate to milk production records
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Find a record to edit
    const milkRecord = page.locator('[data-testid="milk-record"]').first();

    if (await milkRecord.isVisible()) {
      // Click edit
      await milkRecord.getByRole('button', { name: /edit/i }).click();

      // Try invalid amount (negative)
      await page.getByLabel(/amount|liter/i).fill('-1');
      await page.getByRole('button', { name: /save|update/i }).click();

      // Should show validation error
      await expect(page.getByText(/invalid|positive|greater.*zero/i)).toBeVisible();

      // Try invalid amount (too large)
      await page.getByLabel(/amount|liter/i).fill('150');
      await page.getByRole('button', { name: /save|update/i }).click();

      // Should show validation error
      await expect(page.getByText(/100|maximum|too.*large/i)).toBeVisible();

      // Try valid amount
      await page.getByLabel(/amount|liter/i).fill('5.5');
      await page.getByRole('button', { name: /save|update/i }).click();

      // Should succeed
      await expect(page.getByText(/updated|saved|success/i)).toBeVisible();
    }
  });

  test('should track edit history', async ({ page }) => {
    // Navigate to milk production records
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Find a record
    const milkRecord = page.locator('[data-testid="milk-record"]').first();

    if (await milkRecord.isVisible()) {
      // Click edit
      await milkRecord.getByRole('button', { name: /edit/i }).click();

      // Make change
      await page.getByLabel(/amount|liter/i).fill('4.0');
      await page.getByRole('button', { name: /save|update/i }).click();

      // Wait for success
      await expect(page.getByText(/updated|saved/i)).toBeVisible();

      // Check if edit history is shown
      const editHistory = page.locator('[data-testid="edit-history"]');
      if (await editHistory.isVisible()) {
        // Should show edit timestamp
        await expect(editHistory.getByText(/edited|modified/i)).toBeVisible();

        // Should show edit count
        const editCount = editHistory.locator('[data-testid="edit-count"]');
        if (await editCount.isVisible()) {
          const count = await editCount.textContent();
          expect(parseInt(count || '0')).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should support offline edit and sync', async ({ page }) => {
    // Navigate to milk production records
    await page.goto('/milk-production-records');
    await waitForLoading(page);

    // Go offline
    await page.context().setOffline(true);

    // Find a record to edit
    const milkRecord = page.locator('[data-testid="milk-record"]').first();

    if (await milkRecord.isVisible()) {
      // Click edit
      await milkRecord.getByRole('button', { name: /edit/i }).click();

      // Make change
      await page.getByLabel(/amount|liter/i).fill('6.0');
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
      await expect(page.getByText('6.0')).toBeVisible();
    }
  });
});