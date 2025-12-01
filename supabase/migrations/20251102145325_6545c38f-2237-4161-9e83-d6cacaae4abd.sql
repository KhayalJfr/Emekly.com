-- Drop the existing public view policy
DROP POLICY IF EXISTS "Anyone can view ads" ON public.ads;

-- Create a new policy that requires authentication to view ads
CREATE POLICY "Authenticated users can view ads"
ON public.ads
FOR SELECT
TO authenticated
USING (true);