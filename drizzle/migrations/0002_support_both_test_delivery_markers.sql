CREATE OR REPLACE FUNCTION public.validate_memory_delivery()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF position('<<test>>' in lower(NEW.message)) = 0
     AND position('<</test>>' in lower(NEW.message)) = 0
     AND (NEW.delivery_at < (now() + interval '1 day') OR NEW.delivery_at > (now() + interval '50 years')) THEN
    RAISE EXCEPTION 'Delivery must be between tomorrow and 50 years from now';
  END IF;
  IF cardinality(NEW.image_paths) > 2 THEN
    RAISE EXCEPTION 'A memory can hold at most two images';
  END IF;
  RETURN NEW;
END;
$$;