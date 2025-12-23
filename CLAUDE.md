# Ajenda Meal Navigator - Project Documentation

## Project Overview
An interactive web app to help users navigate Dr. Jen Ashton's Ajenda Wellness Experiment meal plans. Users can search by ingredients, filter by meal type/nutritional values, view full recipes, and download source PDFs.

**Live URL:** https://ajenda-meal-navigator.vercel.app
**GitHub:** https://github.com/screendoorstudio/ajenda-meal-navigator

---

## Tech Stack
- **Framework:** Next.js 16 with TypeScript, App Router
- **Styling:** Tailwind CSS v4 with CSS custom properties
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (for PDFs)
- **Deployment:** Vercel (screenteam account)
- **Fonts:** Geist Sans, Geist Mono, Playfair Display (serif)

---

## Supabase Configuration
- **Project Name:** Ajenda-Ajent
- **Project URL:** https://umghgoiipdedbeulyvsf.supabase.co
- **Project Ref:** umghgoiipdedbeulyvsf

### Environment Variables (in `.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://umghgoiipdedbeulyvsf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDcyNDYsImV4cCI6MjA4MjA4MzI0Nn0.KhOz9pwVdpJqdJg9rp4Fn61QW0AOWeoZ-pcluFv-NEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA
```

---

## Database Schema

### Tables
1. **phases** - 8 phases (Phase 1-3, Bonus, Month 7-10)
2. **weekly_pdfs** - Links to PDF files in Supabase Storage (42 PDFs)
3. **meals** - Main table with 891 meals, nutritional info, recipe text
4. **ingredients** - Normalized ingredient list (for future use)
5. **meal_ingredients** - Junction table (for future use)

### Key Fields in `meals` table:
- `id`, `name`, `meal_type` (Breakfast/Lunch/Dinner/Snack/Dessert/Party)
- `phase_id`, `week`, `day`, `page`
- `calories`, `protein_g`, `fiber_g`
- `plan_type` (Autophagy, Liquid-Only, Wt. Adj. Avail., etc.)
- `recipe_text` - Extracted from PDFs (712 meals have recipes)
- `search_vector` - Full-text search (auto-populated via trigger)

---

## Data Sources
- **Excel Index:** `/Users/jameswaitzman/Documents/_Claude Projects/Jake/Ajenda Ajent/Ajenda_Meal_Plan_Index (1).xlsx`
  - 891 meals with nutritional data
- **PDFs:** `/Users/jameswaitzman/Documents/_Claude Projects/Jake/Ajenda Ajent/pdfs/`
  - 42 PDFs across Phase 1-3 and Month 7-10 folders

---

## Design System (Updated Dec 23, 2024)

### Color Palette
```css
/* Brand Colors */
--ajenda-red: #E31837;
--ajenda-red-dark: #C01530;
--ajenda-red-light: #FEE2E2;

/* PDF Blue (from original PDFs) */
--ajenda-blue: #1E3A5F;
--ajenda-blue-light: #3B82A0;
--ajenda-blue-tint: #E0EDF4;

/* Scandinavian Neutrals */
--scandi-cream: #FAF8F5;      /* Page background */
--scandi-linen: #F5F0E8;      /* Header, card backgrounds */
--scandi-oak: #D4C4A8;        /* Borders, accents */
--scandi-birch: #E8DFD0;      /* Hover states */
--scandi-warm-gray: #7A7066;  /* Muted text */
--scandi-charcoal: #3D3A36;   /* Headings, footer */
```

### Typography
- **Geist Sans** - Body text, UI elements
- **Playfair Display** (italic) - Elegant serif for titles, section headers
- Utility classes: `.heading-serif`, `.label-uppercase`, `.section-header-bar`

### Key Design Elements
1. **Circular Ajenda Logo** - Red border circle with "AJENDA" text
2. **Black Bar Section Headers** - Charcoal background, white uppercase text
3. **Circular Callout Stats** - Blue-bordered circles for nutrition facts
4. **Two-Column Recipe Layout** - Ingredients (with checkboxes) | Instructions

---

## What's Been Built

### Pages
1. **Home** (`/`) - Hero with logo, circular stats, feature cards
2. **Browse** (`/browse`) - Grid of all meals with filters sidebar
3. **Search** (`/search`) - Ingredient-based search
4. **PDFs** (`/pdfs`) - PDF browser grouped by phase
5. **Meal Detail** (`/meals/[id]`) - Circular nutrition stats, two-column recipe
6. **About** (`/about`) - Disclaimer (fan-made, not affiliated)

### Components
- `header.tsx` - Circular logo, "THE WELLNESS EXPERIMENT" subhead, nav
- `footer.tsx` - Disclaimer, navigation, "Made by Screendoor Studio Inc.", year
- `meal-card.tsx` - Card with meal type badge, nutrition badges
- `meal-grid.tsx` - Responsive grid with loading skeletons
- `meal-filters.tsx` - Black bar header, filter inputs, quick filter buttons

### Utilities
- `src/lib/utils/format-recipe.ts` - Parses recipe text into ingredients/instructions
  - Handles fractions, measurements, ALL CAPS instruction verbs
  - Filters out garbage text (YES NO patterns from PDF extraction)

### Scripts (in `/scripts/`)
- `import-excel.ts` - Imports meals from Excel to Supabase
- `upload-pdfs.ts` - Uploads PDFs to Supabase Storage
- `extract-recipes.ts` - Extracts recipe text from PDFs
- `extract-mixmatch-recipes.ts` - Column-based extraction for Mix & Match PDFs
- `check-recipes.ts` - Utility to verify recipe extraction

---

## Current State

### Completed ✅
- [x] Next.js project setup with TypeScript + Tailwind
- [x] Supabase project created and configured
- [x] Database schema with migrations
- [x] 891 meals imported from Excel
- [x] 42 PDFs uploaded to Supabase Storage
- [x] All UI pages built (Home, Browse, Search, PDFs, Meal Detail, About)
- [x] Filtering by phase, meal time, meal type, plan type, nutrition
- [x] Recipe text extracted from PDFs (712 meals, 80%)
- [x] Recipe formatting utility (ingredients vs instructions parsing)
- [x] Mix & Match column-based recipe extraction (136 additional recipes)
- [x] UI Redesign: Scandinavian kitchen + PDF aesthetic
- [x] Circular Ajenda logo matching PDF branding
- [x] Footer with disclaimer and credits
- [x] GitHub repo created and code pushed
- [x] Deployed to Vercel

### Known Issues / Incomplete
- ~23 meals from Month 10 Mix & Match have different PDF layouts (extraction incomplete)
- Ingredient extraction for advanced search not yet implemented
- No user accounts/favorites (MVP is public-only)

---

## Session Log: December 23, 2024

### Recipe Formatting Fixes
1. Created `format-recipe.ts` to parse recipe text into ingredients/instructions
2. Fixed fraction parsing (e.g., "1/3 cup" was being split incorrectly)
3. Cleared "YES NO YES NO" garbage text from 101 meals (caused by PDF checkbox grids)
4. Added `isGarbageText()` safeguard to reject bad patterns

### Mix & Match Recipe Extraction
- Created `extract-mixmatch-recipes.ts` for column-based PDF extraction
- Month 8-10 PDFs have 4-column layout (A, B, C, D meals)
- Used X-position ranges to isolate columns: A(40-155), B(156-280), C(281-420), D(421-570)
- Successfully extracted 136 of 159 Mix & Match recipes

### UI Redesign
- Added Playfair Display serif font for elegant titles
- Implemented Scandinavian warm neutral color palette
- Created PDF-style black bar section headers
- Added circular callout stats for nutrition facts
- Implemented two-column recipe layout with checkbox ingredients
- Created circular Ajenda logo (matching PDF branding)
- Added "THE WELLNESS EXPERIMENT" subhead

### About Page & Footer
- Created About page with fan disclaimer
- Added footer with: disclaimer, navigation, Screendoor Studio credit, current year

---

## Running Locally

```bash
# Navigate to project
cd "/Users/jameswaitzman/Documents/_Claude Projects/Jake/Ajenda Ajent/ajenda-meal-navigator"

# Install dependencies
npm install

# Start dev server
npm run dev
# App runs at http://localhost:3000

# Build for production
npm run build
```

### Running Scripts

```bash
# Import Excel data (already done)
npx tsx scripts/import-excel.ts

# Upload PDFs (already done)
npx tsx scripts/upload-pdfs.ts

# Extract recipes from PDFs (already done)
npx tsx scripts/extract-recipes.ts

# Extract Mix & Match recipes (column-based)
npx tsx scripts/extract-mixmatch-recipes.ts

# Check recipe stats
npx tsx scripts/check-recipes.ts
```

---

## File Structure

```
ajenda-meal-navigator/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home
│   │   ├── about/page.tsx        # About/Disclaimer
│   │   ├── browse/page.tsx       # Browse with filters
│   │   ├── search/page.tsx       # Ingredient search
│   │   ├── pdfs/page.tsx         # PDF browser
│   │   ├── meals/[id]/page.tsx   # Meal detail
│   │   ├── layout.tsx            # Root layout with header/footer
│   │   └── globals.css           # Design system, CSS variables
│   ├── components/
│   │   ├── filters/meal-filters.tsx
│   │   ├── layout/header.tsx, footer.tsx
│   │   └── meals/meal-card.tsx, meal-grid.tsx
│   ├── lib/
│   │   ├── constants.ts          # PHASES, MEAL_TIMES, MEAL_CATEGORIES
│   │   ├── utils/format-recipe.ts # Recipe parsing utility
│   │   └── supabase/client.ts, server.ts
│   └── types/database.ts
├── scripts/                      # Data import/extraction scripts
├── supabase/migrations/          # Database schema
└── .env.local                    # Credentials (not in git)
```

---

## Future Enhancements (Not Started)
1. Weekly calendar view
2. Shopping list generator
3. User accounts with saved favorites
4. AI-powered ingredient extraction for better search
5. Print-friendly recipe cards
6. Fix remaining 23 Month 10 Mix & Match recipes

---

## Quick Commands

```bash
# Push to GitHub (triggers Vercel deploy)
git add . && git commit -m "message" && git push

# Check Vercel deployments
npx vercel list --scope screenteam

# Database queries via Supabase Dashboard
# https://supabase.com/dashboard/project/umghgoiipdedbeulyvsf
```

---

*Last updated: December 23, 2024*
