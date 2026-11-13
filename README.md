# 3+2 Specialty Coffee — Digital Menu & Management System

> **Brand:** 3 Sisters, 2 Brothers — One Perfect Cup  
> **Stack:** React 18 · TypeScript · Tailwind CSS · Vite · GitHub Pages · Local Node.js Admin

A production-ready, mobile-first **bilingual digital menu website** for **3+2 Specialty Coffee** (Egypt). The public website is a fully static site hosted on GitHub Pages. All menu data lives in local JSON files — no cloud database at runtime.

---

## ☕ Architecture Overview

```
3-plus-2-specialty-coffee/
├── public/
│   ├── data/              ← Runtime JSON (categories, products, extras, site_settings)
│   └── images/products/   ← 223 real product photos
├── src/                   ← React frontend (customer site + admin UI)
├── admin-server/          ← Local-only Node.js backend (127.0.0.1:3001)
├── data/                  ← Mirror copy of public/data (source of truth for admin edits)
├── backups/               ← Auto-generated local backups (gitignored)
├── migration/             ← One-time Supabase extraction scripts & raw backup (reference only)
├── .github/workflows/     ← GitHub Actions → GitHub Pages deployment
└── start-admin.bat        ← Windows launcher for the admin dashboard
```

**Key rule:** The public website reads from `/data/*.json` and `/images/products/` — no backend, no Supabase, no API calls at runtime.

---

## 🚀 Running Locally

### Customer Website (Dev)

```bash
npm install
npm run dev
# → http://localhost:5173
```

### Admin Dashboard (Local Only)

The admin dashboard only works from `localhost` or `127.0.0.1`. It is blocked on the public site.

**Windows (recommended):**
```
Double-click: start-admin.bat
```

**Manual:**
```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — Admin backend
cd admin-server
node src/server.js
# → http://127.0.0.1:3001

# Open: http://localhost:5173/#/admin
```

**Admin token:** Set your own token in `admin-server/.env` → `ADMIN_TOKEN=your-secret-here`  
*(Never commit the actual token value to version control)*

---

## 🏗️ Build & Deployment

### Build the static site

```bash
npm run build
# Output: dist/
```

### Deploy to GitHub Pages

Push to `main` branch — GitHub Actions automatically builds and deploys to the `gh-pages` branch.

**One-time GitHub setup:**
1. Push the repository to GitHub.
2. Go to **Settings → Pages → Source → Deploy from a branch → `gh-pages`**.
3. The site will be live at `https://<username>.github.io/<repo-name>/`.

No secrets needed — the workflow uses the automatic `GITHUB_TOKEN`.

---

## ⚙️ Admin Server Configuration

Create / edit `admin-server/.env`:

```env
# Secret token — keep this private, never commit it
ADMIN_TOKEN=your-secret-token-at-least-32-chars

# Git remote with PAT for push (optional — only needed for "Publish" button)
GIT_REMOTE=https://ghp_YOUR_PAT@github.com/YOUR_USERNAME/3-plus-2-specialty-coffee.git
GIT_USER_NAME=3plus2 Admin
GIT_USER_EMAIL=admin@3plus2coffee.com

PORT=3001
```

> [!CAUTION]
> `admin-server/.env` is gitignored. Never commit it. The token is only stored locally.

---

## 📦 Data Files

| File | Contents |
|------|----------|
| `public/data/categories.json` | 15 categories (AR + EN names, display order) |
| `public/data/products.json` | 115 products with sizes, prices (EGP), images |
| `public/data/extras.json` | 11 extras / add-ons |
| `public/data/site_settings.json` | Site name, tagline, currency |
| `public/images/products/` | 223 real product images |

The admin server writes to both `public/data/` and `data/` (mirror). The customer website reads only from `public/data/`.

---

## 🔒 Security Model

| Component | Access |
|-----------|--------|
| Public website | Anyone — static, no credentials |
| Admin UI (`/#/admin`) | Blocked on public domain; local only |
| Admin backend `:3001` | Binds to `127.0.0.1` only — not reachable from internet |
| Admin token | Stored only in `admin-server/.env` (gitignored) + browser `sessionStorage` |
| Supabase | NOT used in the new application at all |

---

## 💾 Backups

Backups are created automatically before every admin write operation and stored in `backups/` (gitignored, local only). Up to 10 backups are kept. Restore from the Admin Dashboard → Backups tab.

> [!IMPORTANT]
> Restoring a backup does **not** automatically publish to GitHub. You must explicitly click "Publish to GitHub" after verifying the restore.

---

## 🌐 Bilingual Support

- **Arabic (RTL):** Full right-to-left layout, Noto Serif Arabic / Noto Sans Arabic
- **English (LTR):** Inter / Playfair Display
- Language toggle in the header
- Prices: Arabic = `{price} ج.م` · English = `{price} EGP`

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build → `dist/` |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run preview` | Preview production build locally |

---

## 🏷️ Brand Identity

- **Colors:** Warm Cream `#F5F0E8` · Olive Green `#4A5D3A` · Espresso `#3C2A1E` · Antique Gold `#C5A572`
- **Fonts:** Playfair Display + Noto Serif Arabic (headings) · Inter + Noto Sans Arabic (body)
- **Menu UX:** Expandable product cards · dotted price leaders · horizontal category nav · real-time search

---

## 🗂️ Migration Reference

The original menu data was extracted from Supabase once during setup. The extraction scripts are preserved in `migration/` for reference only. **Do not run them again** — the data is already in `public/data/` and `data/`.

```
migration/
├── migrate.mjs             ← One-time extraction script
└── backup/
    ├── raw-backup-latest.json   ← Original Supabase export (reference)
    └── validation-report.json  ← Migration validation results
```
