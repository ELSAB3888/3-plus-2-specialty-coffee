# 3+2 Specialty Coffee — Deployment & Commercial Feasibility Guide

> **Brand:** 3+2 Specialty Coffee (3 Sisters, 2 Brothers — One Perfect Cup)

This guide provides the official deployment roadmap, hosting evaluation, commercial licensing terms, cost breakdowns, and live verification checklist.

---

## 1. Hosting Architecture & Provider Evaluation

The frontend is a static Single Page Application (SPA) built with Vite, TypeScript, and React. The backend is Supabase (PostgreSQL, GoTrue Auth, and Storage CDN).

| Provider | Commercial Suitability | Free Tier Allowance | Production Plan Cost | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Cloudflare Pages** | **Fully permitted** on Free & Paid tiers | Unlimited bandwidth, 500 builds/mo | $0 / month (Free tier is commercially eligible) | **Top Recommendation** for cost efficiency & ultra-fast CDN in Saudi Arabia / GCC. |
| **Vercel** | **Hobby tier prohibited** for commercial business | Hobby tier is non-commercial only | $20 / member / month (Vercel Pro) | Recommended only if the team already standardizes on Vercel Pro. |
| **Netlify** | Permitted for commercial use | 100GB bandwidth, 300 build mins/mo | $0 / mo (Starter) or $19 / user / mo (Pro) | Excellent alternative with instant Git integration. |
| **Supabase** | Permitted on all tiers | 500MB DB, 1GB Storage, 50k MAU | $0 / mo (Free Tier) or $25 / mo (Pro Tier) | **Free tier is ample** for the digital menu MVP. Upgrade to Pro ($25/mo) if daily menu traffic exceeds 50,000 active visitors/month. |

---

## 2. Total Cost Breakdown

### Minimum Viable Cost (Zero or Near-Zero Initial Run Cost)
- **Frontend Hosting (Cloudflare Pages):** $0.00 / month
- **Backend & Database (Supabase Free Tier):** $0.00 / month
- **Custom Domain (`3plus2coffee.com`):** ~$12.00 / year (~$1.00 / month)
- **Total Initial Recurring Cost:** **~$12 / year (~45 SAR / year)**

### Scaled Commercial Operation (Dedicated High Availability)
- **Frontend Hosting (Cloudflare Pages Pro / Vercel Pro):** $20.00 / month
- **Supabase Pro Plan (No project pausing, 8GB DB, 100GB storage):** $25.00 / month
- **Domain (`3plus2coffee.com` or `.sa`):** ~$25.00 / year
- **Total Production Cost:** **~$45.00 / month (~170 SAR / month)**

---

## 3. Step-by-Step Production Deployment

### Step A: Push Code to GitHub
```bash
git remote add origin https://github.com/USERNAME/3-plus-2-specialty-coffee.git
git branch -M main
git push -u origin main
```

### Step B: Connect Cloudflare Pages (or Netlify/Vercel)
1. Go to Cloudflare Dashboard > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select repository: `3-plus-2-specialty-coffee`.
3. Configure build settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add Environment Variables:
   - `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: `eyJhbGciOi...`
5. Click **Save and Deploy**.

### Step C: Connect Custom Domain & Table QR Code
1. Assign domain `menu.3plus2coffee.com` to the project.
2. In the Admin panel at `/admin/qr`, input `https://menu.3plus2coffee.com/menu`.
3. Generate and print table stand cards.

---

## 4. Live Verification Checklist

Run this 18-point verification once the live deployment is accessible:

- [ ] **1. Welcome Page:** Homepage loads at `/` with "3 Sisters, 2 Brothers" and "One Perfect Cup".
- [ ] **2. Direct QR Access:** Direct navigation to `/menu` opens without login or redirects.
- [ ] **3. Bilingual Toggle:** Switching between English and Arabic changes UI labels instantly.
- [ ] **4. RTL Layout:** Arabic mode properly activates `dir="rtl"` with right-aligned text and Arabic typography.
- [ ] **5. Category Scroll:** Category tabs are horizontally scrollable on mobile devices.
- [ ] **6. Real-time Search:** Typing English or Arabic letters filters products instantly.
- [ ] **7. Price Display:** Single-price items display exact price; multi-size items display "From / يبدأ من".
- [ ] **8. Dotted Leader Lines:** Item names connect to prices via elegant dotted leader lines.
- [ ] **9. Product Accordion:** Tapping an item expands its photography and size options.
- [ ] **10. Independent Extras:** Extras section renders exclusively at the end of the menu.
- [ ] **11. Owner Login:** `/admin/login` validates credentials securely.
- [ ] **12. Route Guard:** Direct access to `/admin` without session redirects to `/admin/login`.
- [ ] **13. Category Management:** Categories can be created, edited, and ordered.
- [ ] **14. Safe Deletion:** Attempting to delete a category containing products is blocked with a warning.
- [ ] **15. Product Management:** Products can be saved with single price or multiple sizes.
- [ ] **16. Visibility Toggle:** Hiding a product in Admin immediately removes it from the public `/menu`.
- [ ] **17. Table QR Generator:** `/admin/qr` generates high-resolution printable table stand cards.
- [ ] **18. SPA Direct Route Refresh:** Refreshing `/menu` or `/admin` in the browser returns HTTP 200 (no 404).
