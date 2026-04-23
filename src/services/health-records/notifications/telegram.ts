/**
 * @fileoverview Telegram Notification Service
 * HTTP-based Telegram bot integration
 */

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const API_BASE = 'https://api.telegram.org/bot';

export interface TelegramMessage {
  chatId: string;
  text: string;
  parseMode?: 'Markdown' | 'HTML';
}

export interface TelegramSendResult {
  success: boolean;
  error?: string;
}

/**
 * Checks if Telegram bot is configured
 * @returns {boolean} True if bot token is set
 */
export const isTelegramConfigured = (): boolean => !!BOT_TOKEN;

/**
 * Sends a message via Telegram Bot API
 * @param message - Message to send
 * @returns {Promise<TelegramSendResult>} Send result
 */
export const sendTelegramMessage = async (
  message: TelegramMessage
): Promise<TelegramSendResult> => {
  if (!BOT_TOKEN) {
    return { success: false, error: 'Telegram bot token not configured' };
  }
  
  try {
    const response = await fetch(`${API_BASE}${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chatId,
        text: message.text,
        parse_mode: message.parseMode || 'Markdown'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { 
        success: false, 
        error: error.description || `HTTP ${response.status}` 
      };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
};

/**
 * Sends vaccination reminder via Telegram
 * @param chatId - Telegram chat ID
 * @param animalName - Animal name
 * @param vaccineName - Vaccine name
 * @param daysUntil - Days until due
 * @param nextDueDate - Next due date
 * @returns {Promise<TelegramSendResult>} Send result
 */
export const sendTelegramVaccinationReminder = async (
  chatId: string,
  animalName: string,
  vaccineName: string,
  daysUntil: number,
  nextDueDate: string
): Promise<TelegramSendResult> => {
  let message: string;
  
  if (daysUntil === 0) {
    message = `🔔 *Vaccination Due Today!*\n\n`;
    message += `🐄 *${animalName}* needs *${vaccineName}* vaccination today.`;
  } else if (daysUntil < 0) {
    message = `⚠️ *Vaccination Overdue!*\n\n`;
    message += `🐄 *${animalName}* *${vaccineName}* is ${Math.abs(daysUntil)} days overdue.`;
  } else {
    message = `🔔 *Vaccination Reminder*\n\n`;
    message += `🐄 *${animalName}* needs *${vaccineName}* in ${daysUntil} days.\n`;
    message += `📅 Due date: ${nextDueDate}`;
  }
  
  return sendTelegramMessage({ chatId, text: message, parseMode: 'Markdown' });
};

/**
 * Sends health certificate via Telegram
 * @param chatId - Telegram chat ID
 * @param animalId - Animal ID
 * @param records - Health records
 * @returns {Promise<TelegramSendResult>} Send result
 */
export const sendTelegramHealthCertificate = async (
  chatId: string,
  animalId: string,
  records: { record_type: string; medicine_name: string | null; administered_date: string }[]
): Promise<TelegramSendResult> => {
  const vaccinations = records.filter(r => r.record_type === 'vaccination');
  const illnesses = records.filter(r => r.record_type === 'illness');
  
  let message = `📋 *Health Certificate - ${animalId}*\n\n`;
  
  message += `💉 *Vaccinations (${vaccinations.length}):*\n`;
  if (vaccinations.length > 0) {
    vaccinations.slice(0, 5).forEach(v => {
      message += `✅ ${v.medicine_name || 'Unknown'} - ${v.administered_date}\n`;
    });
  } else {
    message += `❌ No vaccinations recorded\n`;
  }
  
  message += `\n🤒 *Illnesses (${illnesses.length}):*\n`;
  if (illnesses.length > 0) {
    message += `⚠️ ${illnesses.length} illness(es) recorded\n`;
  } else {
    message += `✅ No illnesses recorded\n`;
  }
  
  message += `\n📱 View full details in the Ethio Herd app!`;
  
  return sendTelegramMessage({ chatId, text: message, parseMode: 'Markdown' });
};