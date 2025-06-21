
-- Create health_submissions table for veterinary support requests
CREATE TABLE public.health_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  animal_id text NOT NULL,
  symptoms text NOT NULL,
  description text,
  urgency text DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  photo_url text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'responded')),
  vet_advice text,
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for health_submissions
ALTER TABLE public.health_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for health_submissions
CREATE POLICY "Users can manage their own health submissions"
  ON public.health_submissions
  FOR ALL
  USING (auth.uid() = user_id);

-- Create storage bucket for health photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('health-photos', 'health-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for health photos
CREATE POLICY "Anyone can view health photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'health-photos');

CREATE POLICY "Authenticated users can upload health photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'health-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own health photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'health-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own health photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'health-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
