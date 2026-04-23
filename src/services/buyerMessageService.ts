// src/services/buyerMessageService.ts
// Service for handling buyer-seller messaging

import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput } from '@/utils/securityUtils';

export interface SendMessageParams {
  listingId: string;
  sellerId: string;
  message: string;
  senderName?: string;
  senderEmail?: string;
}

export interface BuyerMessage {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  message: string;
  sender_name: string | null;
  sender_email: string | null;
  is_read: boolean;
  created_at: string;
}

const db = supabase as any;

/**
 * Send a message to a seller about a listing
 */
export const sendBuyerMessage = async ({
  listingId,
  sellerId,
  message,
  senderName,
  senderEmail
}: SendMessageParams): Promise<BuyerMessage> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to send messages');
  }

  // Sanitize all user inputs to prevent XSS
  const sanitizedMessage = sanitizeInput(message).substring(0, 1000);
  const sanitizedName = senderName ? sanitizeInput(senderName).substring(0, 100) : null;
  const sanitizedEmail = senderEmail ? sanitizeInput(senderEmail).substring(0, 100) : null;

  const { data, error } = await db
    .from('buyer_messages')
    .insert({
      listing_id: listingId,
      seller_id: sellerId,
      buyer_id: user.id,
      message: sanitizedMessage,
      sender_name: sanitizedName,
      sender_email: sanitizedEmail,
      is_read: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending buyer message:', error);
    throw new Error('Failed to send message. Please try again.');
  }

  return data as BuyerMessage;
};

/**
 * Get messages for the current user (as buyer)
 */
export const getMyMessages = async (): Promise<BuyerMessage[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await db
    .from('buyer_messages')
    .select('*')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching buyer messages:', error);
    return [];
  }

  return (data || []) as BuyerMessage[];
};

/**
 * Get messages received as a seller
 */
export const getReceivedMessages = async (): Promise<BuyerMessage[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await db
    .from('buyer_messages')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching received messages:', error);
    return [];
  }

  return (data || []) as BuyerMessage[];
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { error } = await db
    .from('buyer_messages')
    .update({ is_read: true })
    .eq('id', messageId)
    .eq('seller_id', user.id);

  if (error) {
    console.error('Error marking message as read:', error);
    throw new Error('Failed to mark message as read');
  }
};

/**
 * Delete a message (only by owner)
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { error } = await db
    .from('buyer_messages')
    .delete()
    .eq('id', messageId)
    .eq('buyer_id', user.id);

  if (error) {
    console.error('Error deleting message:', error);
    throw new Error('Failed to delete message');
  }
};

export default {
  sendBuyerMessage,
  getMyMessages,
  getReceivedMessages,
  markMessageAsRead,
  deleteMessage
};
