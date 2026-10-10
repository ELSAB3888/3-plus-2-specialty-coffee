-- ==============================================================================
-- 3+2 SPECIALTY COFFEE — MIGRATION 002: STRICT OWNER-ONLY SECURITY & RLS POLICIES
-- Ensures only verified owners (via app_metadata or app_admins table) can modify data.
-- Regular authenticated users and public visitors CANNOT modify any menu data or images.
-- ==============================================================================

-- 1. Ensure Schema Usage for standard roles
grant usage on schema public to anon, authenticated;

-- 2. Create protected Admin/Owner registry table
create table if not exists public.app_admins (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.app_admins enable row level security;

-- 3. Secure helper function to check if the caller is the verified owner
-- Uses 'security definer' with explicit search_path to prevent privilege escalation
create or replace function public.is_app_owner()
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select (
    auth.role() = 'authenticated'
    and (
      -- Check tamper-proof app_metadata role set by Supabase Auth admin
      (auth.jwt() -> 'app_metadata' ->> 'role') in ('owner', 'admin')
      -- OR check explicit registration in the protected app_admins table
      or exists (
        select 1 from public.app_admins where user_id = auth.uid()
      )
    )
  );
$$;

-- 4. Specific, minimum table-level privileges (no indiscriminate superuser access)
grant select on public.categories, public.products, public.product_sizes, public.extras, public.product_extras, public.site_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_sizes, public.extras, public.product_extras, public.site_settings to authenticated;
grant select on public.app_admins to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ==============================================================================
-- 5. UPDATE RLS POLICIES (DROP OLD & APPLY STRICT OWNER-ONLY RULES)
-- ==============================================================================

-- --- CATEGORIES ---
drop policy if exists "Public can view visible categories" on public.categories;
drop policy if exists "Authenticated owner can insert categories" on public.categories;
drop policy if exists "Authenticated owner can update categories" on public.categories;
drop policy if exists "Authenticated owner can delete categories" on public.categories;

create policy "Public can view visible categories"
    on public.categories for select
    to anon, authenticated
    using (is_visible = true or public.is_app_owner());

create policy "Owner can insert categories"
    on public.categories for insert
    to authenticated
    with check (public.is_app_owner());

create policy "Owner can update categories"
    on public.categories for update
    to authenticated
    using (public.is_app_owner())
    with check (public.is_app_owner());

create policy "Owner can delete categories"
    on public.categories for delete
    to authenticated
    using (public.is_app_owner());

-- --- PRODUCTS ---
drop policy if exists "Public can view visible products" on public.products;
drop policy if exists "Authenticated owner can insert products" on public.products;
drop policy if exists "Authenticated owner can update products" on public.products;
drop policy if exists "Authenticated owner can delete products" on public.products;

create policy "Public can view visible products"
    on public.products for select
    to anon, authenticated
    using (is_visible = true or public.is_app_owner());

create policy "Owner can insert products"
    on public.products for insert
    to authenticated
    with check (public.is_app_owner());

create policy "Owner can update products"
    on public.products for update
    to authenticated
    using (public.is_app_owner())
    with check (public.is_app_owner());

create policy "Owner can delete products"
    on public.products for delete
    to authenticated
    using (public.is_app_owner());

-- --- PRODUCT SIZES ---
drop policy if exists "Public can view available product sizes" on public.product_sizes;
drop policy if exists "Authenticated owner can insert product sizes" on public.product_sizes;
drop policy if exists "Authenticated owner can update product sizes" on public.product_sizes;
drop policy if exists "Authenticated owner can delete product sizes" on public.product_sizes;

create policy "Public can view available product sizes"
    on public.product_sizes for select
    to anon, authenticated
    using (is_available = true or public.is_app_owner());

create policy "Owner can insert product sizes"
    on public.product_sizes for insert
    to authenticated
    with check (public.is_app_owner());

create policy "Owner can update product sizes"
    on public.product_sizes for update
    to authenticated
    using (public.is_app_owner())
    with check (public.is_app_owner());

create policy "Owner can delete product sizes"
    on public.product_sizes for delete
    to authenticated
    using (public.is_app_owner());

-- --- EXTRAS ---
drop policy if exists "Public can view available extras" on public.extras;
drop policy if exists "Authenticated owner can insert extras" on public.extras;
drop policy if exists "Authenticated owner can update extras" on public.extras;
drop policy if exists "Authenticated owner can delete extras" on public.extras;

create policy "Public can view available extras"
    on public.extras for select
    to anon, authenticated
    using (is_available = true or public.is_app_owner());

create policy "Owner can insert extras"
    on public.extras for insert
    to authenticated
    with check (public.is_app_owner());

create policy "Owner can update extras"
    on public.extras for update
    to authenticated
    using (public.is_app_owner())
    with check (public.is_app_owner());

create policy "Owner can delete extras"
    on public.extras for delete
    to authenticated
    using (public.is_app_owner());

-- --- SITE SETTINGS ---
drop policy if exists "Public can view site settings" on public.site_settings;
drop policy if exists "Authenticated owner can update site settings" on public.site_settings;

create policy "Public can view site settings"
    on public.site_settings for select
    to anon, authenticated
    using (true);

create policy "Owner can modify site settings"
    on public.site_settings for all
    to authenticated
    using (public.is_app_owner())
    with check (public.is_app_owner());

-- --- APP ADMINS TABLE RLS ---
drop policy if exists "Admins can view admins list" on public.app_admins;
create policy "Admins can view admins list"
    on public.app_admins for select
    to authenticated
    using (user_id = auth.uid() or public.is_app_owner());

-- --- STORAGE (menu-images bucket) ---
drop policy if exists "Public image viewing" on storage.objects;
drop policy if exists "Owner image upload" on storage.objects;
drop policy if exists "Owner image update" on storage.objects;
drop policy if exists "Owner image deletion" on storage.objects;

create policy "Public image viewing"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'menu-images');

create policy "Owner image upload"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'menu-images' and public.is_app_owner());

create policy "Owner image update"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'menu-images' and public.is_app_owner())
    with check (bucket_id = 'menu-images' and public.is_app_owner());

create policy "Owner image deletion"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'menu-images' and public.is_app_owner());
