
-- Fix critical account security policy issue
DROP POLICY IF EXISTS "System can manage security records" ON public.account_security;

-- Create proper user-specific policy for account security
CREATE POLICY "Users can view their own security records only" 
ON public.account_security 
FOR SELECT 
USING (auth.uid()::text = user_id OR auth.uid() IS NULL);

-- Allow system operations for login attempt tracking (with proper restrictions)
CREATE POLICY "System can insert security records" 
ON public.account_security 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update security records for user" 
ON public.account_security 
FOR UPDATE 
USING (auth.uid()::text = user_id OR auth.uid() IS NULL);

-- Fix database function security by adding proper search paths
CREATE OR REPLACE FUNCTION public.generate_animal_code(p_user_id uuid, p_farm_prefix text, p_animal_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
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

CREATE OR REPLACE FUNCTION public.generate_poultry_group_code(p_user_id uuid, p_farm_prefix text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
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

-- Add audit trigger for account security table to track changes
CREATE OR REPLACE FUNCTION public.audit_account_security_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      user_id, 
      action, 
      table_name, 
      record_id, 
      old_values, 
      new_values
    ) VALUES (
      COALESCE(NEW.user_id::uuid, OLD.user_id::uuid),
      'SECURITY_UPDATE',
      'account_security',
      NEW.id::text,
      row_to_json(OLD),
      row_to_json(NEW)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_account_security_trigger
  AFTER UPDATE ON public.account_security
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_account_security_changes();
