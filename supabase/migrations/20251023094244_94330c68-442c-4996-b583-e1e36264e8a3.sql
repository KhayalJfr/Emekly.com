-- Fix search path for increment_ad_views function
CREATE OR REPLACE FUNCTION public.increment_ad_views(ad_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ads
  SET views = views + 1
  WHERE id = ad_id;
END;
$$;