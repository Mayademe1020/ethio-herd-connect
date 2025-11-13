/**
 * Error Message Translation System
 * Maps technical errors to user-friendly messages in Amharic and English
 */

export interface ErrorMessage {
  amharic: string;
  english: string;
  icon: string;
  action?: {
    label: string;
    labelAmharic: string;
    handler: () => void;
  };
}

export type ErrorType =
  | 'network'
  | 'auth_expired'
  | 'auth_invalid_otp'
  | 'auth_phone_invalid'
  | 'photo_too_large'
  | 'photo_upload_failed'
  | 'video_too_large'
  | 'video_too_long'
  | 'video_upload_failed'
  | 'validation_required'
  | 'validation_invalid'
  | 'database_error'
  | 'sync_failed'
  | 'permission_denied'
  | 'not_found'
  | 'milk_load_failed'
  | 'milk_export_failed'
  | 'unknown';

export const ERROR_MESSAGES: Record<ErrorType, Omit<ErrorMessage, 'action'>> = {
  network: {
    amharic: 'ኢንተርኔት የለም። መረጃው በስልክዎ ተቀምጧል።',
    english: 'No internet. Your data is saved on your phone.',
    icon: '📱',
  },
  auth_expired: {
    amharic: 'ክፍለ ጊዜዎ አልቋል። እባክዎ እንደገና ይግቡ።',
    english: 'Your session expired. Please log in again.',
    icon: '🔐',
  },
  auth_invalid_otp: {
    amharic: 'የተሳሳተ ኮድ። እባክዎ እንደገና ይሞክሩ።',
    english: 'Invalid code. Please try again.',
    icon: '❌',
  },
  auth_phone_invalid: {
    amharic: 'የተሳሳተ ስልክ ቁጥር። እባክዎ ያረጋግጡ።',
    english: 'Invalid phone number. Please check.',
    icon: '📞',
  },
  photo_too_large: {
    amharic: 'ፎቶው በጣም ትልቅ ነው። እባክዎ ሌላ ይምረጡ።',
    english: 'Photo is too large. Please choose another.',
    icon: '📸',
  },
  photo_upload_failed: {
    amharic: 'ፎቶ መስቀል አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
    english: 'Photo upload failed. Please try again.',
    icon: '📸',
  },
  video_too_large: {
    amharic: 'ቪዲዮው በጣም ትልቅ ነው (ከ20MB በላይ)።',
    english: 'Video is too large (max 20MB).',
    icon: '🎥',
  },
  video_too_long: {
    amharic: 'ቪዲዮው በጣም ረጅም ነው (ከ10 ሰከንድ በላይ)።',
    english: 'Video is too long (max 10 seconds).',
    icon: '🎥',
  },
  video_upload_failed: {
    amharic: 'ቪዲዮ መስቀል አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
    english: 'Video upload failed. Please try again.',
    icon: '🎥',
  },
  validation_required: {
    amharic: 'እባክዎ ሁሉንም አስፈላጊ መረጃዎች ያስገቡ።',
    english: 'Please fill in all required fields.',
    icon: '⚠️',
  },
  validation_invalid: {
    amharic: 'የተሳሳተ መረጃ። እባክዎ ያረጋግጡ።',
    english: 'Invalid input. Please check.',
    icon: '⚠️',
  },
  database_error: {
    amharic: 'ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።',
    english: 'An error occurred. Please try again.',
    icon: '❌',
  },
  sync_failed: {
    amharic: 'ማመሳሰል አልተሳካም። እንደገና እየሞከረ ነው።',
    english: 'Sync failed. Retrying automatically.',
    icon: '🔄',
  },
  permission_denied: {
    amharic: 'ፈቃድ የለዎትም። እባክዎ ይግቡ።',
    english: 'Permission denied. Please log in.',
    icon: '🚫',
  },
  not_found: {
    amharic: 'መረጃው አልተገኘም።',
    english: 'Data not found.',
    icon: '🔍',
  },
  milk_load_failed: {
    amharic: 'የወተት መረጃ መጫን አልተሳካም። እባክዎ ግንኙነትዎን ያረጋግጡ።',
    english: 'Failed to load milk data. Please check your connection.',
    icon: '🥛',
  },
  milk_export_failed: {
    amharic: 'ወደ CSV መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
    english: 'Failed to export to CSV. Please try again.',
    icon: '📄',
  },
  unknown: {
    amharic: 'ያልተጠበቀ ስህተት። እባክዎ እንደገና ይሞክሩ።',
    english: 'Unexpected error. Please try again.',
    icon: '❌',
  },
};

/**
 * Maps technical error codes/messages to user-friendly error types
 */
export function mapTechnicalError(error: any): ErrorType {
  // Network errors
  if (!navigator.onLine || error?.message?.includes('network') || error?.message?.includes('fetch')) {
    return 'network';
  }

  // Supabase auth errors
  if (error?.message?.includes('JWT') || error?.message?.includes('token') || error?.status === 401) {
    return 'auth_expired';
  }

  if (error?.message?.includes('Invalid login credentials') || error?.message?.includes('OTP')) {
    return 'auth_invalid_otp';
  }

  // Supabase RLS errors
  if (error?.code === 'PGRST301' || error?.message?.includes('permission') || error?.status === 403) {
    return 'permission_denied';
  }

  // Not found errors
  if (error?.status === 404 || error?.code === 'PGRST116') {
    return 'not_found';
  }

  // Database errors
  if (error?.code?.startsWith('PGRST') || error?.code?.startsWith('23')) {
    return 'database_error';
  }

  // File upload errors
  if (error?.message?.includes('file') || error?.message?.includes('upload')) {
    if (error?.message?.includes('size') || error?.message?.includes('large')) {
      return 'photo_too_large';
    }
    return 'photo_upload_failed';
  }

  // Validation errors
  if (error?.message?.includes('required') || error?.message?.includes('missing')) {
    return 'validation_required';
  }

  if (error?.message?.includes('invalid') || error?.message?.includes('format')) {
    return 'validation_invalid';
  }

  return 'unknown';
}

/**
 * Gets user-friendly error message for display
 */
export function getUserFriendlyError(error: any, language: 'amharic' | 'english' = 'amharic'): {
  message: string;
  icon: string;
  type: ErrorType;
} {
  const errorType = mapTechnicalError(error);
  const errorMessage = ERROR_MESSAGES[errorType];

  return {
    message: language === 'amharic' ? errorMessage.amharic : errorMessage.english,
    icon: errorMessage.icon,
    type: errorType,
  };
}

/**
 * Success messages for user actions
 */
export const SUCCESS_MESSAGES = {
  animal_registered: {
    amharic: 'እንስሳው በተሳካ ሁኔታ ተመዝግቧል!',
    english: 'Animal registered successfully!',
    icon: '✅',
  },
  milk_recorded: {
    amharic: 'ወተት በተሳካ ሁኔታ ተመዝግቧል!',
    english: 'Milk recorded successfully!',
    icon: '🥛',
  },
  listing_created: {
    amharic: 'ማስታወቂያው በተሳካ ሁኔታ ተፈጥሯል!',
    english: 'Listing created successfully!',
    icon: '🛒',
  },
  interest_sent: {
    amharic: 'ፍላጎትዎ ተልኳል!',
    english: 'Interest sent successfully!',
    icon: '📧',
  },
  animal_deleted: {
    amharic: 'እንስሳው ተሰርዟል።',
    english: 'Animal deleted.',
    icon: '🗑️',
  },
  listing_sold: {
    amharic: 'ማስታወቂያው እንደተሸጠ ተመልክቷል!',
    english: 'Listing marked as sold!',
    icon: '💰',
  },
  synced: {
    amharic: 'ሁሉም መረጃዎች ተመሳስለዋል!',
    english: 'All data synced!',
    icon: '✓',
  },
  logout: {
    amharic: 'በተሳካ ሁኔታ ወጥተዋል።',
    english: 'Logged out successfully.',
    icon: '👋',
  },
  milk_exported: {
    amharic: 'የወተት መዝገብ በተሳካ ሁኔታ ወደ CSV ተልኳል!',
    english: 'Milk records exported to CSV successfully!',
    icon: '📄',
  },
  milk_updated: {
    amharic: 'የወተት መዝገብ በተሳካ ሁኔታ ተዘምኗል!',
    english: 'Milk record updated successfully!',
    icon: '✓',
  },
} as const;

export type SuccessMessageType = keyof typeof SUCCESS_MESSAGES;

export function getSuccessMessage(type: SuccessMessageType, language: 'amharic' | 'english' = 'amharic'): {
  message: string;
  icon: string;
} {
  const successMessage = SUCCESS_MESSAGES[type];
  return {
    message: language === 'amharic' ? successMessage.amharic : successMessage.english,
    icon: successMessage.icon,
  };
}
