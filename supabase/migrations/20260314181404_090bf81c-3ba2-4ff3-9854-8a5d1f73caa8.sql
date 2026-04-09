
-- Server-side validation trigger for catches table
-- Prevents impossible/negative values and enforces text length limits

CREATE OR REPLACE FUNCTION public.validate_catch()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Block negative values
  IF NEW.length IS NOT NULL AND NEW.length < 0 THEN
    RAISE EXCEPTION 'Length cannot be negative';
  END IF;
  IF NEW.weight IS NOT NULL AND NEW.weight < 0 THEN
    RAISE EXCEPTION 'Weight cannot be negative';
  END IF;

  -- Absolute max limits (in cm / kg stored in DB)
  -- 120 inches = ~305 cm, 300 lb = ~136 kg
  IF NEW.length IS NOT NULL AND NEW.length > 305 THEN
    RAISE EXCEPTION 'Length exceeds maximum realistic value (305 cm / 120 in)';
  END IF;
  IF NEW.weight IS NOT NULL AND NEW.weight > 136 THEN
    RAISE EXCEPTION 'Weight exceeds maximum realistic value (136 kg / 300 lb)';
  END IF;

  -- Text field length limits
  IF length(NEW.fish) > 100 THEN
    RAISE EXCEPTION 'Fish name too long (max 100 chars)';
  END IF;
  IF NEW.water IS NOT NULL AND length(NEW.water) > 200 THEN
    RAISE EXCEPTION 'Water name too long (max 200 chars)';
  END IF;
  IF NEW.bait IS NOT NULL AND length(NEW.bait) > 100 THEN
    RAISE EXCEPTION 'Bait name too long (max 100 chars)';
  END IF;
  IF NEW.technique IS NOT NULL AND length(NEW.technique) > 100 THEN
    RAISE EXCEPTION 'Technique name too long (max 100 chars)';
  END IF;
  IF NEW.notes IS NOT NULL AND length(NEW.notes) > 1000 THEN
    RAISE EXCEPTION 'Notes too long (max 1000 chars)';
  END IF;

  -- Fish name must not be empty
  IF trim(NEW.fish) = '' THEN
    RAISE EXCEPTION 'Fish species is required';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER validate_catch_before_insert_update
  BEFORE INSERT OR UPDATE ON public.catches
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_catch();
