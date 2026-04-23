/**
 * @fileoverview Health Records Notifications Layer Exports
 */

// Push notifications
export {
  requestNotificationPermission,
  hasNotificationPermission,
  sendPushNotification,
  sendVaccinationReminderNotification,
  sendTestNotification,
  type NotificationPermission
} from './push';

// Telegram
export {
  isTelegramConfigured,
  sendTelegramMessage,
  sendTelegramVaccinationReminder,
  sendTelegramHealthCertificate,
  type TelegramMessage,
  type TelegramSendResult
} from './telegram';