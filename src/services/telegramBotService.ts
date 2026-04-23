// src/services/telegramBotService.ts
// Telegram Bot for Health Records - Free alternative to SMS

import { Telegraf, Context } from 'telegraf';
import { createHealthRecord, getHealthRecordsByAnimal, getRecentVaccinations } from './healthRecordService';
import { supabase } from '@/integrations/supabase/client';

// Bot token should be in environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

// Store user sessions
const userSessions = new Map<number, {
  step: string;
  data: Record<string, any>;
}>();

// Initialize bot
let bot: Telegraf | null = null;

export function initTelegramBot() {
  if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.warn('Telegram bot token not configured. Skipping bot initialization.');
    return null;
  }

  try {
    bot = new Telegraf(BOT_TOKEN);
    setupBotCommands();
    bot.launch();
    console.log('✅ Telegram Bot started successfully!');
    return bot;
  } catch (error) {
    console.error('Failed to start Telegram Bot:', error);
    return null;
  }
}

function setupBotCommands() {
  if (!bot) return;

  // Start command
  bot.command('start', async (ctx) => {
    const message = `🐄 Welcome to Ethio Herd Health Bot!

I help you track your livestock health via Telegram.

📋 Available Commands:
/vacc [animal_id] [vaccine] [date] - Record vaccination
/ill [animal_id] [symptoms] - Report illness
/check [animal_id] [notes] - Add checkup
/status [animal_id] - View health summary
/help - Show all commands

💡 Example:
/vacc COW001 ANTHRAX 2025-02-07

📱 You can also use our mobile app for full features!`;

    await ctx.reply(message);
  });

  // Help command
  bot.command('help', async (ctx) => {
    const helpText = `📖 *Ethio Herd Bot Commands*

📝 *Record Commands:*
/vacc [animal_id] [vaccine_name] [YYYY-MM-DD]
  → Record vaccination
  Example: /vacc COW001 ANTHRAX 2025-02-07

/ill [animal_id] [symptoms description]
  → Report illness
  Example: /ill COW001 High fever and not eating

/check [animal_id] [notes]
  → Add checkup record
  Example: /check COW001 Routine monthly check

📊 *View Commands:*
/status [animal_id]
  → View health summary
  Example: /status COW001

/history [animal_id]
  → View all health records
  Example: /history COW001

/vaccinations [animal_id]
  → View vaccination history
  Example: /vaccinations COW001

💬 Need help? Contact support@ethioherd.com`;

    await ctx.reply(helpText, { parse_mode: 'Markdown' });
  });

  // Vaccination command
  bot.command('vacc', handleVaccination);
  bot.command('vaccination', handleVaccination);

  // Illness command
  bot.command('ill', handleIllness);
  bot.command('illness', handleIllness);

  // Checkup command
  bot.command('check', handleCheckup);
  bot.command('checkup', handleCheckup);

  // Status command
  bot.command('status', handleStatus);

  // History command
  bot.command('history', handleHistory);

  // Vaccinations command
  bot.command('vaccinations', handleVaccinations);

  // Handle text messages
  bot.on('text', async (ctx) => {
    await ctx.reply('❓ I didn\'t understand that command.\n\nType /help to see available commands.');
  });

  // Error handling
  bot.catch((err, ctx) => {
    console.error('Telegram bot error:', err);
    ctx.reply('⚠️ An error occurred. Please try again later.');
  });
}

// Handle vaccination recording
async function handleVaccination(ctx: Context) {
  const message = ctx.message;
  if (!message || !('text' in message)) return;

  const parts = message.text.split(' ');
  if (parts.length < 4) {
    await ctx.reply('❌ Usage: /vacc [animal_id] [vaccine_name] [YYYY-MM-DD]\n\nExample: /vacc COW001 ANTHRAX 2025-02-07');
    return;
  }

  const [, animalId, vaccine, date] = parts;

  try {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      await ctx.reply('❌ Invalid date format. Please use: YYYY-MM-DD\n\nExample: 2025-02-07');
      return;
    }

    // Create health record
    const record = await createHealthRecord({
      animal_id: animalId.toUpperCase(),
      record_type: 'vaccination',
      medicine_name: vaccine.toUpperCase(),
      administered_date: date,
      notes: `Recorded via Telegram by user ${ctx.from?.id}`
    });

    // Calculate next vaccination date (6 months later)
    const nextDate = new Date(date);
    nextDate.setMonth(nextDate.getMonth() + 6);

    const response = `✅ *Vaccination Recorded!*

🐄 Animal: ${animalId.toUpperCase()}
💉 Vaccine: ${vaccine.toUpperCase()}
📅 Date: ${date}
📋 Record ID: ${record.id.slice(0, 8)}...

⏰ *Next vaccination due:* ${nextDate.toISOString().split('T')[0]}

📱 View full details in the app!`;

    await ctx.reply(response, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error recording vaccination:', error);
    await ctx.reply('❌ Failed to record vaccination. Please try again or use the mobile app.');
  }
}

// Handle illness reporting
async function handleIllness(ctx: Context) {
  const message = ctx.message;
  if (!message || !('text' in message)) return;

  const parts = message.text.split(' ');
  if (parts.length < 3) {
    await ctx.reply('❌ Usage: /ill [animal_id] [symptoms]\n\nExample: /ill COW001 High fever and not eating');
    return;
  }

  const [, animalId, ...symptomsParts] = parts;
  const symptoms = symptomsParts.join(' ');

  try {
    const record = await createHealthRecord({
      animal_id: animalId.toUpperCase(),
      record_type: 'illness',
      symptoms: symptoms,
      severity: 'moderate', // Default severity
      administered_date: new Date().toISOString().split('T')[0],
      notes: `Recorded via Telegram by user ${ctx.from?.id}`
    });

    const response = `⚠️ *Illness Reported!*

🐄 Animal: ${animalId.toUpperCase()}
🤒 Symptoms: ${symptoms}
📅 Date: ${new Date().toISOString().split('T')[0]}
📋 Record ID: ${record.id.slice(0, 8)}...

💡 *Recommendation:* Monitor closely and consult a vet if symptoms persist.

📸 Take a photo and use our AI diagnosis feature in the app!`;

    await ctx.reply(response, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error reporting illness:', error);
    await ctx.reply('❌ Failed to report illness. Please try again or use the mobile app.');
  }
}

// Handle checkup recording
async function handleCheckup(ctx: Context) {
  const message = ctx.message;
  if (!message || !('text' in message)) return;

  const parts = message.text.split(' ');
  if (parts.length < 3) {
    await ctx.reply('❌ Usage: /check [animal_id] [notes]\n\nExample: /check COW001 Routine monthly check');
    return;
  }

  const [, animalId, ...notesParts] = parts;
  const notes = notesParts.join(' ');

  try {
    const record = await createHealthRecord({
      animal_id: animalId.toUpperCase(),
      record_type: 'checkup',
      administered_date: new Date().toISOString().split('T')[0],
      notes: notes
    });

    const response = `✅ *Checkup Recorded!*

🐄 Animal: ${animalId.toUpperCase()}
📝 Notes: ${notes}
📅 Date: ${new Date().toISOString().split('T')[0]}
📋 Record ID: ${record.id.slice(0, 8)}...

👍 Keep up the good work with regular checkups!`;

    await ctx.reply(response, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error recording checkup:', error);
    await ctx.reply('❌ Failed to record checkup. Please try again or use the mobile app.');
  }
}

// Handle status request
async function handleStatus(ctx: Context) {
  const message = ctx.message;
  if (!message || !('text' in message)) return;

  const parts = message.text.split(' ');
  if (parts.length < 2) {
    await ctx.reply('❌ Usage: /status [animal_id]\n\nExample: /status COW001');
    return;
  }

  const animalId = parts[1].toUpperCase();

  try {
    const records = await getHealthRecordsByAnimal(animalId);
    const vaccinations = await getRecentVaccinations(animalId, 3);

    if (records.length === 0) {
      await ctx.reply(`📋 *Health Status: ${animalId}*

No health records found.

Use /vacc, /ill, or /check to add records.`);
      return;
    }

    const totalRecords = records.length;
    const vac
