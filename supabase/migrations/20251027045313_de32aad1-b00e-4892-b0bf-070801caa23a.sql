-- Add photos support to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS client_photos JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.bookings.client_photos IS 'Array of photo URLs uploaded by the client to show details of the service location or issue';

-- Create storage bucket for booking photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-photos', 'booking-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for booking photos
CREATE POLICY "Anyone can view booking photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'booking-photos');

CREATE POLICY "Authenticated users can upload booking photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'booking-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own booking photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'booking-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own booking photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'booking-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);