-- ==============================================================================
-- 3+2 SPECIALTY COFFEE — DATABASE MIGRATION
-- Project: 3+2 Specialty Coffee (3 Sisters, 2 Brothers — One Perfect Cup)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CATEGORIES TABLE
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name_en text not null,
    name_ar text not null,
    slug text not null unique,
    description_en text,
    description_ar text,
    image_url text,
    display_order integer not null default 1,
    is_visible boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PRODUCTS TABLE
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references public.categories(id) on delete restrict,
    name_en text not null,
    name_ar text not null,
    description_en text,
    description_ar text,
    image_url text,
    display_order integer not null default 1,
    is_visible boolean not null default true,
    is_featured boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PRODUCT SIZES TABLE (Supports single price as 1 size or multiple named sizes)
create table if not exists public.product_sizes (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    label_en text not null,
    label_ar text not null,
    price numeric(10, 2) not null check (price >= 0),
    display_order integer not null default 1,
    is_available boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. EXTRAS TABLE (Independent add-ons section)
create table if not exists public.extras (
    id uuid primary key default gen_random_uuid(),
    name_en text not null,
    name_ar text not null,
    price numeric(10, 2) not null check (price >= 0),
    is_available boolean not null default true,
    display_order integer not null default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. OPTIONAL PRODUCT-EXTRAS JUNCTION TABLE (For future drink-specific extras)
create table if not exists public.product_extras (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    extra_id uuid not null references public.extras(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(product_id, extra_id)
);

-- 6. SITE SETTINGS TABLE (Configurable currency, brand tagline, etc.)
create table if not exists public.site_settings (
    id uuid primary key default gen_random_uuid(),
    key text not null unique,
    value_en text,
    value_ar text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INDEXES for fast client-side menu queries
create index if not exists idx_categories_display on public.categories (display_order, is_visible);
create index if not exists idx_products_category on public.products (category_id, display_order, is_visible);
create index if not exists idx_product_sizes_product on public.product_sizes (product_id, display_order);
create index if not exists idx_extras_display on public.extras (display_order, is_available);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_sizes enable row level security;
alter table public.extras enable row level security;
alter table public.product_extras enable row level security;
alter table public.site_settings enable row level security;

-- CATEGORIES: Public can read visible categories; Authenticated owner can manage all
create policy "Public can view visible categories"
    on public.categories for select
    to anon, authenticated
    using (is_visible = true or auth.role() = 'authenticated');

create policy "Authenticated owner can insert categories"
    on public.categories for insert
    to authenticated
    with check (true);

create policy "Authenticated owner can update categories"
    on public.categories for update
    to authenticated
    using (true)
    with check (true);

create policy "Authenticated owner can delete categories"
    on public.categories for delete
    to authenticated
    using (true);

-- PRODUCTS: Public can read visible products; Authenticated owner can manage all
create policy "Public can view visible products"
    on public.products for select
    to anon, authenticated
    using (is_visible = true or auth.role() = 'authenticated');

create policy "Authenticated owner can insert products"
    on public.products for insert
    to authenticated
    with check (true);

create policy "Authenticated owner can update products"
    on public.products for update
    to authenticated
    using (true)
    with check (true);

create policy "Authenticated owner can delete products"
    on public.products for delete
    to authenticated
    using (true);

-- PRODUCT SIZES: Public can view available sizes of visible products
create policy "Public can view available product sizes"
    on public.product_sizes for select
    to anon, authenticated
    using (
        is_available = true or auth.role() = 'authenticated'
    );

create policy "Authenticated owner can insert product sizes"
    on public.product_sizes for insert
    to authenticated
    with check (true);

create policy "Authenticated owner can update product sizes"
    on public.product_sizes for update
    to authenticated
    using (true)
    with check (true);

create policy "Authenticated owner can delete product sizes"
    on public.product_sizes for delete
    to authenticated
    using (true);

-- EXTRAS: Public can view available extras; Authenticated owner can manage all
create policy "Public can view available extras"
    on public.extras for select
    to anon, authenticated
    using (is_available = true or auth.role() = 'authenticated');

create policy "Authenticated owner can insert extras"
    on public.extras for insert
    to authenticated
    with check (true);

create policy "Authenticated owner can update extras"
    on public.extras for update
    to authenticated
    using (true)
    with check (true);

create policy "Authenticated owner can delete extras"
    on public.extras for delete
    to authenticated
    using (true);

-- SITE SETTINGS
create policy "Public can view site settings"
    on public.site_settings for select
    to anon, authenticated
    using (true);

create policy "Authenticated owner can update site settings"
    on public.site_settings for all
    to authenticated
    using (true)
    with check (true);

-- ==============================================================================
-- STORAGE CONFIGURATION (Supabase Storage: menu-images bucket)
-- ==============================================================================
-- Insert the bucket if not exists
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

-- Storage RLS: Public can view images
create policy "Public image viewing"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'menu-images');

-- Storage RLS: Authenticated owner can upload images
create policy "Owner image upload"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'menu-images');

create policy "Owner image update"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'menu-images')
    with check (bucket_id = 'menu-images');

create policy "Owner image deletion"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'menu-images');
