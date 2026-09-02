-- Run this SQL in your Supabase project's SQL Editor to create the necessary table and policies.

CREATE TABLE public.songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    cover_url TEXT,
    audio_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (public)
CREATE POLICY "Allow public read access on songs"
ON public.songs
FOR SELECT
USING (true);

-- Allow insert access to everyone (for simplicity, typically you'd restrict this to authenticated admins)
CREATE POLICY "Allow public insert access on songs"
ON public.songs
FOR INSERT
WITH CHECK (true);

-- Allow update access to everyone
CREATE POLICY "Allow public update access on songs"
ON public.songs
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow delete access to everyone
CREATE POLICY "Allow public delete access on songs"
ON public.songs
FOR DELETE
USING (true);
