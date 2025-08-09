
-- Step 1: Fix RLS on vaccination_schedules table
ALTER TABLE public.vaccination_schedules ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to vaccination schedules (everyone can see standard vaccination schedules)
CREATE POLICY "Everyone can view vaccination schedules" 
ON public.vaccination_schedules 
FOR SELECT 
USING (true);

-- Create policy for admin/veterinarian insert/update access (only authenticated users with admin role can modify)
CREATE POLICY "Only admins can modify vaccination schedules" 
ON public.vaccination_schedules 
FOR ALL 
USING (false) -- No one can modify by default
WITH CHECK (false);

-- Step 5: Fix Database Function Security - Update generate_animal_code function with explicit search_path and input validation
CREATE OR REPLACE FUNCTION public.generate_animal_code(p_user_id uuid, p_farm_prefix text, p_animal_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  type_code TEXT;
  next_number INTEGER;
  date_suffix TEXT;
  animal_code TEXT;
BEGIN
  -- Input validation
  IF p_user_id IS NULL OR p_farm_prefix IS NULL OR p_animal_type IS NULL THEN
    RAISE EXCEPTION 'All parameters are required';
  END IF;
  
  -- Sanitize inputs
  p_farm_prefix := regexp_replace(upper(trim(p_farm_prefix)), '[^A-Z0-9]', '', 'g');
  p_animal_type := lower(trim(p_animal_type));
  
  -- Validate farm prefix length
  IF length(p_farm_prefix) > 10 OR length(p_farm_prefix) < 2 THEN
    RAISE EXCEPTION 'Farm prefix must be between 2 and 10 characters';
  END IF;
  
  -- Map animal type to code with validation
  CASE p_animal_type
    WHEN 'cattle' THEN type_code := 'COW';
    WHEN 'poultry' THEN type_code := 'POU';
    WHEN 'goat' THEN type_code := 'GOT';
    WHEN 'sheep' THEN type_code := 'SHP';
    ELSE 
      RAISE EXCEPTION 'Invalid animal type: %', p_animal_type;
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
  
  -- Final validation
  IF length(animal_code) > 50 THEN
    RAISE EXCEPTION 'Generated animal code too long';
  END IF;
  
  RETURN animal_code;
END;
$function$;

-- Update generate_poultry_group_code function with explicit search_path and input validation
CREATE OR REPLACE FUNCTION public.generate_poultry_group_code(p_user_id uuid, p_farm_prefix text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  next_number INTEGER;
  date_suffix TEXT;
  group_code TEXT;
BEGIN
  -- Input validation
  IF p_user_id IS NULL OR p_farm_prefix IS NULL THEN
    RAISE EXCEPTION 'All parameters are required';
  END IF;
  
  -- Sanitize inputs
  p_farm_prefix := regexp_replace(upper(trim(p_farm_prefix)), '[^A-Z0-9]', '', 'g');
  
  -- Validate farm prefix length
  IF length(p_farm_prefix) > 10 OR length(p_farm_prefix) < 2 THEN
    RAISE EXCEPTION 'Farm prefix must be between 2 and 10 characters';
  END IF;
  
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
  
  -- Final validation
  IF length(group_code) > 50 THEN
    RAISE EXCEPTION 'Generated group code too long';
  END IF;
  
  RETURN group_code;
END;
$function$;

-- Add audit logging table for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own audit logs
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add account security table for login attempt tracking
CREATE TABLE IF NOT EXISTS public.account_security (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  failed_login_attempts integer NOT NULL DEFAULT 0,
  last_failed_login timestamp with time zone,
  account_locked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on account_security
ALTER TABLE public.account_security ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own security records
CREATE POLICY "Users can view their own security records" 
ON public.account_security 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow system to insert/update security records
CREATE POLICY "System can manage security records" 
ON public.account_security 
FOR ALL 
USING (true);
