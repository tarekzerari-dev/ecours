-- Run this script in your Supabase SQL Editor to add the Registration Links feature

CREATE TABLE IF NOT EXISTS public.registration_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  token UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT false NOT NULL,
  used_by_email TEXT, -- To track who used it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.registration_links ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read a token (necessary for the registration page to check validity)
CREATE POLICY "Public can view tokens" 
ON public.registration_links 
FOR SELECT 
USING (true);

-- Allow superadmins to insert and manage tokens
CREATE POLICY "Superadmins can manage tokens" 
ON public.registration_links 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
  )
);

-- Allow public to update a token to 'used' (ideally this should be an edge function, 
-- but for MVP we allow authenticated/anon to mark it as used when registering)
CREATE POLICY "Public can mark tokens as used" 
ON public.registration_links 
FOR UPDATE
USING (is_used = false)
WITH CHECK (is_used = true);
