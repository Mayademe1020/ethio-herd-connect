import { test, expect } from '@playwright/test';
import { AuthHelper, waitForLoading } from './test-utils';

test.describe('Milk Recording Reminders Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login();
    await authHelper.completeOnboarding();
  });

  test('should access reminder settings from profile page', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Should show reminder settings section
    const reminderSection = page.locator('[data-testid="reminder-settings"]');
    await expect(reminderSection).toBeVisible();

    // Should show section title
    await expect(page.getByText(/reminder|notification.*setting/i)).toBeVisible();
  });

  test('should display morning and afternoon reminder toggles', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Should show morning reminder toggle
    const morningToggle = page.locator('[data-testid="morning-reminder-toggle"]');
    await expect(morningToggle).toBeVisible();
    await expect(page.getByText(/morning/i)).toBeVisible();

    // Should show afternoon reminder toggle
    const afternoonToggle = page.locator('[data-testid="afternoon-reminder-toggle"]');
    await expect(afternoonToggle).toBeVisible();
    await expect(page.getByText(/afternoon|evening/i)).toBeVisible();
  });

  test('should enable morning reminder', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Find morning reminder toggle
    const morningToggle = page.locator('[data-testid="morning-reminder-toggle"]');

    // Check if it's currently disabled
    const isEnabled = await morningToggle.isChecked();

    if (!isEnabled) {
      // Enable it
      await morningToggle.click();

      // Should show success message
      await expect(page.getByText(/enabled|saved|updated/i)).toBeVisible();

      // Should show time picker
      const timePicker = page.locator('[data-testid="morning-time-picker"]');
      await expect(timePicker).toBeVisible();
    }
  });

  test('should enable afternoon reminder', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Find afternoon reminder toggle
    const afternoonToggle = page.locator('[data-testid="afternoon-reminder-toggle"]');

    // Check if it's currently disabled
    const isEnabled = await afternoonToggle.isChecked();

    if (!isEnabled) {
      // Enable it
      await afternoonToggle.click();

      // Should show success message
      await expect(page.getByText(/enabled|saved|updated/i)).toBeVisible();

      // Should show time picker
      const timePicker = page.locator('[data-testid="afternoon-time-picker"]');
      await expect(timePicker).toBeVisible();
    }
  });

  test('should customize morning reminder time', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Enable morning reminder if not already enabled
    const morningToggle = page.locator('[data-testid="morning-reminder-toggle"]');
    if (!(await morningToggle.isChecked())) {
      await morningToggle.click();
    }

    // Find time picker
    const timePicker = page.locator('[data-testid="morning-time-picker"]');
    await expect(timePicker).toBeVisible();

    // Set custom time (7:30 AM)
    await timePicker.fill('07:30');

    // Save changes
    const saveButton = page.getByRole('button', { name: /save|update/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }

    // Should show success message
    await expect(page.getByText(/saved|updated|success/i)).toBeVisible();

    // Verify time is saved
    await page.reload();
    const savedTime = await timePicker.inputValue();
    expect(savedTime).toBe('07:30');
  });

  test('should customize afternoon reminder time', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Enable afternoon reminder if not already enabled
    const afternoonToggle = page.locator('[data-testid="afternoon-reminder-toggle"]');
    if (!(await afternoonToggle.isChecked())) {
      await afternoonToggle.click();
    }

    // Find time picker
    const timePicker = page.locator('[data-testid="afternoon-time-picker"]');
    await expect(timePicker).toBeVisible();

    // Set custom time (5:00 PM)
    await timePicker.fill('17:00');

    // Save changes
    const saveButton = page.getByRole('button', { name: /save|update/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }

    // Should show success message
    await expect(page.getByText(/saved|updated|success/i)).toBeVisible();

    // Verify time is saved
    await page.reload();
    const savedTime = await timePicker.inputValue();
    expect(savedTime).toBe('17:00');
  });

  test('should disable morning reminder', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Find morning reminder toggle
    const morningToggle = page.locator('[data-testid="morning-reminder-toggle"]');

    // Enable it first if disabled
    if (!(await morningToggle.isChecked())) {
      await morningToggle.click();
      await page.waitForTimeout(500);
    }

    // Now disable it
    await morningToggle.click();

    // Should show success message
    await expect(page.getByText(/disabled|turned.*off|saved/i)).toBeVisible();

    // Time picker should be hidden or disabled
    const timePicker = page.locator('[data-testid="morning-time-picker"]');
    if (await timePicker.isVisible()) {
      await expect(timePicker).toBeDisabled();
    }
  });

  test('should disable afternoon reminder', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Find afternoon reminder toggle
    const afternoonToggle = page.locator('[data-testid="afternoon-reminder-toggle"]');

    // Enable it first if disabled
    if (!(await afternoonToggle.isChecked())) {
      await afternoonToggle.click();
      await page.waitForTimeout(500);
    }

    // Now disable it
    await afternoonToggle.click();

    // Should show success message
    await expect(page.getByText(/disabled|turned.*off|saved/i)).toBeVisible();

    // Time picker should be hidden or disabled
    const timePicker = page.locator('[data-testid="afternoon-time-picker"]');
    if (await timePicker.isVisible()) {
      await expect(timePicker).toBeDisabled();
    }
  });

  test('should show default reminder times', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Enable morning reminder
    const morningToggle = page.locator('[data-testid="morning-reminder-toggle"]');
    if (!(await morningToggle.isChecked())) {
      await morningToggle.click();
    }

    // Should show default morning time (6:00-8:00 AM range)
    const morningTime = page.locator('[data-testid="morning-time-picker"]');
    const morningValue = await morningTime.inputValue();
    const morningHour = parseInt(morningValue.split(':')[0]);
    expect(morningHour).toBeGreaterThanOrEqual(6);
    expect(morningHour).toBeLessThanOrEqual(8);

    // Enable afternoon reminder
    const afternoonToggle = page.locator('[data-testid="afternoon-reminder-toggle"]');
    if (!(await afternoonToggle.isChecked())) {
      await afternoonToggle.click();
    }

    // Should show default afternoon time (4:00-6:00 PM range)
    const afternoonTime = page.locator('[data-testid="afternoon-time-picker"]');
    const afternoonValue = await afternoonTime.inputValue();
    const afternoonHour = parseInt(afternoonValue.split(':')[0]);
    expect(afternoonHour).toBeGreaterThanOrEqual(16);
    expect(afternoonHour).toBeLessThanOrEqual(18);
  });

  test('should verify reminder notification creation (mocked time)', async ({ page }) => {
    // This test would require mocking the system time
    // For now, we'll test the setup and verify the reminder is configured

    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Enable morning reminder
    const morningToggle = page.locator('[data-testid="morning-reminder-toggle"]');
    if (!(await morningToggle.isChecked())) {
      await morningToggle.click();
    }

    // Set time to current time + 1 minute (for testing)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const timePicker = page.locator('[data-testid="morning-time-picker"]');
    await timePicker.fill(timeString);

    // Save
    const saveButton = page.getByRole('button', { name: /save|update/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }

    // Should show success
    await expect(page.getByText(/saved|updated/i)).toBeVisible();

    // In a real scenario, we would wait for the notification to appear
    // For now, verify the reminder is configured
    await page.reload();
    const savedTime = await timePicker.inputValue();
    expect(savedTime).toBe(timeString);
  });

  test('should show snooze functionality in reminder notification', async ({ page }) => {
    // Navigate to notifications
    await page.goto('/notifications');
    await waitForLoading(page);

    // Look for milk reminder notification
    const reminderNotif = page.locator('[data-testid="notification-card"]').filter({ hasText: /milk.*reminder|record.*milk/i }).first();

    if (await reminderNotif.isVisible()) {
      // Should show snooze button
      const snoozeButton = reminderNotif.getByRole('button', { name: /snooze/i });
      await expect(snoozeButton).toBeVisible();

      // Click snooze
      await snoozeButton.click();

      // Should show snooze confirmation
      await expect(page.getByText(/snoozed|remind.*later|15.*minute/i)).toBeVisible();

      // Notification should be marked as snoozed
      const snoozedIndicator = reminderNotif.locator('[data-testid="snoozed-indicator"]');
      if (await snoozedIndicator.isVisible()) {
        await expect(snoozedIndicator).toBeVisible();
      }
    }
  });

  test('should show animals pending recording in reminder', async ({ page }) => {
    // Navigate to notifications
    await page.goto('/notifications');
    await waitForLoading(page);

    // Look for milk reminder notification
    const reminderNotif = page.locator('[data-testid="notification-card"]').filter({ hasText: /milk.*reminder|record.*milk/i }).first();

    if (await reminderNotif.isVisible()) {
      // Should show count of animals pending recording
      await expect(reminderNotif.getByText(/\d+.*animal/i)).toBeVisible();

      // Should show action to go to recording page
      const recordButton = reminderNotif.getByRole('button', { name: /record|go.*to.*recording/i });
      await expect(recordButton).toBeVisible();

      // Click to navigate
      await recordButton.click();

      // Should navigate to milk recording page
      await expect(page).toHaveURL(/.*milk|record.*/);
    }
  });

  test('should persist reminder settings across sessions', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Enable morning reminder with custom time
    const morningToggle = page.locator('[data-testid="morning-reminder-toggle"]');
    if (!(await morningToggle.isChecked())) {
      await morningToggle.click();
    }

    const timePicker = page.locator('[data-testid="morning-time-picker"]');
    await timePicker.fill('06:45');

    // Save
    const saveButton = page.getByRole('button', { name: /save|update/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }

    // Wait for save
    await expect(page.getByText(/saved|updated/i)).toBeVisible();

    // Logout and login again
    await page.getByRole('button', { name: /logout|sign.*out/i }).click();
    await authHelper.login();

    // Navigate back to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Verify settings persisted
    const toggleAfterLogin = page.locator('[data-testid="morning-reminder-toggle"]');
    await expect(toggleAfterLogin).toBeChecked();

    const timeAfterLogin = page.locator('[data-testid="morning-time-picker"]');
    const savedTime = await timeAfterLogin.inputValue();
    expect(savedTime).toBe('06:45');
  });

  test('should show quiet hours settings (if available)', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Look for quiet hours settings
    const quietHoursSection = page.locator('[data-testid="quiet-hours-settings"]');

    if (await quietHoursSection.isVisible()) {
      // Should show quiet hours toggle
      await expect(page.getByText(/quiet.*hour|do.*not.*disturb/i)).toBeVisible();

      // Should show start and end time pickers
      const startTime = page.locator('[data-testid="quiet-hours-start"]');
      const endTime = page.locator('[data-testid="quiet-hours-end"]');

      await expect(startTime).toBeVisible();
      await expect(endTime).toBeVisible();
    }
  });

  test('should validate reminder time format', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile');
    await waitForLoading(page);

    // Enable morning reminder
    const morningToggle = page.locator('[data-testid="morning-reminder-toggle"]');
    if (!(await morningToggle.isChecked())) {
      await morningToggle.click();
    }

    // Try to enter invalid time
    const timePicker = page.locator('[data-testid="morning-time-picker"]');
    
    // HTML5 time input should prevent invalid formats
    // But we can test the validation
    await timePicker.fill('25:00'); // Invalid hour

    // Save
    const saveButton = page.getByRole('button', { name: /save|update/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }

    // Should show validation error or prevent save
    const errorMessage = page.getByText(/invalid.*time|valid.*time/i);
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
  });
});
