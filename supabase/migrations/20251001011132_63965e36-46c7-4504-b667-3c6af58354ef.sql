-- Create service requests table for clients to post jobs
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category service_category NOT NULL,
  budget_range TEXT,
  photos TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create applications table for masters to respond to requests
CREATE TABLE IF NOT EXISTS public.service_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  master_id UUID NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  proposed_price NUMERIC NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(request_id, master_id)
);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_requests
CREATE POLICY "Anyone can view open requests"
  ON public.service_requests FOR SELECT
  USING (status = 'open' OR client_id = auth.uid() OR is_admin());

CREATE POLICY "Clients can create requests"
  ON public.service_requests FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own requests"
  ON public.service_requests FOR UPDATE
  USING (client_id = auth.uid());

CREATE POLICY "Clients can delete own requests"
  ON public.service_requests FOR DELETE
  USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all requests"
  ON public.service_requests FOR ALL
  USING (is_admin());

-- RLS Policies for service_applications
CREATE POLICY "Request owner and applicant can view applications"
  ON public.service_applications FOR SELECT
  USING (
    master_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.service_requests 
      WHERE id = request_id AND client_id = auth.uid()
    ) OR
    is_admin()
  );

CREATE POLICY "Masters can create applications"
  ON public.service_applications FOR INSERT
  WITH CHECK (
    master_id = auth.uid() AND
    master_id IN (SELECT id FROM public.masters)
  );

CREATE POLICY "Masters can update own applications"
  ON public.service_applications FOR UPDATE
  USING (master_id = auth.uid());

CREATE POLICY "Request owners can update application status"
  ON public.service_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.service_requests 
      WHERE id = request_id AND client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all applications"
  ON public.service_applications FOR ALL
  USING (is_admin());

-- Create storage bucket for request photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-requests', 'service-requests', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for request photos
CREATE POLICY "Anyone can view request photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-requests');

CREATE POLICY "Authenticated users can upload request photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'service-requests' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own request photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'service-requests' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own request photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'service-requests' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add triggers for updated_at
CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_applications_updated_at
  BEFORE UPDATE ON public.service_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();