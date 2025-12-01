-- Allow admins to delete any ad
CREATE POLICY "Admins can delete any ad"
ON public.ads
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any ad
CREATE POLICY "Admins can update any ad"
ON public.ads
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));