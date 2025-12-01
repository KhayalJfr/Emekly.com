-- Add views column to ads table
ALTER TABLE public.ads ADD COLUMN views integer NOT NULL DEFAULT 0;

-- Create function to increment views
CREATE OR REPLACE FUNCTION public.increment_ad_views(ad_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ads
  SET views = views + 1
  WHERE id = ad_id;
END;
$$;