# Ajenda Meal Navigator - Project Documentation

## Project Overview
An interactive web app to help users navigate Dr. Jen Ashton's Ajenda 8-Week Wellness Experiment meal plans. Users can search by ingredients, filter by meal type/nutritional values, view full recipes, and download source PDFs.

**Live URL:** https://ajenda-meal-navigator.vercel.app
**GitHub:** https://github.com/screendoorstudio/ajenda-meal-navigator

---

## Tech Stack
- **Framework:** Next.js 16 with TypeScript, App Router
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (for PDFs)
- **Deployment:** Vercel (screenteam account)

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

## What's Been Built

### Pages
1. **Home** (`/`) - Landing page with stats and feature cards
2. **Browse** (`/browse`) - Grid of all meals with filters
3. **Search** (`/search`) - Ingredient-based search
4. **PDFs** (`/pdfs`) - PDF browser with download links
5. **Meal Detail** (`/meals/[id]`) - Full recipe with nutrition facts

### Filters (on Browse page)
- **Meal Time** - Breakfast, Lunch, Dinner, Snack, Dessert, Party
- **Meal Type** - Smoothie, Salad, Chicken, Stir-Fry, Soup, Toast, Bowl, Wrap, Veggie, Oatmeal, Scramble, Yogurt, Curry, Tacos, Sandwich, Salmon, Tofu, Pasta, Pudding
- **Phase** - Phase 1, Phase 2, Phase 3, Bonus, Month 7-10
- **Plan Type** - Autophagy, Liquid Only, Weight Adjustable, etc.
- **Calories** - Min/Max range
- **Protein** - Minimum grams
- **Quick Filters** - High Protein, Low Cal, Autophagy

### Scripts (in `/scripts/`)
- `import-excel.ts` - Imports meals from Excel to Supabase
- `upload-pdfs.ts` - Uploads PDFs to Supabase Storage
- `extract-recipes.ts` - Extracts recipe text from PDFs
- `check-recipes.ts` - Utility to verify recipe extraction

---

## Current State

### Completed ✅
- [x] Next.js project setup with TypeScript + Tailwind
- [x] Supabase project created and configured
- [x] Database schema with migrations
- [x] 891 meals imported from Excel
- [x] 42 PDFs uploaded to Supabase Storage
- [x] All UI pages built (Home, Browse, Search, PDFs, Meal Detail)
- [x] Filtering by phase, meal time, meal type, plan type, nutrition
- [x] Recipe text extracted from PDFs (712 meals, 80%)
- [x] GitHub repo created and code pushed
- [x] Deployed to Vercel

### Known Issues / Incomplete
- 179 meals don't have recipe text (name mismatch between PDF and Excel)
- Ingredient extraction for advanced search not yet implemented
- No user accounts/favorites (MVP is public-only)

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
│   │   ├── browse/page.tsx       # Browse with filters
│   │   ├── search/page.tsx       # Ingredient search
│   │   ├── pdfs/page.tsx         # PDF browser
│   │   └── meals/[id]/page.tsx   # Meal detail
│   ├── components/
│   │   ├── filters/meal-filters.tsx
│   │   ├── layout/header.tsx
│   │   └── meals/meal-card.tsx, meal-grid.tsx
│   ├── lib/
│   │   ├── constants.ts          # PHASES, MEAL_TIMES, MEAL_CATEGORIES
│   │   └── supabase/client.ts, server.ts
│   └── types/database.ts
├── scripts/                      # Data import/extraction scripts
├── supabase/migrations/          # Database schema
└── .env.local                    # Credentials (not in git)
```

---

## Branding
- Primary color: `--ajenda-red` (#E31837)
- Clean, modern typography matching Ajenda PDF style

---

## Next Session: UI/UX Redesign 🎨
**Priority task when resuming:**
- Redesign the UI pulling from the look and feel of the Ajenda PDFs
- Add modern kitchen minimalist flair
- Reference PDFs at: `/Users/jameswaitzman/Documents/_Claude Projects/Jake/Ajenda Ajent/pdfs/`
- Key PDF design elements to incorporate:
  - Typography and layout from the nutrition guides
  - Color scheme (Ajenda red #E31837 + clean whites/grays)
  - Recipe card styling
  - Professional, health-focused aesthetic

## Future Enhancements (Not Started)
1. Weekly calendar view
2. Shopping list generator
3. User accounts with saved favorites
4. AI-powered ingredient extraction for better search
5. Print-friendly recipe cards

---

## Quick Commands

```bash
# Push to GitHub
git add . && git commit -m "message" && git push

# Check deployment
# Vercel auto-deploys on push to main

# Database queries via Supabase Dashboard
# https://supabase.com/dashboard/project/umghgoiipdedbeulyvsf
```

---

*Last updated: December 23, 2024*
