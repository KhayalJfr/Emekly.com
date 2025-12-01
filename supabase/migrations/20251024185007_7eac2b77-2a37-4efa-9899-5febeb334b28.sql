-- Add city and experience_level columns to ads table
ALTER TABLE public.ads 
ADD COLUMN city TEXT,
ADD COLUMN experience_level TEXT;

-- Add index for city for better query performance
CREATE INDEX idx_ads_city ON public.ads(city);