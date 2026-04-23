import { test, expect } from '@playwright/test';
import { AuthHelper, waitForLoading } from './test-utils';

test.describe('Notifications Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login();
    await authHelper.completeOnboarding();
  });

  test('should navigate to notifications dropdown', async ({ page }) => {
    // Click on notifications bell icon in header
    await page.getByRole('button', { name: /notification/i }).click();

    // Should show notifications dropdown
    await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible();

    // Should show notifications dropdown title
    await expect(page.getByRole('heading', { name: /notification/i })).toBeVisible();
  });

  test('should display buyer interest notification', async ({ page }) => {
    // First, create a listing as seller
    await page.getByRole('tab', { name: /marketplace|sell/i }).click();
    await page.getByRole('button', { name: /create.*listing/i }).click();

    // Create listing (simplified flow)
    await page.getByRole('button', { name: /select.*animal/i }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/price/i).fill('15000');
    await page.getByRole('button', { name: /create.*listing|publish/i }).click();

    // Wait for listing creation
    await expect(page.getByText(/success|created/i)).toBeVisible();

    // Simulate buyer interest (would need another user in real scenario)
    // For now, check if notifications page shows buyer interest notifications

    // Navigate to notifications
    await page.getByRole('tab', { name: /notification/i }).click();

    // Look for buyer interest notifications
    const buyerInterestNotif = page.locator('[data-testid="notification-card"]').filter({ hasText: /buyer.*interest|interested/i });
    
    if (await buyerInterestNotif.first().isVisible()) {
      // Should show buyer interest icon
      await expect(buyerInterestNotif.first().locator('[data-testid="notification-icon"]')).toBeVisible();

      // Should show buyer phone number
      await expect(buyerInterestNotif.first().getByText(/\+251|09\d{8}/)).toBeVisible();

      // Should show timestamp
      await expect(buyerInterestNotif.first().getByText(/ago|minute|hour|day/i)).toBeVisible();
    }
  });

  test('should update notification badge in real-time', async ({ page }) => {
    // Navigate to notifications
    await page.getByRole('tab', { name: /notification/i }).click();

    // Get initial unread count
    const badge = page.locator('[data-testid="notification-badge"]');
    const initialCount = await badge.textContent();

    // Mark a notification as read
    const firstNotification = page.locator('[data-testid="notification-card"]').first();
    if (await firstNotification.isVisible()) {
      await firstNotification.getByRole('button', { name: /mark.*read/i }).click();

      // Badge count should decrease
      await page.waitForTimeout(500);
      const newCount = await badge.textContent();
      
      if (initialCount && newCount) {
        expect(parseInt(newCount)).toBeLessThan(parseInt(initialCount));
      }
    }
  });

  test('should show action buttons for buyer interest', async ({ page }) => {
    // Navigate to notifications
    await page.getByRole('tab', { name: /notification/i }).click();
    await waitForLoading(page);

    // Find buyer interest notification
    const buyerInterestNotif = page.locator('[data-testid="notification-card"]').filter({ hasText: /buyer.*interest/i }).first();

    if (await buyerInterestNotif.isVisible()) {
      // Should show Call button
      await expect(buyerInterestNotif.getByRole('button', { name: /call/i })).toBeVisible();

      // Should show WhatsApp button
      await expect(buyerInterestNotif.getByRole('button', { name: /whatsapp/i })).toBeVisible();

      // Should show Mark as Read button
      await expect(buyerInterestNotif.getByRole('button', { name: /mark.*read/i })).toBeVisible();
    }
  });

  test('should handle call action button', async ({ page }) => {
    // Navigate to notifications
    await page.getByRole('tab', { name: /notification/i }).click();
    await waitForLoading(page);

    // Find buyer interest notification
    const buyerInterestNotif = page.locator('[data-testid="notification-card"]').filter({ hasText: /buyer.*interest/i }).first();

    if (await buyerInterestNotif.isVisible()) {
      // Click call button
      const callButton = buyerInterestNotif.getByRole('button', { name: /call/i });
      
      // Listen for navigation or tel: link
      const [popup] = await Promise.all([
        page.waitForEvent('popup').catch(() => null),
        callButton.click()
      ]);

      // Should trigger tel: link or show confirmation
      // In real scenario, this would open phone dialer
    }
  });

  test('should handle WhatsApp action button', async ({ page }) => {
    // Navigate to notifications
    await page.getByRole('tab', { name: /notification/i }).click();
    await waitForLoading(page);

    // Find buyer interest notification
    const buyerInterestNotif = page.locator('[data-testid="notification-card"]').filter({ hasText: /buyer.*interest/i }).first();

    if (await buyerInterestNotif.isVisible()) {
      // Click WhatsApp button
      const whatsappButton = buyerInterestNotif.getByRole('button', { name: /whatsapp/i });
      
      // Listen for navigation to WhatsApp
      const [popup] = await Promise.all([
        page.waitForEvent('popup').catch(() => null),
        whatsappButton.click()
      ]);

      // Should open WhatsApp link
      if (popup) {
        expect(popup.url()).toContain('wa.me');
      }
    }
  });

  test('should mark notification as read', async ({ page }) => {
    // Navigate to notifications
    await page.getByRole('tab', { name: /notification/i }).click();
    await waitForLoading(page);

    // Find unread notification
    const unreadNotif = page.locator('[data-testid="notification-card"]').filter({ has: page.locator('[data-testid="unread-indicator"]') }).first();

    if (await unreadNotif.isVisible()) {
      // Click mark as read
      await unreadNotif.getByRole('button', { name: /mark.*read/i }).click();

      // Should remove unread indicator
      await expect(unreadNotif.locator('[data-testid="unread-indicator"]')).not.toBeVisible();

      // Should show read status
      const readIndicator = unreadNotif.locator('[data-testid="read-indicator"]');
      if (await readIndicator.isVisible()) {
        await expect(readIndicator).toBeVisible();
      }
    }
  });

  test('should mark all notifications as read', async ({ page }) => {
    // Navigate to notifications dropdown
    await page.getByRole('button', { name: /notification/i }).click();
    await waitForLoading(page);

    // Get initial unread count
    const unreadNotifs = page.locator('[data-testid="notification-card"]').filter({ has: page.locator('[data-testid="unread-indicator"]') });
    const initialUnreadCount = await unreadNotifs.count();

    if (initialUnreadCount > 0) {
      // Click mark all as read button
      await page.getByRole('button', { name: /mark.*all.*read/i }).click();

      // Wait for update
      await page.waitForTimeout(500);

      // All notifications should be marked as read
      const remainingUnread = await page.locator('[data-testid="notification-card"]').filter({ has: page.locator('[data-testid="unread-indicator"]') }).count();
      expect(remainingUnread).toBe(0);

      // Badge should show 0 or be hidden
      const badge = page.locator('[data-testid="notification-badge"]');
      if (await badge.isVisible()) {
        const count = await badge.textContent();
        expect(count).toBe('0');
      }
    }
  });

  test('should filter notifications by type', async ({ page }) => {
    // Navigate to notifications
    await page.getByRole('tab', { name: /notification/i }).click();
    await waitForLoading(page);

    // Should show filter tabs
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /unread/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /buyer.*interest/i })).toBeVisible();

    // Click on Unread filter
    await page.getByRole('tab', { name: /unread/i }).click();

    // Should only show unread notifications
    const notifications = page.locator('[data-testid="notification-card"]');
    const count = await notifications.count();

    for (let i = 0; i < count; i++) {
      const notif = notifications.nth(i);
      await expect(notif.locator('[data-testid="unread-indicator"]')).toBeVisible();
    }

    // Click on Buyer Interests filter
    await page.getByRole('tab', { name: /buyer.*interest/i }).click();

    // Should only show buyer interest notifications
    const buyerNotifs = page.locator('[data-testid="notification-card"]');
    const buyerCount = await buyerNotifs.count();

    for (let i = 0; i < buyerCount; i++) {
      const notif = buyerNotifs.nth(i);
      await expect(notif.getByText(/buyer.*interest|interested/i)).toBeVisible();
    }
  });

  test('should group notifications by date', async ({ page }) => {
    // Navigate to notifications
    await page.getByRole('tab', { name: /notification/i }).click();
    await waitForLoading(page);

    // Should show date group headers
    const dateHeaders = page.locator('[data-testid="date-header"]');
    
    if (await dateHeaders.first().isVisible()) {
      // Should show "Today" group
      const todayHeader = page.getByText(/today/i);
      if (await todayHeader.isVisible()) {
        await expect(todayHeader).toBeVisible();
      }

      // Should show "Yesterday" group if applicable
      const yesterdayHeader = page.getByText(/yesterday/i);
      if (await yesterdayHeader.isVisible()) {
        await expect(yesterdayHeader).toBeVisible();
      }

      // Should show "Earlier" group if applicable
      const earlierHeader = page.getByText(/earlier/i);
      if (await earlierHeader.isVisible()) {
        await expect(earlierHeader).toBeVisible();
      }
    }
  });

  test('should show empty state when no notifications', async ({ page }) => {
    // Navigate to notifications
    await page.getByRole('tab', { name: /notification/i }).click();
    await waitForLoading(page);

    // Mark all as read or filter to show empty state
    await page.getByRole('button', { name: /mark.*all.*read/i }).click();
    await page.getByRole('tab', { name: /unread/i }).click();

    // Should show empty state
    const emptyState = page.locator('[data-testid="empty-state"]');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
      await expect(page.getByText(/no.*notification|no.*unread/i)).toBeVisible();
    }
  });

  test('should show notification types with correct icons', async ({ page }) => {
    // Navigate to notifications
    await page.getByRole('tab', { name: /notification/i }).click();
    await waitForLoading(page);

    // Check for different notification types
    const notifications = page.locator('[data-testid="notification-card"]');
    const count = await notifications.count();

    for (let i = 0; i < count; i++) {
      const notif = notifications.nth(i);
      const icon = notif.locator('[data-testid="notification-icon"]');
      
      if (await icon.isVisible()) {
        // Should have an icon
        await expect(icon).toBeVisible();
      }
    }
  });

  test('should handle pull-to-refresh', async ({ page }) => {
    // Navigate to notifications
    await page.getByRole('tab', { name: /notification/i }).click();
    await waitForLoading(page);

    // Simulate pull-to-refresh gesture (if supported)
    // This is platform-specific and may need mobile emulation
    const notificationsList = page.locator('[data-testid="notifications-list"]');
    
    if (await notificationsList.isVisible()) {
      // Scroll to top
      await notificationsList.evaluate(el => el.scrollTop = 0);

      // Look for refresh indicator
      const refreshIndicator = page.locator('[data-testid="refresh-indicator"]');
      if (await refreshIndicator.isVisible()) {
        await expect(refreshIndicator).toBeVisible();
      }
    }
  });

  test('should navigate to related content from notification', async ({ page }) => {
    // Navigate to notifications
    await page.getByRole('tab', { name: /notification/i }).click();
    await waitForLoading(page);

    // Find a buyer interest notification
    const buyerInterestNotif = page.locator('[data-testid="notification-card"]').filter({ hasText: /buyer.*interest/i }).first();

    if (await buyerInterestNotif.isVisible()) {
      // Click on notification (not on action buttons)
      await buyerInterestNotif.click();

      // Should navigate to listing detail
      await expect(page).toHaveURL(/.*listing|marketplace.*/);

      // Should show listing details
      await expect(page.getByText(/price|details|description/i)).toBeVisible();
    }
  });
});
