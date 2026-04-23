// src/utils/notificationThrottle.ts

// Utility to throttle notifications to prevent spam
// Reduces the number of toast notifications shown to users

const THROTTLE_TIME = 2000; // 2 seconds between same-type notifications
const NOTIFICATION_CACHE = new Map<string, { timestamp: number; count: number }>();

/**
 * Check if a notification should be shown based on throttling
 * Returns true if notification should be shown, false if throttled
 */
export function shouldShowNotification(
  type: string,
  key?: string,
  throttleTime: number = THROTTLE_TIME
): boolean {
  const cacheKey = key ? `${type}:${key}` : type;
  const now = Date.now();
  const cached = NOTIFICATION_CACHE.get(cacheKey);

  // If no cache or cache expired, allow notification
  if (!cached || now - cached.timestamp > throttleTime) {
    NOTIFICATION_CACHE.set(cacheKey, { timestamp: now, count: 1 });
    return true;
  }

  // Cache exists and is within throttle time, increment count
  cached.count++;
  return false;
}

/**
 * Get throttled notification summary
 */
export function getThrottledSummary(): { [key: string]: number } {
  const summary: { [key: string]: number } = {};
  NOTIFICATION_CACHE.forEach((value, key) => {
    const [type] = key.split(':');
    summary[type] = (summary[type] || 0) + value.count;
  });
  return summary;
}

/**
 * Clear throttled notifications for a specific type
 */
export function clearThrottledNotifications(type?: string): void {
  if (type) {
    NOTIFICATION_CACHE.forEach((_, key) => {
      if (key.startsWith(type)) {
        NOTIFICATION_CACHE.delete(key);
      }
    });
  } else {
    NOTIFICATION_CACHE.clear();
  }
}

/**
 * Should show critical notification (always shows)
 */
export function shouldShowCritical(type: string, key?: string): boolean {
  // Critical notifications bypass throttling
  return true;
}

// Export as default
export default {
  shouldShowNotification,
  shouldShowCritical,
  getThrottledSummary,
  clearThrottledNotifications,
};
