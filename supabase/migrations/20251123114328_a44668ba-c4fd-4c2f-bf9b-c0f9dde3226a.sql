-- Add status field to ads table
CREATE TYPE public.ad_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.ads 
ADD COLUMN status public.ad_status NOT NULL DEFAULT 'pending';

-- Update RLS policies so regular users only see approved ads
DROP POLICY IF EXISTS "Anyone can view ads" ON public.ads;
DROP POLICY IF EXISTS "Authenticated users can view ads" ON public.ads;

CREATE POLICY "Users can view approved ads"
ON public.ads
FOR SELECT
USING (status = 'approved');

-- Admins can view all ads regardless of status
CREATE POLICY "Admins can view all ads"
ON public.ads
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own ads regardless of status
CREATE POLICY "Users can view their own ads"
ON public.ads
FOR SELECT
USING (auth.uid() = user_id);