-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  avatar_url text,
  subscription_tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Policies
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- 2. ATTORNEYS TABLE (Marketplace)
create table public.attorneys (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  firm text not null,
  image text,
  specialties text[],
  languages text[],
  rating numeric,
  review_count integer default 0,
  success_rate integer,
  price_start integer,
  is_verified boolean default false,
  next_available text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Everyone can read attorneys
alter table public.attorneys enable row level security;
create policy "Public read access" on public.attorneys for select using (true);

-- 3. DOCUMENTS TABLE (Metadata)
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  name text not null,
  type text,
  storage_path text not null, -- Path in Supabase Storage
  status text default 'scanning',
  ocr_data text,
  is_encrypted boolean default true,
  iv text, -- Initialization Vector for client-side encryption
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.documents enable row level security;
create policy "Users can see own documents" on public.documents
  for select using (auth.uid() = user_id);
create policy "Users can insert own documents" on public.documents
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own documents" on public.documents
  for delete using (auth.uid() = user_id);

-- 4. ATTORNEY APPLICATIONS
create table public.attorney_applications (
  id uuid default uuid_generate_v4() primary key,
  first_name text,
  last_name text,
  email text,
  firm_name text,
  bar_state text,
  bar_number text,
  status text default 'pending',
  submitted_date timestamp with time zone default timezone('utc'::text, now())
);

-- 5. STORAGE BUCKETS (Run this in SQL Editor or creating via UI)
-- insert into storage.buckets (id, name) values ('vault', 'vault');
-- Policy for storage:
-- create policy "User Access" on storage.objects for all using ( auth.uid() = owner );
