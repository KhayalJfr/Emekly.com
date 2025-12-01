-- Remove status-based filtering, allow all users to view all ads
DROP POLICY IF EXISTS "Users can view approved ads" ON public.ads;

-- Create new policy to allow all authenticated users to view all ads
CREATE POLICY "All users can view all ads"
ON public.ads
FOR SELECT
TO authenticated
USING (true);

-- Also allow anonymous users to view all ads
CREATE POLICY "Anonymous users can view all ads"
ON public.ads
FOR SELECT
TO anon
USING (true);