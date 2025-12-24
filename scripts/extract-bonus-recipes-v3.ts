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

interface TextItem {
  str: string;
  x: number;
  y: number;
}

// The bonus Week 4 PDF page 2 layout (based on screenshot):
// The page is split into 4 quadrants with meals
// Dinner (Tofu Stir-Fry) is bottom-right

const QUADRANTS = {
  'top-left': { xMin: 35, xMax: 295, yMin: 380, yMax: 800 },
  'top-right': { xMin: 300, xMax: 580, yMin: 380, yMax: 800 },
  'bottom-left': { xMin: 35, xMax: 295, yMin: 30, yMax: 379 },
  'bottom-right': { xMin: 300, xMax: 580, yMin: 30, yMax: 379 },
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
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 6) return yDiff;
    return a.x - b.x;
  });

  // Group into lines
  const lines: string[] = [];
  let currentLine = '';
  let lastY = -1;

  for (const item of quadrantItems) {
    if (lastY !== -1 && Math.abs(item.y - lastY) > 6) {
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

function parseRecipeDirectly(text: string, mealName: string): string | null {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  let ingredients: string[] = [];
  let instructions: string[] = [];
  let nutritionInfo = '';
  let servings = '';
  let currentSection: 'unknown' | 'ingredients' | 'instructions' = 'unknown';

  // Instruction action verbs
  const instructionVerbs = ['HEAT', 'COOK', 'ADD', 'STIR', 'MIX', 'COMBINE', 'PLACE', 'SERVE', 'TOP', 'BLEND', 'WHISK', 'BAKE', 'GRILL', 'SAUTE', 'SAUTÉ', 'POUR', 'SPREAD', 'LAYER', 'ARRANGE', 'COVER', 'SIMMER', 'BOIL', 'DRAIN', 'TOSS', 'SEASON', 'COAT', 'SPRAY', 'PREHEAT', 'BRUSH', 'SLICE', 'CHOP', 'DICE', 'FOLD', 'TRANSFER', 'LET', 'SET', 'REMOVE', 'FLIP', 'REDUCE', 'GARNISH'];

  for (const line of lines) {
    // Skip meal type headers
    if (['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'D I N N E R', 'L U N C H', 'B R E A K F A S T', 'S N A C K'].includes(line.toUpperCase().replace(/\s+/g, ' ').trim())) {
      continue;
    }

    // Skip if line contains meal name (it's a title)
    const normalizedLine = line.toLowerCase().replace(/[^\w\s]/g, '');
    const normalizedMealName = mealName.toLowerCase().replace(/[^\w\s]/g, '');
    if (normalizedLine.includes(normalizedMealName) || normalizedMealName.includes(normalizedLine)) {
      continue;
    }

    // Skip "back to TWO servings" notes
    if (line.toLowerCase().includes('back to') && line.toLowerCase().includes('serving')) {
      continue;
    }

    // Capture nutrition info
    if (line.match(/^\d+\s*cal/i) || line.match(/cal\s*[\/|].*protein/i)) {
      nutritionInfo = line;
      continue;
    }

    // Capture servings
    const servingsMatch = line.match(/\((\d+)\s*servings?\)/i);
    if (servingsMatch) {
      servings = `(${servingsMatch[1]} SERVING${servingsMatch[1] === '1' ? '' : 'S'})`;
      continue;
    }

    // Check if this is an instruction (starts with action verb)
    const upperLine = line.toUpperCase();
    const startsWithVerb = instructionVerbs.some(verb =>
      upperLine.startsWith(verb + ' ') || upperLine.startsWith(verb + ',') || upperLine.startsWith(verb + '.')
    );

    if (startsWithVerb) {
      currentSection = 'instructions';
      instructions.push(line);
      continue;
    }

    // Check if it looks like an ingredient
    const ingredientPattern = /^[\d½¼¾⅓⅔⅛⅜⅝⅞]+[\s\-]*(oz|cup|cups|tbsp|tsp|lb|lbs|g|mg|slice|slices|piece|pieces|clove|cloves|can|bunch|handful|pinch|dash|sprig|sprigs|medium|large|small|ear|ears)?/i;
    if (line.match(ingredientPattern)) {
      if (currentSection !== 'instructions') {
        currentSection = 'ingredients';
      }
      if (currentSection === 'ingredients') {
        ingredients.push(line);
      }
      continue;
    }

    // Common ingredients that don't start with numbers
    if (line.match(/^(cooking spray|salt|pepper|olive oil|water|ice|fresh|dried|ground|chopped)/i)) {
      if (currentSection !== 'instructions') {
        ingredients.push(line);
      }
      continue;
    }

    // If we're in instructions section and this line continues it
    if (currentSection === 'instructions' && instructions.length > 0) {
      // Check if this looks like a continuation
      if (!line.match(/^\d/) && line.length > 5) {
        instructions[instructions.length - 1] += ' ' + line;
      }
    }
  }

  if (ingredients.length === 0 && instructions.length === 0) {
    return null;
  }

  // Build formatted recipe
  let recipe = '';

  if (nutritionInfo) {
    recipe += 'Nutritional info: ' + nutritionInfo + '\n';
  }
  if (servings) {
    recipe += servings + '\n';
  }

  recipe += '\nINGREDIENTS:\n';
  for (const ing of ingredients) {
    recipe += '• ' + ing + '\n';
  }

  if (instructions.length > 0) {
    recipe += '\nINSTRUCTIONS:\n';
    for (let i = 0; i < instructions.length; i++) {
      recipe += (i + 1) + '. ' + instructions[i] + '\n';
    }
  }

  return recipe.trim();
}

async function main() {
  // Just test with Tofu Stir-Fry first
  const filePath = path.join(PDF_BASE_PATH, 'PHASE 3', 'Nutrition_bonus week 4.pdf');

  console.log('Loading PDF...');
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  console.log(`PDF has ${pdf.numPages} pages\n`);

  // Tofu Stir-Fry is on page 2, Dinner = bottom-right
  const pageNum = 2;
  const items = await extractPageTextItems(pdf, pageNum);

  console.log('=== RAW TEXT ITEMS ON PAGE 2 ===');
  console.log(`Total items: ${items.length}\n`);

  // Show bottom-right quadrant items
  const bounds = QUADRANTS['bottom-right'];
  const quadrantItems = items.filter(item =>
    item.x >= bounds.xMin &&
    item.x <= bounds.xMax &&
    item.y >= bounds.yMin &&
    item.y <= bounds.yMax
  );

  console.log(`Bottom-right quadrant items (${quadrantItems.length}):`);
  quadrantItems.sort((a, b) => b.y - a.y || a.x - b.x);
  for (const item of quadrantItems.slice(0, 30)) {
    console.log(`  [${item.x.toFixed(0)}, ${item.y.toFixed(0)}] "${item.str}"`);
  }

  console.log('\n=== EXTRACTED QUADRANT TEXT ===');
  const quadrantText = extractQuadrantText(items, 'bottom-right');
  console.log(quadrantText);

  console.log('\n=== PARSED RECIPE ===');
  const recipe = parseRecipeDirectly(quadrantText, 'Tofu Stir-Fry with Broccoli');
  console.log(recipe || 'NO RECIPE PARSED');

  // If successful, update all dinner meals on bonus week 4
  if (recipe) {
    console.log('\n=== UPDATING DATABASE ===');
    const { error } = await supabase
      .from('meals')
      .update({ recipe_text: recipe })
      .eq('name', 'Tofu Stir-Fry with Broccoli')
      .eq('phase_id', 'bonus');

    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Updated Tofu Stir-Fry with Broccoli!');
    }
  }
}

main().catch(console.error);
