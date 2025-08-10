
-- Milk Production Tables
CREATE TABLE milk_production (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  animal_id UUID REFERENCES animals(id),
  production_date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_yield DECIMAL(10,2),
  evening_yield DECIMAL(10,2),
  total_yield DECIMAL(10,2) GENERATED ALWAYS AS (COALESCE(morning_yield, 0) + COALESCE(evening_yield, 0)) STORED,
  quality_grade TEXT CHECK (quality_grade IN ('A', 'B', 'C')),
  fat_content DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Records Table
CREATE TABLE financial_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  animal_id UUID REFERENCES animals(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feed Management Table
CREATE TABLE feed_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  feed_type TEXT NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  cost_per_kg DECIMAL(10,2),
  purchase_date DATE,
  expiry_date DATE,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('vaccination', 'health', 'financial', 'general')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own milk production" ON milk_production FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own financial records" ON financial_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own feed inventory" ON feed_inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_milk_production_user_date ON milk_production(user_id, production_date);
CREATE INDEX idx_financial_records_user_date ON financial_records(user_id, transaction_date);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
