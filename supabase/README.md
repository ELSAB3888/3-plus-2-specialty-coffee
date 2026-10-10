# Supabase Database & Security Guide

## Project: 3+2 Specialty Coffee
**Brand:** 3+2 Specialty Coffee (3 Sisters, 2 Brothers — One Perfect Cup)

---

## 1. Quick Setup in Supabase Dashboard

1. Create a new project at [database.new](https://database.new) named `3-plus-2-specialty-coffee`.
2. Go to **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/001_initial_schema.sql` and run the entire script. This will create:
   - `categories`
   - `products`
   - `product_sizes`
   - `extras`
   - `product_extras`
   - `site_settings`
   - Row Level Security (RLS) policies for all tables
   - `menu-images` public storage bucket with authenticated upload policies.
4. Next, open `supabase/seed.sql` and run it in the SQL Editor to populate initial categories, specialty beverages, multiple sizes, and signature extras.

---

## 2. Owner Account Provisioning Protocol

In accordance with strict security requirements:
- **No public user registration** is permitted.
- Only one authorized owner account exists.

### Step-by-step account creation:
1. In the Supabase Dashboard, go to **Authentication** > **Users**.
2. Click **Add user** > **Create user**.
3. Enter the café owner's email (e.g. `owner@3plus2coffee.com`) and a strong password (minimum 12 characters).
4. Uncheck "Auto Confirm User" or set Email Confirm to true as preferred.
5. In your frontend `.env`:
   ```bash
   VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
   ```
6. The owner can now sign in securely at `/admin/login`.

---

## 3. Storage Bucket Configuration

The `menu-images` bucket is automatically configured by `001_initial_schema.sql`:
- **Public:** `true` (enables customer browsers to fetch menu photos directly from Supabase CDN).
- **Upload / Mutate:** `authenticated` only (only the authenticated owner can upload or replace photos).
- **Max file size:** 5MB.
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`.
