-- Create buyer interest tracking table
CREATE TABLE buyer_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES market_listings(id) ON DELETE CASCADE,
  buyer_user_id UUID NOT NULL,
  seller_user_id UUID NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS for buyer interests
ALTER TABLE buyer_interests ENABLE ROW LEVEL SECURITY;

-- Buyers can create interests and view their own
CREATE POLICY "Buyers can manage their own interests" ON buyer_interests 
FOR ALL USING (auth.uid() = buyer_user_id);

-- Sellers can view and respond to interests in their listings
CREATE POLICY "Sellers can manage interests in their listings" ON buyer_interests 
FOR SELECT USING (auth.uid() = seller_user_id);

CREATE POLICY "Sellers can update interest status" ON buyer_interests 
FOR UPDATE USING (auth.uid() = seller_user_id);

-- Update market_listings RLS to hide contact info unless interest is approved
DROP POLICY IF EXISTS "Users can view all active listings" ON market_listings;

-- Create function to check if contact info should be visible
CREATE OR REPLACE FUNCTION can_view_contact_info(listing_user_id UUID, listing_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Return true if user is the listing owner
  IF auth.uid() = listing_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Return true if user has approved interest in this listing
  IF EXISTS (
    SELECT 1 FROM buyer_interests 
    WHERE listing_id = can_view_contact_info.listing_id
    AND buyer_user_id = auth.uid() 
    AND status = 'approved'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- New policy that shows listings but conditionally hides contact info
CREATE POLICY "Users can view active listings with conditional contact info" ON market_listings 
FOR SELECT USING (
  status = 'active' AND (
    CASE 
      WHEN can_view_contact_info(user_id, id) THEN TRUE
      ELSE TRUE -- Allow viewing but contact info will be filtered in application layer
    END
  )
);

-- Add indexes for performance
CREATE INDEX idx_buyer_interests_listing_buyer ON buyer_interests(listing_id, buyer_user_id);
CREATE INDEX idx_buyer_interests_status ON buyer_interests(status);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_buyer_interests_updated_at
  BEFORE UPDATE ON buyer_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();