-- Create storage bucket for marketplace products
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-products', 'marketplace-products', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for marketplace products
CREATE POLICY "Anyone can view marketplace product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'marketplace-products');

CREATE POLICY "Authenticated users can upload marketplace product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'marketplace-products' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own marketplace product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'marketplace-products' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own marketplace product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'marketplace-products' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);