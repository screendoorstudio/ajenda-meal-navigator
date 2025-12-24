import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const PDF_BASE_PATH = '/Users/jameswaitzman/Documents/_Claude Projects/Jake/Ajenda Ajent/pdfs';

// Normalize meal names for matching
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/&/g, 'and')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract text from a single page
async function extractPageText(pdf: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<string> {
  const page = await pdf.getPage(pageNum);
  const textContent = await page.getTextContent();

  // Sort by Y position (top to bottom), then X (left to right)
  const items = textContent.items as Array<{ str: string; transform: number[] }>;
  items.sort((a, b) => {
    const yDiff = b.transform[5] - a.transform[5];
    if (Math.abs(yDiff) > 5) return yDiff;
    return a.transform[4] - b.transform[4];
  });

  let text = '';
  let lastY = -1;
  for (const item of items) {
    const y = Math.round(item.transform[5]);
    if (lastY !== -1 && Math.abs(y - lastY) > 5) {
      text += '\n';
    }
    text += item.str + ' ';
    lastY = y;
  }
  return text;
}

// Find recipe for a meal on a page
function findRecipeOnPage(pageText: string, mealName: string): string | null {
  const normalizedMealName = normalizeName(mealName);
  const lines = pageText.split('\n');

  let foundMeal = false;
  let recipeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const normalizedLine = normalizeName(line);

    // Check if this line contains the meal name
    if (!foundMeal && normalizedLine.includes(normalizedMealName)) {
      foundMeal = true;
      continue;
    }

    if (foundMeal) {
      // Stop if we hit another meal header or end of content
      if (line.match(/^\d+\s*cal/i) || line.match(/^(breakfast|lunch|dinner|snack)/i)) {
        // This might be the nutrition info for current meal, include it
        if (line.match(/^\d+\s*cal/i)) {
          recipeLines.push(line);
        }
        continue;
      }

      // Stop at next major section
      if (line.match(/^day\s+\d/i) || line.match(/^week\s+\d/i)) {
        break;
      }

      // Check if we hit another recipe title (all caps or specific patterns)
      const commonMealWords = ['smoothie', 'bowl', 'salad', 'wrap', 'scramble', 'yogurt', 'oatmeal', 'parfait', 'toast'];
      const isNewMealTitle = commonMealWords.some(word =>
        normalizedLine.includes(word) && normalizedLine !== normalizedMealName && normalizedLine.length < 50
      );

      if (isNewMealTitle && recipeLines.length > 3) {
        break;
      }

      if (line.length > 0) {
        recipeLines.push(line);
      }
    }
  }

  if (recipeLines.length < 2) {
    return null;
  }

  return recipeLines.join('\n').trim();
}

async function extractBonusRecipes() {
  const bonusPdfs = [
    { file: 'Nutrition Bonus Week.pdf', week: 1 },
    { file: 'Nutrition_bonus week 4.pdf', week: 4 },
  ];

  for (const pdfInfo of bonusPdfs) {
    const filePath = path.join(PDF_BASE_PATH, 'PHASE 3', pdfInfo.file);
    console.log(`\n=== Processing ${pdfInfo.file} (Week ${pdfInfo.week}) ===\n`);

    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }

    // Load PDF
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    console.log(`PDF has ${pdf.numPages} pages`);

    // Get meals for this week
    const { data: meals } = await supabase
      .from('meals')
      .select('id, name, page, day')
      .eq('phase_id', 'bonus')
      .eq('week', pdfInfo.week)
      .is('recipe_text', null)
      .order('page')
      .order('name');

    console.log(`Found ${meals?.length} meals without recipes\n`);

    let successCount = 0;
    let failCount = 0;

    for (const meal of meals || []) {
      const pageNum = meal.page;

      if (pageNum < 1 || pageNum > pdf.numPages) {
        console.log(`Invalid page ${pageNum} for ${meal.name}`);
        failCount++;
        continue;
      }

      const pageText = await extractPageText(pdf, pageNum);
      const recipe = findRecipeOnPage(pageText, meal.name);

      if (recipe && recipe.length > 20) {
        // Update the meal with the recipe
        const { error } = await supabase
          .from('meals')
          .update({ recipe_text: recipe })
          .eq('id', meal.id);

        if (error) {
          console.log(`[FAIL] ${meal.name}: DB error - ${error.message}`);
          failCount++;
        } else {
          console.log(`[OK] ${meal.name} (${recipe.length} chars)`);
          successCount++;
        }
      } else {
        console.log(`[SKIP] ${meal.name}: No recipe found on page ${pageNum}`);
        failCount++;
      }
    }

    console.log(`\nWeek ${pdfInfo.week} Summary: ${successCount} success, ${failCount} failed`);
  }
}

extractBonusRecipes().catch(console.error);
