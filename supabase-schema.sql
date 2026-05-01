-- ============================================================
-- PRICETAG — Full Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- TABLE: profiles (extends Supabase auth.users)
-- ─────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- TABLE: tracked_products
-- ─────────────────────────────────────────
create table public.tracked_products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  url text not null,
  title text,
  image_url text,
  site_name text,
  current_price numeric(10,2),
  original_price numeric(10,2),
  currency text default 'INR',
  last_scraped_at timestamptz,
  created_at timestamptz default now() not null,
  is_active boolean default true
);

-- Prevent duplicate tracking of same URL per user
create unique index tracked_products_user_url_idx on public.tracked_products(user_id, url);

-- ─────────────────────────────────────────
-- TABLE: price_history
-- ─────────────────────────────────────────
create table public.price_history (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.tracked_products(id) on delete cascade not null,
  price numeric(10,2) not null,
  scraped_at timestamptz default now() not null
);

create index price_history_product_id_idx on public.price_history(product_id);
create index price_history_scraped_at_idx on public.price_history(scraped_at desc);

-- ─────────────────────────────────────────
-- TABLE: price_alerts
-- ─────────────────────────────────────────
create table public.price_alerts (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.tracked_products(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_price numeric(10,2) not null,
  is_triggered boolean default false,
  triggered_at timestamptz,
  created_at timestamptz default now() not null
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.tracked_products enable row level security;
alter table public.price_history enable row level security;
alter table public.price_alerts enable row level security;

-- Profiles: users can only see/edit their own
create policy "profiles: own read"  on public.profiles for select using (auth.uid() = id);
create policy "profiles: own update" on public.profiles for update using (auth.uid() = id);

-- Tracked products
create policy "products: own select" on public.tracked_products for select using (auth.uid() = user_id);
create policy "products: own insert" on public.tracked_products for insert with check (auth.uid() = user_id);
create policy "products: own update" on public.tracked_products for update using (auth.uid() = user_id);
create policy "products: own delete" on public.tracked_products for delete using (auth.uid() = user_id);

-- Price history: readable if user owns the product
create policy "history: own product select" on public.price_history for select
  using (exists (
    select 1 from public.tracked_products
    where tracked_products.id = price_history.product_id
    and tracked_products.user_id = auth.uid()
  ));

-- Allow service role to insert price history (cron job)
create policy "history: service insert" on public.price_history for insert
  with check (true);

-- Alerts
create policy "alerts: own select" on public.price_alerts for select using (auth.uid() = user_id);
create policy "alerts: own insert" on public.price_alerts for insert with check (auth.uid() = user_id);
create policy "alerts: own update" on public.price_alerts for update using (auth.uid() = user_id);
create policy "alerts: own delete" on public.price_alerts for delete using (auth.uid() = user_id);
