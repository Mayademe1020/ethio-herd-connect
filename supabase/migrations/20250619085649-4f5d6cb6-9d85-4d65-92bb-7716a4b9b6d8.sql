
-- Add birth_date and parent_id columns to animals table
ALTER TABLE public.animals 
ADD COLUMN birth_date date,
ADD COLUMN parent_id uuid REFERENCES public.animals(id);

-- Create table for farm assistants/multi-user access
CREATE TABLE public.farm_assistants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions jsonb DEFAULT '{"register_animals": true, "update_health": true, "view_records": true}'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(farm_owner_id, assistant_user_id)
);

-- Enable RLS for farm_assistants
ALTER TABLE public.farm_assistants ENABLE ROW LEVEL SECURITY;

-- Create policies for farm_assistants
CREATE POLICY "Farm owners can manage their assistants"
  ON public.farm_assistants
  FOR ALL
  USING (auth.uid() = farm_owner_id);

CREATE POLICY "Assistants can view their assignments"
  ON public.farm_assistants
  FOR SELECT
  USING (auth.uid() = assistant_user_id);

-- Create table for poultry groups
CREATE TABLE public.poultry_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_code text NOT NULL,
  group_name text NOT NULL,
  breed text,
  total_count integer NOT NULL DEFAULT 0,
  current_count integer NOT NULL DEFAULT 0,
  batch_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for poultry_groups
ALTER TABLE public.poultry_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for poultry_groups
CREATE POLICY "Users can manage their own poultry groups"
  ON public.poultry_groups
  FOR ALL
  USING (auth.uid() = user_id);

-- Create table for vaccination schedules/guides
CREATE TABLE public.vaccination_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_type text NOT NULL,
  vaccine_name text NOT NULL,
  age_days integer NOT NULL,
  description text,
  is_mandatory boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert Ethiopian livestock vaccination schedule data
INSERT INTO public.vaccination_schedules (animal_type, vaccine_name, age_days, description, is_mandatory) VALUES
('cattle', 'FMD Vaccine', 90, 'Foot and Mouth Disease vaccine - first dose', true),
('cattle', 'Anthrax Vaccine', 180, 'Anthrax prevention vaccine', true),
('cattle', 'Blackleg Vaccine', 120, 'Blackleg disease prevention', true),
('poultry', 'Newcastle Disease', 14, 'Newcastle disease vaccine - first dose', true),
('poultry', 'Gumboro Disease', 21, 'Infectious Bursal Disease vaccine', true),
('poultry', 'Fowl Pox', 60, 'Fowl pox vaccine', false),
('goat', 'PPR Vaccine', 90, 'Peste des Petits Ruminants vaccine', true),
('sheep', 'PPR Vaccine', 90, 'Peste des Petits Ruminants vaccine', true);

-- Update the generate_animal_code function to handle poultry groups
CREATE OR REPLACE FUNCTION public.generate_poultry_group_code(p_user_id uuid, p_farm_prefix text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  date_suffix TEXT;
  group_code TEXT;
BEGIN
  -- Get next number for poultry groups
  SELECT COALESCE(MAX(
    CAST(
      SPLIT_PART(
        SPLIT_PART(group_code, '-', 3), 
        '-', 1
      ) AS INTEGER
    )
  ), 0) + 1
  INTO next_number
  FROM public.poultry_groups 
  WHERE user_id = p_user_id;
  
  -- Generate date suffix (YYMMDD format)
  date_suffix := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  -- Construct group code
  group_code := p_farm_prefix || '-POULTRY-GRP' || LPAD(next_number::TEXT, 2, '0') || '-' || date_suffix;
  
  RETURN group_code;
END;
$$;
