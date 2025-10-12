-- Add latitude and longitude to masters table for geolocation
ALTER TABLE public.masters 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- Add index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_masters_location ON public.masters(latitude, longitude);

-- Add latitude and longitude to profiles table as well
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- Create a function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 numeric, 
  lon1 numeric, 
  lat2 numeric, 
  lon2 numeric
) RETURNS numeric AS $$
DECLARE
  earth_radius numeric := 6371; -- Earth's radius in kilometers
  dlat numeric;
  dlon numeric;
  a numeric;
  c numeric;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;
  
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_distance IS 'Calculate distance in kilometers between two geographic coordinates using Haversine formula';