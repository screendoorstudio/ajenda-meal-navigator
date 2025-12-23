/**
 * Extract recipes from PDFs and update the database
 *
 * Usage: npx tsx scripts/extract-recipes.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// PDF folder to phase mapping
const FOLDER_MAPPING: Record<string, string> = {
  'PHASE 1': 'phase-1',
  'PHASE 2': 'phase-2',
  'PHASE 3': 'phase-3',
  'Month 7': 'm7',
  'Month 8': 'm8',
  'Month 9': 'm9',
  'Month 10': 'm10',
};

// Extract week number from filename
function extractWeekNumber(filename: string): number | null {
  const match = filename.match(/[Ww]eek\s*(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  if (filename.toLowerCase().includes('bonus')) {
    return 0;
  }
  return null;
}

async function extractTextFromPdf(pdfPath: string): Promise<{ text: string; numPages: number }> {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const dataBuffer = fs.readFileSync(pdfPath);
  const data = new Uint8Array(dataBuffer);

  const doc = await pdfjsLib.getDocument({ data }).promise;
  let fullText = '';

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: unknown) => (item as { str: string }).str)
      .join(' ');
    fullText += `\n\n[PAGE ${i}]\n${pageText}`;
  }

  return { text: fullText, numPages: doc.numPages };
}

// Extract recipe text for a specific meal from PDF text
function extractRecipeForMeal(pdfText: string, mealName: string, pageNumber: number): string | null {
  // Normalize the meal name for searching
  const normalizedMealName = mealName.toLowerCase().replace(/['']/g, "'");
  const textLower = pdfText.toLowerCase().replace(/['']/g, "'");

  // Try to find the meal name in the text
  const mealIndex = textLower.indexOf(normalizedMealName);
  if (mealIndex === -1) {
    // Try partial match (first 20 chars)
    const partialName = normalizedMealName.substring(0, 20);
    const partialIndex = textLower.indexOf(partialName);
    if (partialIndex === -1) {
      return null;
    }
  }

  // Find the actual index in original text
  const searchIndex = textLower.indexOf(normalizedMealName);
  if (searchIndex === -1) return null;

  // Extract text from meal name to next meal or section
  // Look for patterns that indicate end of recipe (next meal time, page marker, etc.)
  const endPatterns = [
    /\n\s*(breakfast|lunch|dinner|snack|bedtime snack)\s*\(/i,
    /\[PAGE \d+\]/,
    /TODAY'S FEATURED INGREDIENT/i,
    /APPROXIMATE DAILY TOTALS/i,
    /D\s*A\s*Y\s*\d+/,
  ];

  let endIndex = pdfText.length;
  const textFromMeal = pdfText.substring(searchIndex);

  for (const pattern of endPatterns) {
    const match = textFromMeal.substring(50).match(pattern); // Skip first 50 chars to avoid self-match
    if (match && match.index !== undefined) {
      const potentialEnd = match.index + 50;
      if (potentialEnd < endIndex) {
        endIndex = potentialEnd;
      }
    }
  }

  // Extract and clean the recipe text
  let recipeText = textFromMeal.substring(0, endIndex).trim();

  // Clean up the text
  recipeText = recipeText
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\(\s*\d+\s*cal[^)]*\)/gi, '') // Remove calorie info in parentheses
    .replace(/\s*:\s*/g, ': ') // Clean up colons
    .trim();

  // Limit to reasonable length (max 1500 chars)
  if (recipeText.length > 1500) {
    recipeText = recipeText.substring(0, 1500) + '...';
  }

  return recipeText.length > 20 ? recipeText : null;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const pdfDir = path.resolve(__dirname, '../../pdfs');

  console.log('=== Recipe Extraction Script ===\n');

  // Fetch all meals from database
  const { data: meals, error } = await supabase
    .from('meals')
    .select('id, name, phase_id, week, page')
    .order('phase_id')
    .order('week')
    .order('page');

  if (error || !meals) {
    console.error('Failed to fetch meals:', error);
    process.exit(1);
  }

  console.log(`Found ${meals.length} meals in database\n`);

  // Build a cache of PDF texts
  const pdfCache: Record<string, string> = {};
  let successCount = 0;
  let notFoundCount = 0;

  // Process each folder
  const folders = fs.readdirSync(pdfDir);

  for (const folder of folders) {
    const folderPath = path.join(pdfDir, folder);
    if (!fs.statSync(folderPath).isDirectory() || folder.startsWith('.')) continue;

    const phaseId = FOLDER_MAPPING[folder];
    if (!phaseId) continue;

    const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.pdf'));

    for (const file of files) {
      const weekNum = extractWeekNumber(file);
      if (weekNum === null) continue;

      const pdfPath = path.join(folderPath, file);
      const cacheKey = `${phaseId}-${weekNum}`;

      console.log(`Processing: ${folder} Week ${weekNum}...`);

      try {
        const { text } = await extractTextFromPdf(pdfPath);
        pdfCache[cacheKey] = text;

        // Find meals for this phase/week
        const weekMeals = meals.filter(m => m.phase_id === phaseId && m.week === weekNum);

        for (const meal of weekMeals) {
          const recipeText = extractRecipeForMeal(text, meal.name, meal.page);

          if (recipeText) {
            const { error: updateError } = await supabase
              .from('meals')
              .update({ recipe_text: recipeText })
              .eq('id', meal.id);

            if (updateError) {
              console.error(`  Failed to update ${meal.name}:`, updateError.message);
            } else {
              successCount++;
            }
          } else {
            notFoundCount++;
          }
        }
      } catch (err) {
        console.error(`  Error processing ${file}:`, err);
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Recipes extracted: ${successCount}`);
  console.log(`Not found: ${notFoundCount}`);
}

main().catch(console.error);
