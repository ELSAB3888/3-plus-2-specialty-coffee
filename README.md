# 3+2 Specialty Coffee — Digital Menu & Management System

> **Brand Story:** 3 Sisters, 2 Brothers  
> **Brand Tagline:** One Perfect Cup

A production-ready, mobile-first bilingual web application and digital menu designed specifically for **3+2 Specialty Coffee**, featuring customer QR code access, real-time client-side search, multi-size pricing with elegant dotted leader lines, an independent extras section, and an owner-only administrative portal backed by Supabase PostgreSQL and Row Level Security.

---

## ☕ Visual Identity & Design Direction

- **Brand Colors:** Warm Cream (`#F5F0E8`), Olive Green (`#4A5D3A`), Espresso (`#3C2A1E`), and Antique Gold (`#C5A572`).
- **Typography:** Playfair Display & Noto Serif Arabic for headlines; Inter & Noto Sans Arabic for body.
- **Menu Presentation:** Elegant dotted leader lines connecting beverage names to prices, subtle decorative wavy dividers, and expandable detail panels.
- **Bilingual Architecture:** Native English (LTR) and Arabic (RTL) with natural localized phrasing and automatic HTML direction synchronization.

---

## 🚀 Key Features

1. **Direct QR Menu Access (`/menu`):**
   - Directly scannable from café tables without redirects or app downloads.
   - Sticky horizontally scrollable category navigation bar on mobile devices.
   - Real-time client-side search matching English, Arabic, and tasting notes.
   - Product detail accordion displaying cup sizes, prices in SAR, and tasting notes.
   - Dedicated **Extras** section at the bottom for milk alternatives and artisan add-ons.

2. **Welcome Landing Page (`/`):**
   - Hero banner with grain overlay and brand story badge ("3 Sisters, 2 Brothers").
   - Three core craft promises: *Micro-Lot Origins*, *Artisan Profile Roasting*, and *Deliberate Brewing*.
   - Featured signature drinks showcase.
   - Heritage story section explaining the sibling collaboration.

3. **Owner-Only Administration (`/admin`):**
   - Protected route requiring owner authentication via Supabase Auth.
   - **Categories:** Add, edit, reorder, toggle visibility, and safe deletion protection (prevents deletion if a category contains products).
   - **Products:** Manage names, descriptions, category assignment, single price vs multiple sizes, featured status, and photo uploads.
   - **Extras:** Manage signature add-ons and prices.
   - **Image Uploads:** Drag-and-drop image upload to Supabase Storage with preview and file validation.

4. **Security & Data Integrity:**
   - PostgreSQL Row Level Security (RLS) policies on all tables.
   - Anonymous visitors can only query published items (`is_visible = true`).
   - Mutations strictly restricted to the authenticated owner.
   - Never exposes privileged keys to client code.

---

## 🛠️ Technology Stack

- **Frontend:** React 18 with TypeScript (strict mode enabled).
- **Build Tool:** Vite 6 with optimized chunk splitting.
- **Routing:** React Router v6.
- **Styling:** Tailwind CSS with custom design tokens.
- **Internationalization:** i18next & react-i18next with bundled JSON dictionaries.
- **Icons:** Lucide React.
- **Backend & Database:** Supabase (PostgreSQL with RLS).
- **Storage:** Supabase Storage (`menu-images` bucket).

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```
*(Note: If left unconfigured, the application runs seamlessly in local demo mock mode with rich initial seed data).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

---

## 🗄️ Database Setup

Follow the instructions in [`supabase/README.md`](supabase/README.md) to apply migrations and seed data in your Supabase project:
1. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor.
2. Run `supabase/seed.sql` to populate initial menu items.

---

## 🌐 Hosting & Commercial Deployment

For commercial café deployment:
1. **Frontend Hosting:**
   - **Cloudflare Pages / Netlify / Vercel Pro:** Free or low-cost commercial-eligible static hosting compatible with Vite SPAs.
   - Set environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the hosting dashboard.
   - Set build command: `npm run build` and output directory: `dist`.
2. **Custom Domain:**
   - Connect custom domain (e.g. `menu.3plus2coffee.com`).
   - Generate table QR codes pointing directly to `https://menu.3plus2coffee.com/menu`.
