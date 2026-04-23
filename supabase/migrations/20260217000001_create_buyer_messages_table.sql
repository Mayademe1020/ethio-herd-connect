-- Migration: Create buyer_messages table for ContactSeller feature
-- Date: 2026-02-17

CREATE TABLE IF NOT EXISTS buyer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES market_listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  sender_name TEXT,
  sender_email TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_buyer_messages_listing_id ON buyer_messages(listing_id);
CREATE INDEX idx_buyer_messages_buyer_id ON buyer_messages(buyer_id);
CREATE INDEX idx_buyer_messages_seller_id ON buyer_messages(seller_id);
CREATE INDEX idx_buyer_messages_created_at ON buyer_messages(created_at DESC);

-- Enable RLS
ALTER TABLE buyer_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Buyers can view their own messages"
  ON buyer_messages FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Sellers can view messages for their listings"
  ON buyer_messages FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Anyone can create messages"
  ON buyer_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Sellers can update read status"
  ON buyer_messages FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_buyer_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_buyer_messages_updated_at
  BEFORE UPDATE ON buyer_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_buyer_messages_updated_at();
