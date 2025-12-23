/**
 * Extract recipes from Mix & Match PDFs (Months 8-10)
 *
 * These PDFs have a multi-column layout where each page has 4 meal options (A, B, C, D).
 * This script extracts text by column position to get the correct recipe for each meal.
 *
 * Usage: npx tsx scripts/extract-mixmatch-recipes.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Column X position ranges (determined by analyzing PDF structure)
const COLUMN_RANGES = [
  { col: 'A', minX: 40, maxX: 155 },
  { col: 'B', minX: 156, maxX: 280 },
  { col: 'C', minX: 281, maxX: 420 },
  { col: 'D', minX: 421, maxX: 570 },
];

// PDF folder to phase mapping
const FOLDER_MAPPING: Record<string, string> = {
  'Month 8': 'm8',
  'Month 9': 'm9',
  'Month 10': 'm10',
};

interface TextItem {
  text: string;
  x: number;
  y: number;
}

interface ParsedRecipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  nutritionalInfo: string | null;
}

function extractWeekNumber(filename: string): number | null {
  const match = filename.match(/[Ww]eek\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : null;
}

async function extractPageByColumns(pdfPath: string, pageNum: number): Promise<Map<string, string>> {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

  const dataBuffer = fs.readFileSync(pdfPath);
  const data = new Uint8Array(dataBuffer);
  const doc = await pdfjsLib.getDocument({ data }).promise;

  if (pageNum > doc.numPages) {
    return new Map();
  }

  const page = await doc.getPage(pageNum);
  const textContent = await page.getTextContent();

  // Extract items with position
  const items: TextItem[] = textContent.items
    .map((item: unknown) => {
      const i = item as { str: string; transform: number[] };
      return {
        text: i.str,
        x: Math.round(i.transform[4]),
        y: Math.round(i.transform[5]),
      };
    })
    .filter((i: TextItem) => i.text.trim().length > 0);

  // Group items by column
  const columnTexts = new Map<string, TextItem[]>();
  for (const colDef of COLUMN_RANGES) {
    columnTexts.set(colDef.col, []);
  }

  for (const item of items) {
    for (const colDef of COLUMN_RANGES) {
      if (item.x >= colDef.minX && item.x <= colDef.maxX) {
        columnTexts.get(colDef.col)!.push(item);
        break;
      }
    }
  }

  // Convert each column's items to text (sorted by Y position, top to bottom)
  const result = new Map<string, string>();
  for (const [col, colItems] of columnTexts) {
    // Sort by Y (descending = top to bottom) then X
    colItems.sort((a, b) => {
      if (Math.abs(a.y - b.y) < 8) return a.x - b.x;
      return b.y - a.y;
    });

    // Join into lines
    const lines: string[] = [];
    let currentLine = '';
    let currentY: number | null = null;

    for (const item of colItems) {
      if (currentY !== null && Math.abs(item.y - currentY) > 8) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = item.text;
      } else {
        currentLine += (currentLine ? ' ' : '') + item.text;
      }
      currentY = item.y;
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    result.set(col, lines.join('\n'));
  }

  return result;
}

function parseRecipeFromColumn(columnText: string, mealName: string): string | null {
  const lines = columnText.split('\n');

  // Find where this recipe starts (look for the meal name)
  const normalizedMealName = mealName.toLowerCase().replace(/[''&]/g, '').replace(/\s+/g, ' ');
  let startIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const normalizedLine = lines[i].toLowerCase().replace(/[''&]/g, '').replace(/\s+/g, ' ');
    // Check if this line contains the meal name (or significant part of it)
    const mealWords = normalizedMealName.split(' ').filter(w => w.length > 2);
    const matchCount = mealWords.filter(word => normalizedLine.includes(word)).length;
    if (matchCount >= Math.min(2, mealWords.length) || normalizedLine.includes(normalizedMealName.substring(0, 15))) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) {
    // Try finding just the first major word
    const firstWord = normalizedMealName.split(' ')[0];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(firstWord)) {
        startIndex = i;
        break;
      }
    }
  }

  if (startIndex === -1) {
    return null;
  }

  // Extract from start to "Nutritional info" or "IF YOU WEIGH" or end
  const recipeLines: string[] = [];
  let foundNutritionalInfo = false;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];

    // Stop at "IF YOU WEIGH" section
    if (line.includes('IF YOU WEIGH') || line.includes('IF  YOU WEIGH')) {
      break;
    }

    // Include nutritional info then stop
    if (line.toLowerCase().includes('nutritional info') || foundNutritionalInfo) {
      recipeLines.push(line);
      if (line.includes('fiber')) {
        break;
      }
      foundNutritionalInfo = true;
      continue;
    }

    // Skip page headers
    if (line.includes('MONTH') || line.includes('MEAL PLAN') || line.includes('CHOOSE ONE')) {
      continue;
    }

    // Skip single letter column markers
    if (/^[A-D]$/.test(line.trim())) {
      continue;
    }

    recipeLines.push(line);
  }

  if (recipeLines.length === 0) {
    return null;
  }

  // Join and clean up the recipe text
  let recipeText = recipeLines.join(' ')
    .replace(/\s+/g, ' ')
    .replace(/- /g, '') // Remove hyphenation
    .replace(/\s*:\s*/g, ': ')
    .trim();

  // Clean up common OCR artifacts
  recipeText = recipeText
    .replace(/Nu tritional/g, 'Nutritional')
    .replace(/me -\s*dium/g, 'medium')
    .replace(/pep -\s*per/g, 'pepper')
    .replace(/be -\s*ginning/g, 'beginning');

  return recipeText.length > 30 ? recipeText : null;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Try to load from CLAUDE.md documentation
    const url = 'https://umghgoiipdedbeulyvsf.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA';
    var supabase = createClient(url, key);
  } else {
    var supabase = createClient(supabaseUrl, supabaseKey);
  }

  const pdfDir = path.resolve(__dirname, '../../pdfs');

  console.log('=== Mix & Match Recipe Extraction ===\n');

  // Get all meals without recipes in Months 8-10
  const { data: meals, error } = await supabase
    .from('meals')
    .select('id, name, phase_id, week, page, day')
    .in('phase_id', ['m8', 'm9', 'm10'])
    .is('recipe_text', null)
    .order('phase_id')
    .order('week')
    .order('page')
    .order('day');

  if (error || !meals) {
    console.error('Failed to fetch meals:', error);
    process.exit(1);
  }

  console.log(`Found ${meals.length} meals without recipes\n`);

  // Group meals by phase/week/page to determine column order
  const groupedMeals: Record<string, typeof meals> = {};
  for (const meal of meals) {
    const key = `${meal.phase_id}-${meal.week}-${meal.page}`;
    if (!groupedMeals[key]) groupedMeals[key] = [];
    groupedMeals[key].push(meal);
  }

  let successCount = 0;
  let failCount = 0;
  const failures: string[] = [];

  // Process each PDF
  for (const folder of Object.keys(FOLDER_MAPPING)) {
    const phaseId = FOLDER_MAPPING[folder];
    const folderPath = path.join(pdfDir, folder);

    if (!fs.existsSync(folderPath)) {
      console.log(`Folder not found: ${folder}`);
      continue;
    }

    const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.pdf'));

    for (const file of files) {
      const weekNum = extractWeekNumber(file);
      if (weekNum === null) continue;

      const pdfPath = path.join(folderPath, file);
      console.log(`\nProcessing: ${folder} Week ${weekNum}`);

      // Get unique pages that need extraction for this week
      const weekMeals = meals.filter(m => m.phase_id === phaseId && m.week === weekNum);
      const pages = [...new Set(weekMeals.map(m => m.page))];

      for (const pageNum of pages) {
        // Extract columns for this page
        const columns = await extractPageByColumns(pdfPath, pageNum);

        // Get meals for this page (in order - this determines column assignment)
        const pageMeals = groupedMeals[`${phaseId}-${weekNum}-${pageNum}`] || [];

        // Assign columns based on order: first meal = A, second = B, etc.
        const columnLetters = ['A', 'B', 'C', 'D'];

        for (let i = 0; i < pageMeals.length && i < 4; i++) {
          const meal = pageMeals[i];
          const columnLetter = columnLetters[i];
          const columnText = columns.get(columnLetter);

          if (!columnText) {
            console.log(`  [SKIP] ${meal.name} - No column ${columnLetter} text`);
            failCount++;
            failures.push(`${meal.name} (no column text)`);
            continue;
          }

          const recipeText = parseRecipeFromColumn(columnText, meal.name);

          if (recipeText) {
            const { error: updateError } = await supabase
              .from('meals')
              .update({ recipe_text: recipeText })
              .eq('id', meal.id);

            if (updateError) {
              console.log(`  [ERROR] ${meal.name}: ${updateError.message}`);
              failCount++;
              failures.push(`${meal.name} (db error)`);
            } else {
              console.log(`  [OK] ${meal.name} (Col ${columnLetter}, ${recipeText.length} chars)`);
              successCount++;
            }
          } else {
            console.log(`  [SKIP] ${meal.name} - Could not extract from column ${columnLetter}`);
            failCount++;
            failures.push(`${meal.name} (extraction failed)`);
          }
        }

        // Handle any extra meals beyond 4 columns (shouldn't happen but just in case)
        if (pageMeals.length > 4) {
          for (let i = 4; i < pageMeals.length; i++) {
            console.log(`  [SKIP] ${pageMeals[i].name} - No column (more than 4 meals on page)`);
            failCount++;
            failures.push(`${pageMeals[i].name} (extra meal)`);
          }
        }
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Successfully extracted: ${successCount}`);
  console.log(`Failed/skipped: ${failCount}`);

  if (failures.length > 0 && failures.length <= 20) {
    console.log('\nFailed meals:');
    failures.forEach(f => console.log(`  - ${f}`));
  }
}

main().catch(console.error);
