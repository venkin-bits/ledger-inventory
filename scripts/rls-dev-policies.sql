-- scripts/rls-dev-policies.sql
--
-- ONE JOB: enable read access on categories and products for Phase 1 testing.
--
-- What is RLS (Row Level Security)?
-- It's a Postgres feature Supabase turns on by default. When enabled,
-- EVERY query returns zero rows unless there's an explicit policy saying
-- who is allowed to read/write. Think of it as a locked door — these
-- policies are the keys.
--
-- For Phase 1 (no login yet), we allow public read on categories and products
-- so our test connection script can see the data. In Phase 2, these will be
-- tightened to require a logged-in session.

-- Allow anyone to read categories (public product catalogue data)
alter table public.categories enable row level security;
create policy "Public can read categories"
  on public.categories for select
  using (true);

-- Allow anyone to read active products
alter table public.products enable row level security;
create policy "Public can read active products"
  on public.products for select
  using (is_active = true);

-- profiles and stock_movements stay locked down (no public read)
alter table public.profiles enable row level security;
alter table public.stock_movements enable row level security;
