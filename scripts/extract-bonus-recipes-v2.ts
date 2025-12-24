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

// The bonus PDFs have a 2x2 grid layout:
// TOP-LEFT (Breakfast) | TOP-RIGHT (Snack)
// BOTTOM-LEFT (Lunch)  | BOTTOM-RIGHT (Dinner)
//
// X ranges (approximate):
// Left column: 35-295
// Right column: 305-570
//
// Y ranges (approximate, PDF coordinates are bottom-up):
// Top row: 400-750
// Bottom row: 50-390

interface TextItem {
  str: string;
  x: number;
  y: number;
}

// Column definitions for 2x2 grid
const QUADRANTS = {
  'top-left': { xMin: 35, xMax: 295, yMin: 400, yMax: 800 },      // Breakfast
  'top-right': { xMin: 305, xMax: 580, yMin: 400, yMax: 800 },    // Snack
  'bottom-left': { xMin: 35, xMax: 295, yMin: 50, yMax: 399 },    // Lunch
  'bottom-right': { xMin: 305, xMax: 580, yMin: 50, yMax: 399 },  // Dinner
};

const MEAL_TYPE_TO_QUADRANT: Record<string, string> = {
  'Breakfast': 'top-left',
  'Snack': 'top-right',
  'Lunch': 'bottom-left',
  'Dinner': 'bottom-right',
};

async function extractPageTextItems(pdf: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<TextItem[]> {
  const page = await pdf.getPage(pageNum);
  const textContent = await page.getTextContent();

  const items: TextItem[] = [];
  for (const item of textContent.items as any[]) {
    if (item.str && item.str.trim()) {
      items.push({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
      });
    }
  }

  return items;
}

function extractQuadrantText(items: TextItem[], quadrant: string): string {
  const bounds = QUADRANTS[quadrant as keyof typeof QUADRANTS];
  if (!bounds) return '';

  // Filter items to this quadrant
  const quadrantItems = items.filter(item =>
    item.x >= bounds.xMin &&
    item.x <= bounds.xMax &&
    item.y >= bounds.yMin &&
    item.y <= bounds.yMax
  );

  // Sort by Y (top to bottom), then X (left to right)
  quadrantItems.sort((a, b) => {
    const yDiff = b.y - a.y; // Higher Y = top of page
    if (Math.abs(yDiff) > 8) return yDiff;
    return a.x - b.x;
  });

  // Group into lines
  const lines: string[] = [];
  let currentLine = '';
  let lastY = -1;

  for (const item of quadrantItems) {
    if (lastY !== -1 && Math.abs(item.y - lastY) > 8) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = '';
    }
    currentLine += item.str + ' ';
    lastY = item.y;
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.join('\n');
}

function parseRecipeFromQuadrant(text: string, mealName: string): string | null {
  const lines = text.split('\n');
  const normalizedMealName = mealName.toLowerCase().replace(/[^\w\s]/g, '').trim();

  let foundMeal = false;
  let ingredients: string[] = [];
  let instructions: string[] = [];
  let nutritionInfo = '';
  let servings = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineLower = line.toLowerCase().replace(/[^\w\s]/g, '');

    // Look for the meal name
    if (!foundMeal) {
      if (lineLower.includes(normalizedMealName) || normalizedMealName.includes(lineLower)) {
        foundMeal = true;
        continue;
      }
      // Also check if this line is just the meal type header (BREAKFAST, LUNCH, etc.)
      if (['breakfast', 'lunch', 'dinner', 'snack'].includes(lineLower)) {
        continue;
      }
    }

    if (foundMeal) {
      // Skip empty lines
      if (!line) continue;

      // Capture nutrition info
      if (line.match(/^\d+\s*cal/i) || line.match(/cal\s*\/.*protein/i)) {
        nutritionInfo = line;
        continue;
      }

      // Capture servings
      if (line.match(/\(\d+\s*servings?\)/i) || line.match(/^\(\d+\s*serving/i)) {
        servings = line;
        continue;
      }

      // Check if this is an instruction (starts with action verb in caps)
      const instructionVerbs = ['HEAT', 'COOK', 'ADD', 'STIR', 'MIX', 'COMBINE', 'PLACE', 'SERVE', 'TOP', 'BLEND', 'WHISK', 'BAKE', 'GRILL', 'SAUTE', 'POUR', 'SPREAD', 'LAYER', 'ARRANGE', 'COVER', 'SIMMER', 'BOIL', 'DRAIN', 'TOSS', 'SEASON', 'COAT', 'SPRAY'];

      const startsWithVerb = instructionVerbs.some(verb =>
        line.toUpperCase().startsWith(verb + ' ') || line.toUpperCase().startsWith(verb + ',')
      );

      if (startsWithVerb) {
        instructions.push(line);
        continue;
      }

      // Check if it looks like an ingredient (starts with number/measurement)
      if (line.match(/^[\d½¼¾⅓⅔⅛]+\s*(oz|cup|cups|tbsp|tsp|lb|g|mg|slice|slices|piece|pieces|clove|cloves|can|bunch|handful|pinch|dash|sprig|sprigs|medium|large|small)?/i)) {
        ingredients.push(line);
        continue;
      }

      // Other ingredient patterns
      if (line.match(/^(cooking spray|salt|pepper|olive oil|water|ice)/i)) {
        ingredients.push(line);
        continue;
      }

      // If it's a short line and we're still in ingredients section, add to ingredients
      if (ingredients.length > 0 && instructions.length === 0 && line.length < 60) {
        ingredients.push(line);
        continue;
      }

      // If we're in instructions section, continue adding
      if (instructions.length > 0 && line.length > 10) {
        // Check if this continues the previous instruction
        instructions[instructions.length - 1] += ' ' + line;
      }
    }
  }

  if (!foundMeal || (ingredients.length === 0 && instructions.length === 0)) {
    return null;
  }

  // Build formatted recipe
  let recipe = '';

  if (nutritionInfo) {
    recipe += nutritionInfo + '\n';
  }
  if (servings) {
    recipe += servings + '\n';
  }

  if (ingredients.length > 0) {
    recipe += '\nINGREDIENTS:\n';
    for (const ing of ingredients) {
      recipe += '• ' + ing + '\n';
    }
  }

  if (instructions.length > 0) {
    recipe += '\nINSTRUCTIONS:\n';
    for (let i = 0; i < instructions.length; i++) {
      recipe += (i + 1) + '. ' + instructions[i] + '\n';
    }
  }

  return recipe.trim();
}

async function extractBonusRecipesV2() {
  const bonusPdfs = [
    { file: 'Nutrition Bonus Week.pdf', week: 1 },
    { file: 'Nutrition_bonus week 4.pdf', week: 4 },
  ];

  for (const pdfInfo of bonusPdfs) {
    const filePath = path.join(PDF_BASE_PATH, 'PHASE 3', pdfInfo.file);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing ${pdfInfo.file} (Week ${pdfInfo.week})`);
    console.log('='.repeat(60));

    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }

    // Load PDF
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    console.log(`PDF has ${pdf.numPages} pages\n`);

    // Get meals for this week
    const { data: meals } = await supabase
      .from('meals')
      .select('id, name, page, day, meal_type')
      .eq('phase_id', 'bonus')
      .eq('week', pdfInfo.week)
      .order('page')
      .order('meal_type');

    console.log(`Found ${meals?.length} meals for this week\n`);

    let successCount = 0;
    let failCount = 0;

    for (const meal of meals || []) {
      const pageNum = meal.page;

      if (pageNum < 1 || pageNum > pdf.numPages) {
        console.log(`[SKIP] ${meal.name}: Invalid page ${pageNum}`);
        failCount++;
        continue;
      }

      // Get quadrant based on meal type
      const quadrant = MEAL_TYPE_TO_QUADRANT[meal.meal_type];
      if (!quadrant) {
        console.log(`[SKIP] ${meal.name}: Unknown meal type ${meal.meal_type}`);
        failCount++;
        continue;
      }

      // Extract text items from page
      const items = await extractPageTextItems(pdf, pageNum);

      // Get text from the correct quadrant
      const quadrantText = extractQuadrantText(items, quadrant);

      // Parse the recipe
      const recipe = parseRecipeFromQuadrant(quadrantText, meal.name);

      if (recipe && recipe.length > 50) {
        // Update the meal with the recipe
        const { error } = await supabase
          .from('meals')
          .update({ recipe_text: recipe })
          .eq('id', meal.id);

        if (error) {
          console.log(`[FAIL] ${meal.name}: DB error - ${error.message}`);
          failCount++;
        } else {
          console.log(`[OK] ${meal.name} (${meal.meal_type} -> ${quadrant}, ${recipe.length} chars)`);
          successCount++;
        }
      } else {
        console.log(`[SKIP] ${meal.name}: No recipe found in ${quadrant} quadrant`);
        // Debug: show what text we found
        if (quadrantText) {
          console.log(`       Found text (${quadrantText.length} chars): "${quadrantText.substring(0, 100)}..."`);
        }
        failCount++;
      }
    }

    console.log(`\nWeek ${pdfInfo.week} Summary: ${successCount} success, ${failCount} needs review`);
  }
}

extractBonusRecipesV2().catch(console.error);
