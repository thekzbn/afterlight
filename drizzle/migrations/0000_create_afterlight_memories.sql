CREATE TABLE public.memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 4000),
  delivery_at timestamptz NOT NULL,
  image_paths text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.memories TO authenticated;
GRANT ALL ON public.memories TO service_role;

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read memories"
ON public.memories FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Owners can create memories"
ON public.memories FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can delete memories"
ON public.memories FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.validate_memory_delivery()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.delivery_at < (now() + interval '1 day') OR NEW.delivery_at > (now() + interval '50 years') THEN
    RAISE EXCEPTION 'Delivery must be between tomorrow and 50 years from now';
  END IF;
  IF cardinality(NEW.image_paths) > 2 THEN
    RAISE EXCEPTION 'A memory can hold at most two images';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_memory_before_write
BEFORE INSERT OR UPDATE ON public.memories
FOR EACH ROW EXECUTE FUNCTION public.validate_memory_delivery();

CREATE INDEX memories_owner_delivery_idx ON public.memories (user_id, delivery_at);

CREATE POLICY "Owners can read memory images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'memory-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can add memory images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'memory-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can remove memory images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'memory-images' AND (storage.foldername(name))[1] = auth.uid()::text);