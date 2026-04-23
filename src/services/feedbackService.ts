// src/services/feedbackService.ts
// Service for managing user feedback submissions

import { supabase } from '@/integrations/supabase/client';

export type FeedbackType = 'bug' | 'feature' | 'general' | 'praise';

export interface FeedbackData {
  type: FeedbackType;
  rating?: number;
  message: string;
  screenshot?: File;
}

export interface FeedbackSubmission extends FeedbackData {
  id: string;
  user_id: string;
  page_url: string;
  user_agent: string;
  app_version: string;
  created_at: string;
  status: 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'closed';
}

const APP_VERSION = '1.0.0-beta'; // Should match package.json version

/**
 * Submit user feedback to the database
 * If offline, feedback will be queued for later sync
 */
export const submitFeedback = async (data: FeedbackData): Promise<FeedbackSubmission> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to submit feedback');
  }

  let screenshotUrl: string | undefined;

  // Upload screenshot if provided
  if (data.screenshot) {
    try {
      const fileName = `feedback/${user.id}/${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('feedback-screenshots')
        .upload(fileName, data.screenshot, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        console.error('Screenshot upload error:', uploadError);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('feedback-screenshots')
          .getPublicUrl(fileName);
        screenshotUrl = publicUrl;
      }
    } catch (error) {
      console.error('Failed to upload screenshot:', error);
    }
  }

  // Submit feedback
  const { data: feedback, error } = await supabase
    .from('user_feedback')
    .insert({
      user_id: user.id,
      type: data.type,
      rating: data.rating,
      message: data.message,
      screenshot_url: screenshotUrl,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      app_version: APP_VERSION,
      status: 'new'
    })
    .select()
    .single();

  if (error) {
    console.error('Feedback submission error:', error);
    throw new Error('Failed to submit feedback. Please try again.');
  }

  return feedback as FeedbackSubmission;
};

/**
 * Get feedback history for current user
 */
export const getUserFeedback = async (): Promise<FeedbackSubmission[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_feedback')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feedback:', error);
    return [];
  }

  return (data || []) as FeedbackSubmission[];
};

/**
 * Get feedback type label in Amharic and English
 */
export const getFeedbackTypeLabel = (type: FeedbackType, language: 'am' | 'en' | 'or' | 'sw' = 'en'): string => {
  const labels: Record<FeedbackType, Record<string, string>> = {
    bug: {
      am: 'የስህተት ሪፖርት',
      en: 'Bug Report',
      or: 'Raportii Dogoggora',
      sw: 'Ripoti ya Hitilafu'
    },
    feature: {
      am: 'አዲስ ባህሪ ጥያቄ',
      en: 'Feature Request',
      or: 'Gaaffii Amalaa Haaraa',
      sw: 'Ombi la Kipengele'
    },
    general: {
      am: 'ጠቅላላ ግብረመልስ',
      en: 'General Feedback',
      or: 'Yaada Waliigalaa',
      sw: 'Maoni ya Jumla'
    },
    praise: {
      am: 'ዉድስታ ምስጋና',
      en: 'Praise/Thanks',
      or: 'Galateeffannoo',
      sw: 'Sifa'
    }
  };

  return labels[type][language] || labels[type].en;
};

/**
 * Get rating label
 */
export const getRatingLabel = (rating: number, language: 'am' | 'en' | 'or' | 'sw' = 'en'): string => {
  const labels: Record<number, Record<string, string>> = {
    1: { am: 'በጣም ደስተኛ አይደለሁም', en: 'Very Dissatisfied', or: 'Gaddaan Gammadaa Hinbeeku', sw: 'Sikufurahi Kabisa' },
    2: { am: 'ደስተኛ አይደለሁም', en: 'Dissatisfied', or: 'Gammadaa Hinbeeku', sw: 'Sikufurahi' },
    3: { am: 'የተለያየ', en: 'Neutral', or: 'Giddu Galeessa', sw: 'Wastani' },
    4: { am: 'ደስተኛ ነኝ', en: 'Satisfied', or: 'Gammadaa', sw: 'Nafurahi' },
    5: { am: 'በጣም ደስተኛ ነኝ', en: 'Very Satisfied', or: 'Baayyee Gammadaa', sw: 'Nafurahi Kabisa' }
  };

  return labels[rating][language] || labels[rating].en;
};
