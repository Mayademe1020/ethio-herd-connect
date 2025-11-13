-- Feed Rationing System for Ethiopian Livestock
-- Based on ILRI research and Ethiopian farming practices

-- Feed ingredients database
CREATE TABLE IF NOT EXISTS feed_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_am TEXT NOT NULL, -- Amharic name
  name_en TEXT NOT NULL, -- English name
  icon_emoji TEXT, -- Visual identifier
  category TEXT NOT NULL, -- 'energy', 'protein', 'mineral', 'roughage'
  dry_matter_percent DECIMAL(5,2),
  crude_protein_percent DECIMAL(5,2),
  energy_mj_kg DECIMAL(6,3),
  calcium_percent DECIMAL(5,3),
  phosphorus_percent DECIMAL(5,3),
  seasonal_availability JSONB, -- {'dry_season': true, 'wet_season': true}
  commonly_available BOOLEAN DEFAULT true,
  region_specific TEXT[], -- Ethiopian regions where available
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ILRI ration formulas
CREATE TABLE IF NOT EXISTS ilri_rations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_type TEXT NOT NULL, -- 'cattle', 'goat', 'sheep'
  animal_subtype TEXT, -- 'dairy_cow', 'fattening_calf', etc.
  production_goal TEXT NOT NULL, -- 'high_milk', 'maintenance', 'fattening'
  season TEXT NOT NULL, -- 'dry', 'wet'
  ingredient_ratios JSONB NOT NULL, -- {'maize_bran': 40, 'wheat_bran': 30}
  nutritional_analysis JSONB, -- Complete nutritional breakdown
  expected_production TEXT, -- '12-15L milk/day'
  disclaimer_text_am TEXT,
  disclaimer_text_en TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farmer saved feed plans
CREATE TABLE farmer_feed_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_id TEXT, -- Store as text to avoid foreign key issues
  ration_id TEXT, -- Store as text to avoid foreign key issues
  mode_type TEXT NOT NULL, -- 'user_driven', 'app_driven'
  selected_feeds JSONB, -- Store as JSON array of feed IDs
  custom_notes TEXT,
  telegram_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_feed_ingredients_category ON feed_ingredients(category);
CREATE INDEX idx_feed_ingredients_availability ON feed_ingredients USING gin(seasonal_availability);
CREATE INDEX idx_ilri_rations_animal ON ilri_rations(animal_type, animal_subtype);
CREATE INDEX idx_ilri_rations_season ON ilri_rations(season);
CREATE INDEX idx_farmer_feed_plans_farmer ON farmer_feed_plans(farmer_id);
CREATE INDEX idx_farmer_feed_plans_animal ON farmer_feed_plans(animal_id);

-- Enable RLS
ALTER TABLE feed_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ilri_rations ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_feed_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Feed ingredients are viewable by all users" ON feed_ingredients
  FOR SELECT USING (true);

CREATE POLICY "ILRI rations are viewable by all users" ON ilri_rations
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own feed plans" ON farmer_feed_plans
  FOR ALL USING (auth.uid() = farmer_id);

-- Insert Ethiopian feed ingredients (based on ILRI data)
INSERT INTO feed_ingredients (name_am, name_en, icon_emoji, category, dry_matter_percent, crude_protein_percent, energy_mj_kg, calcium_percent, phosphorus_percent, seasonal_availability, commonly_available, region_specific) VALUES
('የበቆሎ ቅቤ', 'Maize Bran', '🌽', 'energy', 88.0, 8.5, 8.2, 0.02, 0.8, '{"dry_season": true, "wet_season": true}', true, ARRAY['oromia', 'amhara', 'tigray', 'snnpr']),
('የስንዴ ቅቤ', 'Wheat Bran', '🌾', 'energy', 87.0, 12.0, 7.8, 0.15, 1.0, '{"dry_season": true, "wet_season": true}', true, ARRAY['oromia', 'amhara', 'tigray']),
('የእንጨት ቅቤ ኬክ', 'Cotton Seed Cake', '🥜', 'protein', 92.0, 22.0, 12.5, 0.2, 0.6, '{"dry_season": true, "wet_season": true}', true, ARRAY['oromia', 'amhara', 'tigray', 'afar']),
('ሞላሴስ', 'Molasses', '🍯', 'energy', 75.0, 3.0, 11.0, 1.2, 0.1, '{"dry_season": true, "wet_season": true}', true, ARRAY['oromia', 'amhara', 'snnpr']),
('አልፋልፋ', 'Alfalfa Hay', '🌱', 'roughage', 85.0, 18.0, 8.5, 1.5, 0.3, '{"dry_season": false, "wet_season": true}', false, ARRAY['oromia', 'amhara']),
('ኖግ ኬክ', 'Noug Seed Cake', '🌰', 'protein', 90.0, 25.0, 13.2, 0.3, 0.5, '{"dry_season": true, "wet_season": true}', true, ARRAY['oromia', 'snnpr']),
('ተፈጨ በቆሎ', 'Maize Grain', '🌽', 'energy', 88.0, 9.0, 14.5, 0.03, 0.3, '{"dry_season": true, "wet_season": true}', true, ARRAY['oromia', 'amhara', 'tigray']);

-- Insert sample ILRI rations for dairy cows
INSERT INTO ilri_rations (animal_type, animal_subtype, production_goal, season, ingredient_ratios, nutritional_analysis, expected_production, disclaimer_text_am, disclaimer_text_en) VALUES
('cattle', 'dairy_cow', 'high_milk', 'dry', '{"maize_bran": 35, "wheat_bran": 25, "cotton_seed_cake": 20, "noug_seed_cake": 15, "molasses": 5}', '{"protein": 16.2, "energy": 9.8, "calcium": 0.85, "phosphorus": 0.52}', '12-15L milk/day', 'ይህ የምግብ መጠን በILRI ምርምር ላይ የተመሰረተ ነው። ከህክምና ባለሙያ ጋር ያማክሩ።', 'This ration is based on ILRI research. Consult a veterinarian before use.'),
('cattle', 'dairy_cow', 'maintenance', 'dry', '{"maize_bran": 50, "wheat_bran": 30, "cotton_seed_cake": 15, "molasses": 5}', '{"protein": 12.8, "energy": 8.2, "calcium": 0.65, "phosphorus": 0.48}', '4-6L milk/day', 'ይህ የምግብ መጠን በILRI ምርምር ላይ የተመሰረተ ነው። ከህክምና ባለሙያ ጋር ያማክሩ።', 'This ration is based on ILRI research. Consult a veterinarian before use.'),
('cattle', 'dairy_cow', 'high_milk', 'wet', '{"maize_bran": 30, "wheat_bran": 20, "alfalfa_hay": 25, "cotton_seed_cake": 15, "molasses": 10}', '{"protein": 15.8, "energy": 9.5, "calcium": 1.2, "phosphorus": 0.45}', '14-18L milk/day', 'ይህ የምግብ መጠን በILRI ምርምር ላይ የተመሰረተ ነው። ከህክምና ባለሙያ ጋር ያማክሩ።', 'This ration is based on ILRI research. Consult a veterinarian before use.');