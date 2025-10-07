-- Seed data for milk production testing (fixed - total_yield is generated)

DO $$
DECLARE
  test_user_id uuid;
  test_animal_id_1 uuid;
  test_animal_id_2 uuid;
  test_animal_id_3 uuid;
BEGIN
  -- Get the first user from auth.users (for testing)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Check and insert Bessie if doesn't exist
    SELECT id INTO test_animal_id_1 FROM public.animals WHERE user_id = test_user_id AND name = 'Bessie' LIMIT 1;
    IF test_animal_id_1 IS NULL THEN
      INSERT INTO public.animals (user_id, name, type, breed, animal_code, birth_date, weight, health_status)
      VALUES (test_user_id, 'Bessie', 'cattle', 'Holstein', 'TEST-COW-001-' || TO_CHAR(CURRENT_DATE, 'YYMMDD'), CURRENT_DATE - INTERVAL '3 years', 550.5, 'healthy')
      RETURNING id INTO test_animal_id_1;
    END IF;

    -- Check and insert Daisy if doesn't exist
    SELECT id INTO test_animal_id_2 FROM public.animals WHERE user_id = test_user_id AND name = 'Daisy' LIMIT 1;
    IF test_animal_id_2 IS NULL THEN
      INSERT INTO public.animals (user_id, name, type, breed, animal_code, birth_date, weight, health_status)
      VALUES (test_user_id, 'Daisy', 'cattle', 'Jersey', 'TEST-COW-002-' || TO_CHAR(CURRENT_DATE, 'YYMMDD'), CURRENT_DATE - INTERVAL '4 years', 480.0, 'healthy')
      RETURNING id INTO test_animal_id_2;
    END IF;

    -- Check and insert Molly if doesn't exist
    SELECT id INTO test_animal_id_3 FROM public.animals WHERE user_id = test_user_id AND name = 'Molly' LIMIT 1;
    IF test_animal_id_3 IS NULL THEN
      INSERT INTO public.animals (user_id, name, type, breed, animal_code, birth_date, weight, health_status)
      VALUES (test_user_id, 'Molly', 'cattle', 'Guernsey', 'TEST-COW-003-' || TO_CHAR(CURRENT_DATE, 'YYMMDD'), CURRENT_DATE - INTERVAL '2 years', 520.0, 'healthy')
      RETURNING id INTO test_animal_id_3;
    END IF;

    -- Insert milk production records only if they don't exist (total_yield is generated automatically)
    IF test_animal_id_1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM milk_production WHERE animal_id = test_animal_id_1 AND production_date = CURRENT_DATE) THEN
      -- Bessie's records (high producer)
      INSERT INTO public.milk_production (user_id, animal_id, production_date, morning_yield, evening_yield, quality_grade, fat_content, notes)
      VALUES
        (test_user_id, test_animal_id_1, CURRENT_DATE, 15.5, 14.0, 'A', 4.2, 'Good production'),
        (test_user_id, test_animal_id_1, CURRENT_DATE - 1, 16.0, 14.5, 'A', 4.3, 'Excellent quality'),
        (test_user_id, test_animal_id_1, CURRENT_DATE - 2, 15.0, 13.5, 'A', 4.1, 'Normal production'),
        (test_user_id, test_animal_id_1, CURRENT_DATE - 3, 15.5, 14.0, 'A', 4.2, NULL),
        (test_user_id, test_animal_id_1, CURRENT_DATE - 4, 16.5, 15.0, 'A', 4.4, 'Peak production'),
        (test_user_id, test_animal_id_1, CURRENT_DATE - 5, 15.0, 14.0, 'A', 4.2, NULL),
        (test_user_id, test_animal_id_1, CURRENT_DATE - 6, 15.5, 13.5, 'A', 4.1, NULL);
    END IF;

    IF test_animal_id_2 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM milk_production WHERE animal_id = test_animal_id_2 AND production_date = CURRENT_DATE) THEN
      -- Daisy's records (medium producer)
      INSERT INTO public.milk_production (user_id, animal_id, production_date, morning_yield, evening_yield, quality_grade, fat_content, notes)
      VALUES
        (test_user_id, test_animal_id_2, CURRENT_DATE, 12.0, 11.0, 'B', 3.8, 'Good production'),
        (test_user_id, test_animal_id_2, CURRENT_DATE - 1, 11.5, 10.5, 'B', 3.7, NULL),
        (test_user_id, test_animal_id_2, CURRENT_DATE - 2, 12.5, 11.5, 'A', 3.9, 'Better quality today'),
        (test_user_id, test_animal_id_2, CURRENT_DATE - 3, 12.0, 11.0, 'B', 3.8, NULL),
        (test_user_id, test_animal_id_2, CURRENT_DATE - 4, 11.0, 10.0, 'B', 3.6, NULL),
        (test_user_id, test_animal_id_2, CURRENT_DATE - 5, 12.0, 11.5, 'B', 3.8, NULL),
        (test_user_id, test_animal_id_2, CURRENT_DATE - 6, 11.5, 10.5, 'B', 3.7, NULL);
    END IF;

    IF test_animal_id_3 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM milk_production WHERE animal_id = test_animal_id_3 AND production_date = CURRENT_DATE) THEN
      -- Molly's records (lower producer, younger cow)
      INSERT INTO public.milk_production (user_id, animal_id, production_date, morning_yield, evening_yield, quality_grade, fat_content, notes)
      VALUES
        (test_user_id, test_animal_id_3, CURRENT_DATE, 10.0, 9.0, 'B', 3.5, 'Young cow, still developing'),
        (test_user_id, test_animal_id_3, CURRENT_DATE - 1, 9.5, 8.5, 'B', 3.4, NULL),
        (test_user_id, test_animal_id_3, CURRENT_DATE - 2, 10.5, 9.5, 'B', 3.6, 'Improving'),
        (test_user_id, test_animal_id_3, CURRENT_DATE - 3, 10.0, 9.0, 'B', 3.5, NULL),
        (test_user_id, test_animal_id_3, CURRENT_DATE - 4, 9.0, 8.0, 'C', 3.3, 'Slight drop'),
        (test_user_id, test_animal_id_3, CURRENT_DATE - 5, 10.0, 9.5, 'B', 3.5, NULL),
        (test_user_id, test_animal_id_3, CURRENT_DATE - 6, 9.5, 9.0, 'B', 3.4, NULL);
    END IF;

  END IF;
END $$;