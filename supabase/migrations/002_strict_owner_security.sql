-- ==============================================================================
-- 3+2 SPECIALTY COFFEE — MIGRATION 002: HARDENED OWNER-ONLY SECURITY & RLS POLICIES
-- 
-- Scope:
-- 1. Cleans up all legacy/conflicting policies across public tables & menu-images storage.
-- 2. Restricts table permissions (Least Privilege).
-- 3. Creates protected 'app_admins' table (NO write permissions for public/authenticated).
-- 4. Creates secure 'is_app_owner()' function (search_path pinned, no privilege escalation).
-- 5. Strict Cascading RLS: Public sees sizes ONLY if size is available, product is visible, AND category is visible.
-- 6. Storage write/delete strictly enforced via 'is_app_owner()'.
-- 7. Zero destructive operations: Preserves all existing tables, products, categories, and prices.
-- ==============================================================================

-- 1. Ensure Schema Usage for standard roles
grant usage on schema public to anon, authenticated;

-- 2. Create Protected Admin Registry Table
-- Notice: NO INSERT/UPDATE/DELETE grants are given on this table to 'anon' or 'authenticated'.
-- Rows can ONLY be added by the project administrator in Supabase Dashboard / SQL Editor.
create table if not exists public.app_admins (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.app_admins enable row level security;

-- 3. Secure Verification Function (Search Path Pinned to prevent search_path hijacking)
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
      -- Check tamper-proof app_metadata role set by Supabase Auth service
      (auth.jwt() -> 'app_metadata' ->> 'role') in ('owner', 'admin')
      -- OR check registration in the protected app_admins table
      or exists (
        select 1 from public.app_admins where user_id = auth.uid()
      )
    )
  );
$$;

-- Secure function execution privileges
revoke all on function public.is_app_owner() from public;
grant execute on function public.is_app_owner() to anon, authenticated;

-- 4. Least Privilege Table Grants
-- Anon: SELECT only on public menu data
grant select on public.categories, public.products, public.product_sizes, public.extras, public.product_extras, public.site_settings to anon;

-- Authenticated: SELECT, INSERT, UPDATE, DELETE on menu data (strictly filtered by RLS)
grant select, insert, update, delete on public.categories, public.products, public.product_sizes, public.extras, public.product_extras, public.site_settings to authenticated;

-- App Admins table: SELECT only for authenticated (writes blocked for regular users)
grant select on public.app_admins to authenticated;

-- Sequences for serial fields
grant usage, select on all sequences in schema public to authenticated;

-- ==============================================================================
-- 5. CLEAN UP ALL LEGACY POLICIES (Prevent any hidden / conflicting permissions)
-- ==============================================================================

do $$
declare
  r record;
begin
  for r in (
    select policyname, tablename, schemaname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('categories', 'products', 'product_sizes', 'extras', 'product_extras', 'site_settings', 'app_admins')
  ) loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- Clean up storage policies for menu-images bucket
drop policy if exists "Public image viewing" on storage.objects;
drop policy if exists "Owner image upload" on storage.objects;
drop policy if exists "Owner image update" on storage.objects;
drop policy if exists "Owner image deletion" on storage.objects;
drop policy if exists "Allow authenticated uploads" on storage.objects;
drop policy if exists "Give users access to own folder 1oj01fe_0" on storage.objects;

-- ==============================================================================
-- 6. RECREATE HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- --- CATEGORIES ---
create policy "categories_select_policy"
    on public.categories for select
    to anon, authenticated
    using (is_visible = true or public.is_app_owner());

create policy "categories_insert_policy"
    on public.categories for insert
    to authenticated
    with check (public.is_app_owner());

create policy "categories_update_policy"
    on public.categories for update
    to authenticated
    using (public.is_app_owner())
    with check (public.is_app_owner());

create policy "categories_delete_policy"
    on public.categories for delete
    to authenticated
    using (public.is_app_owner());

-- --- PRODUCTS ---
-- Public can view product ONLY if product is visible AND its category is visible
create policy "products_select_policy"
    on public.products for select
    to anon, authenticated
    using (
        public.is_app_owner()
        or (
            is_visible = true
            and exists (
                select 1 from public.categories c
                where c.id = products.category_id
                  and c.is_visible = true
            )
        )
    );

create policy "products_insert_policy"
    on public.products for insert
    to authenticated
    with check (public.is_app_owner());

create policy "products_update_policy"
    on public.products for update
    to authenticated
    using (public.is_app_owner())
    with check (public.is_app_owner());

create policy "products_delete_policy"
    on public.products for delete
    to authenticated
    using (public.is_app_owner());

-- --- PRODUCT SIZES ---
-- Public can view size ONLY if size is available, product is visible, AND category is visible
create policy "product_sizes_select_policy"
    on public.product_sizes for select
    to anon, authenticated
    using (
        public.is_app_owner()
        or (
            is_available = true
            and exists (
                select 1 from public.products p
                join public.categories c on c.id = p.category_id
                where p.id = product_sizes.product_id
                  and p.is_visible = true
                  and c.is_visible = true
            )
        )
    );

create policy "product_sizes_insert_policy"
    on public.product_sizes for insert
    to authenticated
    with check (public.is_app_owner());

create policy "product_sizes_update_policy"
    on public.product_sizes for update
    to authenticated
    using (public.is_app_owner())
    with check (public.is_app_owner());

create policy "product_sizes_delete_policy"
    on public.product_sizes for delete
    to authenticated
    using (public.is_app_owner());

-- --- EXTRAS ---
create policy "extras_select_policy"
    on public.extras for select
    to anon, authenticated
    using (is_available = true or public.is_app_owner());

create policy "extras_insert_policy"
    on public.extras for insert
    to authenticated
    with check (public.is_app_owner());

create policy "extras_update_policy"
    on public.extras for update
    to authenticated
    using (public.is_app_owner())
    with check (public.is_app_owner());

create policy "extras_delete_policy"
    on public.extras for delete
    to authenticated
    using (public.is_app_owner());

-- --- SITE SETTINGS ---
create policy "site_settings_select_policy"
    on public.site_settings for select
    to anon, authenticated
    using (true);

create policy "site_settings_modify_policy"
    on public.site_settings for all
    to authenticated
    using (public.is_app_owner())
    with check (public.is_app_owner());

-- --- APP ADMINS TABLE ---
create policy "app_admins_select_policy"
    on public.app_admins for select
    to authenticated
    using (public.is_app_owner());

-- --- STORAGE (menu-images bucket) ---
create policy "storage_public_view_policy"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'menu-images');

create policy "storage_owner_upload_policy"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'menu-images' and public.is_app_owner());

create policy "storage_owner_update_policy"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'menu-images' and public.is_app_owner())
    with check (bucket_id = 'menu-images' and public.is_app_owner());

create policy "storage_owner_delete_policy"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'menu-images' and public.is_app_owner());
