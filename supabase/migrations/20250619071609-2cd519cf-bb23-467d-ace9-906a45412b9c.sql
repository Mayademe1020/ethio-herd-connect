
-- Create marketplace listings table
CREATE TABLE public.market_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  weight DECIMAL(8,2),
  age INTEGER,
  location TEXT,
  contact_method TEXT CHECK (contact_method IN ('telegram', 'sms', 'phone')),
  contact_value TEXT,
  is_vet_verified BOOLEAN DEFAULT FALSE,
  photos TEXT[], -- Array of photo URLs
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create animals table with proper ID system
CREATE TABLE public.animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_code TEXT NOT NULL, -- Human-readable ID like HAB-COW-001-240615
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cattle', 'poultry', 'goat', 'sheep')),
  breed TEXT,
  age INTEGER,
  weight DECIMAL(8,2),
  photo_url TEXT,
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'attention', 'sick')),
  last_vaccination DATE,
  is_vet_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, animal_code) -- Ensure unique animal codes per user
);

-- Create farm profiles table for farm prefix management
CREATE TABLE public.farm_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  farm_name TEXT NOT NULL,
  farm_prefix TEXT NOT NULL,
  owner_name TEXT,
  location TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health records table
CREATE TABLE public.health_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccination', 'illness', 'checkup', 'treatment')),
  medicine_name TEXT,
  symptoms TEXT,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  notes TEXT,
  photo_url TEXT,
  administered_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create growth records table
CREATE TABLE public.growth_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  weight DECIMAL(8,2) NOT NULL,
  height DECIMAL(8,2),
  notes TEXT,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for market_listings
CREATE POLICY "Users can view all active listings" ON public.market_listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage their own listings" ON public.market_listings
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for animals
CREATE POLICY "Users can manage their own animals" ON public.animals
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for farm_profiles
CREATE POLICY "Users can manage their own farm profile" ON public.farm_profiles
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for health_records
CREATE POLICY "Users can manage their own health records" ON public.health_records
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for growth_records
CREATE POLICY "Users can manage their own growth records" ON public.growth_records
  FOR ALL USING (auth.uid() = user_id);

-- Create function to generate animal codes
CREATE OR REPLACE FUNCTION generate_animal_code(
  p_user_id UUID,
  p_farm_prefix TEXT,
  p_animal_type TEXT
) RETURNS TEXT AS $$
DECLARE
  type_code TEXT;
  next_number INTEGER;
  date_suffix TEXT;
  animal_code TEXT;
BEGIN
  -- Map animal type to code
  CASE p_animal_type
    WHEN 'cattle' THEN type_code := 'COW';
    WHEN 'poultry' THEN type_code := 'POU';
    WHEN 'goat' THEN type_code := 'GOT';
    WHEN 'sheep' THEN type_code := 'SHP';
    ELSE type_code := 'ANM';
  END CASE;
  
  -- Get next number for this user and type
  SELECT COALESCE(MAX(
    CAST(
      SPLIT_PART(
        SPLIT_PART(animal_code, '-', 3), 
        '-', 1
      ) AS INTEGER
    )
  ), 0) + 1
  INTO next_number
  FROM public.animals 
  WHERE user_id = p_user_id 
    AND animal_code LIKE p_farm_prefix || '-' || type_code || '-%';
  
  -- Generate date suffix (YYMMDD format)
  date_suffix := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  -- Construct animal code
  animal_code := p_farm_prefix || '-' || type_code || '-' || LPAD(next_number::TEXT, 3, '0') || '-' || date_suffix;
  
  RETURN animal_code;
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('animal-photos', 'animal-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for animal photos
CREATE POLICY "Anyone can view animal photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'animal-photos');

CREATE POLICY "Authenticated users can upload animal photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'animal-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own animal photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own animal photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'animal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
