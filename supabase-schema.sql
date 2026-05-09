-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Enable Row Level Security
create table if not exists public.watchlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  symbol text not null,
  position integer default 0,
  created_at timestamptz default now(),
  unique(user_id, symbol)
);

alter table public.watchlists enable row level security;

create policy "Users can view own watchlist"
  on public.watchlists for select
  using (auth.uid() = user_id);

create policy "Users can insert own watchlist"
  on public.watchlists for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own watchlist"
  on public.watchlists for delete
  using (auth.uid() = user_id);

create policy "Users can update own watchlist"
  on public.watchlists for update
  using (auth.uid() = user_id);
