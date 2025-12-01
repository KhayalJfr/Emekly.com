-- Add policy to allow public/anonymous users to view all ads
CREATE POLICY "Anyone can view ads"
ON public.ads
FOR SELECT
TO anon
USING (true);