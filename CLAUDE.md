# Ajenda Ajent - Project Documentation

## IMPORTANT: First Message Prompt

**When starting a new session, ask the user:**

> "Do you have a new month of content ready to upload? If so, please confirm:
> 1. A new folder (e.g., 'Month 11') has been added to the PDFs folder
> 2. The Excel sheet (Ajenda_Meal_Plan_Index) has been updated with new meals
>
> If yes, I'll import the new meals, upload the PDFs, extract recipes, and update the site stats."

---

## Project Overview
An interactive web app to help users navigate Dr. Jen Ashton's Ajenda Wellness Experiment meal plans. Users can search by ingredients, filter by meal type/nutritional values, view full recipes, and download source PDFs.

**Live URL:** https://ajenda-meal-navigator.vercel.app
**GitHub:** https://github.com/screendoorstudio/ajenda-meal-navigator
**Official Ajenda Site:** https://www.joinajenda.com/

---

## Current Stats (as of Dec 23, 2024)
- **Total Meals:** 891
- **Meals with Recipes:** 789
- **PDFs:** 42
- **Phases:** Phase 1-3, Bonus, Month 7-10

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
- `recipe_text` - Extracted from PDFs (789 meals have recipes)
- `search_vector` - Full-text search (auto-populated via trigger)

---

## Data Sources
- **Excel Index:** `/Users/jameswaitzman/Documents/_Claude Projects/Jake/Ajenda Ajent/Ajenda_Meal_Plan_Index (1).xlsx`
  - Contains all meals with nutritional data
- **PDFs:** `/Users/jameswaitzman/Documents/_Claude Projects/Jake/Ajenda Ajent/pdfs/`
  - Organized in folders: PHASE 1, PHASE 2, PHASE 3, Month 7, Month 8, Month 9, Month 10
- **Logo Files:** `/Users/jameswaitzman/Documents/_Claude Projects/Jake/Ajenda Ajent/logo/`
  - `Ajenda-AJENT_logo.png` - Main logo (red circle)
  - `Ajenda-AJENT-1_white.png` - White version for dark backgrounds

---

## Adding New Month Content

When the user has a new month ready (e.g., Month 11):

### Step 1: Import New Meals from Excel
```bash
# The import script reads the Excel file and upserts meals to database
npx tsx scripts/import-excel.ts
```

### Step 2: Upload New PDFs
```bash
# Uploads PDFs from the new month folder to Supabase Storage
npx tsx scripts/upload-pdfs.ts
```

### Step 3: Extract Recipes from PDFs
```bash
# Standard extraction for regular PDFs
npx tsx scripts/extract-recipes.ts

# Column-based extraction for Mix & Match PDFs (4-column layout)
npx tsx scripts/extract-mixmatch-recipes.ts
```

### Step 4: Update Site Stats
Update the meal count in `src/app/page.tsx` (line ~51) to reflect new total:
```tsx
<span className="text-2xl sm:text-3xl font-bold value">891</span>  // Update this number
<span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Meals</span>
```

### Step 5: Verify and Deploy
```bash
npm run build
git add . && git commit -m "Add Month 11 content" && git push
```

---

## Design System

### Branding
- **Site Name:** Ajenda Ajent
- **Tagline:** The Wellness Experiment (links to joinajenda.com)
- **Logo:** Red circle with "AJENDA AJENT" text
- All mentions of "Dr. Jen Ashton" and "Wellness Experiment" link to https://www.joinajenda.com/

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

---

## What's Been Built

### Pages
1. **Home** (`/`) - Hero with logo, circular stats (891 Meals, 42 PDFs, 10 Months, 4 Meal Types)
2. **Browse** (`/browse`) - Grid of all meals with filters sidebar
3. **Search** (`/search`) - Ingredient-based search
4. **PDFs** (`/pdfs`) - PDF browser grouped by phase
5. **Meal Detail** (`/meals/[id]`) - Circular nutrition stats, two-column recipe
6. **About** (`/about`) - Disclaimer (fan-made, not affiliated)

### Components
- `header.tsx` - Ajenda Ajent logo image, "THE WELLNESS EXPERIMENT" link, nav
- `footer.tsx` - White logo, disclaimers (fan-made + nutritional/medical), navigation, credits
- `meal-card.tsx` - Card with meal type badge, nutrition badges
- `meal-grid.tsx` - Responsive grid with loading skeletons
- `meal-filters.tsx` - Black bar header, filter inputs, quick filter buttons

### Footer Disclaimers
The footer contains two disclaimer sections:
1. **Fan disclaimer:** "This website was created as a helpful tool by a fan of Dr. Jen Ashton's Ajenda Wellness Experiment..."
2. **Medical disclaimer:** "Nutritional counts are approximate. This plan is informational only and not medical advice..."

---

## Scripts (in `/scripts/`)

### Data Import
- `import-excel.ts` - Imports meals from Excel to Supabase
- `upload-pdfs.ts` - Uploads PDFs to Supabase Storage
- `upload-bonus-pdfs.ts` - Uploads bonus week PDFs specifically

### Recipe Extraction
- `extract-recipes.ts` - Standard recipe extraction from PDFs
- `extract-mixmatch-recipes.ts` - Column-based extraction for Mix & Match PDFs
- `extract-bonus-recipes.ts` - Extracts recipes from bonus week PDFs
- `extract-bonus-recipes-v2.ts` - Quadrant-based extraction for 2x2 grid layouts
- `extract-bonus-recipes-v3.ts` - Debug version with coordinate logging

### Utilities
- `check-recipes.ts` - Verify recipe extraction stats
- `check-pdf-mapping.ts` - Check PDF to meal mappings
- `fix-bonus-pdfs.ts` - Fix bonus PDF database records
- `cleanup-disclaimer.ts` - Remove disclaimer text from recipe entries

---

## Session Log: December 23, 2024 (Continued)

### Branding Updates
1. Updated site name from "Meal Navigator" to "Ajenda Ajent"
2. Added new logo image (`/public/ajenda-ajent-logo.png`) replacing CSS-based logo
3. Added white logo variant (`/public/ajenda-ajent-logo-white.png`) for footer
4. Updated metadata title in layout.tsx

### Hyperlinks Added
- "The Wellness Experiment" text now links to https://www.joinajenda.com/
- "Dr. Jen Ashton" mentions now link to https://www.joinajenda.com/
- Links appear in: header, home page hero, footer, about page

### Recipe Cleanup
- Removed medical disclaimer text from 14 recipe entries in database
- Added the disclaimer to the footer instead (appears on all pages)
- Created `cleanup-disclaimer.ts` script for this purpose

### Stats Correction
- Fixed home page stat from "600+ Recipes" to "891 Meals"
- Now matches the browse page count

### Bonus PDF Work
- Uploaded bonus week PDFs to Supabase Storage
- Created database records for bonus weeks 1 and 4
- Extracted recipes from bonus PDFs (39 of 56 meals)
- Created quadrant-based extraction for 2x2 grid PDF layouts

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

---

## File Structure

```
ajenda-meal-navigator/
├── public/
│   ├── ajenda-ajent-logo.png       # Main logo
│   └── ajenda-ajent-logo-white.png # White logo for footer
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

## Quick Commands

```bash
# Push to GitHub (triggers Vercel deploy)
git add . && git commit -m "message" && git push

# Check Vercel deployments
npx vercel list --scope screenteam

# Database queries via Supabase Dashboard
# https://supabase.com/dashboard/project/umghgoiipdedbeulyvsf

# Get current meal counts
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://umghgoiipdedbeulyvsf.supabase.co', 'SERVICE_ROLE_KEY');
const { count: total } = await supabase.from('meals').select('*', { count: 'exact', head: true });
const { count: withRecipes } = await supabase.from('meals').select('*', { count: 'exact', head: true }).not('recipe_text', 'is', null);
console.log('Total:', total, 'With recipes:', withRecipes);
"
```

---

## Future Enhancements (Not Started)
1. Weekly calendar view
2. Shopping list generator
3. User accounts with saved favorites
4. AI-powered ingredient extraction for better search
5. Print-friendly recipe cards
6. Fix remaining ~23 Month 10 Mix & Match recipes with different layouts

---

*Last updated: December 23, 2024*
