-- Create master verification documents table
CREATE TABLE public.master_verification_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  master_id UUID NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('cedula_frente', 'cedula_dorso', 'certificacion', 'antecedentes', 'seguro', 'otro')),
  document_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_master_verification_docs_master ON public.master_verification_documents(master_id);
CREATE INDEX idx_master_verification_docs_status ON public.master_verification_documents(status);

-- Enable Row Level Security
ALTER TABLE public.master_verification_documents ENABLE ROW LEVEL SECURITY;

-- Masters can view their own documents
CREATE POLICY "Masters can view their own verification documents"
ON public.master_verification_documents
FOR SELECT
USING (auth.uid() = master_id);

-- Masters can insert their own documents
CREATE POLICY "Masters can upload verification documents"
ON public.master_verification_documents
FOR INSERT
WITH CHECK (auth.uid() = master_id);

-- Masters can delete pending documents
CREATE POLICY "Masters can delete pending verification documents"
ON public.master_verification_documents
FOR DELETE
USING (auth.uid() = master_id AND status = 'pending');

-- Admins can view all documents (using has_role function if exists, otherwise allow authenticated admins)
CREATE POLICY "Admins can view all verification documents"
ON public.master_verification_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Admins can update document status
CREATE POLICY "Admins can update verification documents"
ON public.master_verification_documents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Add verification status to masters table
ALTER TABLE public.masters 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' 
CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

ALTER TABLE public.masters 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.masters 
ADD COLUMN IF NOT EXISTS verified_by UUID;

-- Create trigger for updated_at
CREATE TRIGGER update_master_verification_documents_updated_at
BEFORE UPDATE ON public.master_verification_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification documents
CREATE POLICY "Masters can upload verification documents to their folder"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Masters can view their verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);