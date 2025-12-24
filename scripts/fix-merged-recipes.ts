import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umghgoiipdedbeulyvsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA'
);

// Instruction verbs that start recipe steps
const INSTRUCTION_VERBS = [
  'ADD', 'ARRANGE', 'BAKE', 'BEAT', 'BLEND', 'BOIL', 'BRING', 'BROIL', 'BRUSH',
  'CHOP', 'COAT', 'COMBINE', 'COOK', 'COVER', 'CUT', 'DICE', 'DIVIDE', 'DRAIN',
  'DRIZZLE', 'ENJOY', 'FILL', 'FLIP', 'FOLD', 'FRY', 'GARNISH', 'GRILL', 'HEAT',
  'LADLE', 'LAYER', 'LET', 'MASH', 'MIX', 'PLACE', 'POUR', 'PREHEAT', 'PRESS',
  'REDUCE', 'REMOVE', 'ROAST', 'ROLL', 'SAUTE', 'SAUTÉ', 'SEASON', 'SERVE',
  'SIMMER', 'SLICE', 'SPREAD', 'SPRINKLE', 'STIR', 'STUFF', 'TOSS', 'TOP',
  'TRANSFER', 'WARM', 'WHISK'
];

function extractMealRecipe(fullText: string, mealName: string, allMealNames: string[]): string | null {
  if (!fullText || !mealName) return null;

  // Normalize the meal name for searching
  const normalizedMealName = mealName.replace(/['']/g, "'").replace(/[""]/g, '"');

  // Find where this meal's content starts
  let startIndex = fullText.indexOf(normalizedMealName);
  if (startIndex === -1) {
    // Try simpler match
    const simpleName = mealName.split(' ').slice(0, 3).join(' ');
    startIndex = fullText.indexOf(simpleName);
  }
  if (startIndex === -1) {
    // Try uppercase version
    startIndex = fullText.toUpperCase().indexOf(mealName.toUpperCase());
  }
  if (startIndex === -1) return null;

  // Find where to end - look for another meal name or end markers
  let endIndex = fullText.length;

  // Check for other meal names
  for (const otherName of allMealNames) {
    if (otherName === mealName) continue;

    const otherIndex = fullText.indexOf(otherName, startIndex + mealName.length + 50);
    if (otherIndex > startIndex && otherIndex < endIndex) {
      endIndex = otherIndex;
    }

    // Also check uppercase version
    const otherIndexUpper = fullText.toUpperCase().indexOf(otherName.toUpperCase(), startIndex + mealName.length + 50);
    if (otherIndexUpper > startIndex && otherIndexUpper < endIndex) {
      endIndex = otherIndexUpper;
    }
  }

  // Also look for "Nutritional info per serving:" as a boundary after the first one
  const nutritionPattern = /Nutritional info per serving:/gi;
  let match;
  let nutritionCount = 0;
  while ((match = nutritionPattern.exec(fullText)) !== null) {
    if (match.index > startIndex) {
      nutritionCount++;
      // The second nutritional info line likely belongs to another recipe
      if (nutritionCount > 1 && match.index < endIndex) {
        endIndex = match.index;
        break;
      }
    }
  }

  // Extract the content
  let extracted = fullText.substring(startIndex, endIndex).trim();

  // Clean up - remove partial text from next recipe
  // Look for the last complete sentence (ends with period, before nutritional info)
  const lastNutrition = extracted.lastIndexOf('Nutritional info per serving:');
  if (lastNutrition > 0) {
    // Find the end of the nutritional line
    const afterNutrition = extracted.substring(lastNutrition);
    const fiberMatch = afterNutrition.match(/\d+g\s*fiber/i);
    if (fiberMatch) {
      const fiberEnd = lastNutrition + (fiberMatch.index || 0) + fiberMatch[0].length;
      extracted = extracted.substring(0, fiberEnd);
    }
  }

  return extracted.trim();
}

function formatRecipe(rawText: string, mealName: string): string {
  if (!rawText) return '';

  let text = rawText;

  // Remove meal name from start if present
  if (text.startsWith(mealName)) {
    text = text.substring(mealName.length).trim();
  }

  // Extract serving info
  const servingMatch = text.match(/\((\d+)\s*SERVINGS?\)/i);
  const servings = servingMatch ? servingMatch[0].toUpperCase() : '';
  if (servingMatch) {
    text = text.replace(servingMatch[0], '').trim();
  }

  // Extract nutritional info
  const nutritionMatch = text.match(/Nutritional info per serving:\s*(\d+\s*cal\s*\/\s*\d+g\s*protein\s*\/\s*\d+g\s*fiber)/i);
  const nutrition = nutritionMatch ? nutritionMatch[1] : '';
  if (nutritionMatch) {
    text = text.replace(nutritionMatch[0], '').trim();
  }

  // Split into ingredients and instructions
  const ingredients: string[] = [];
  const instructions: string[] = [];
  let inInstructions = false;

  // Split by common patterns
  const parts = text.split(/(?=\d+\.\s*[A-Z])|(?=[A-Z]{3,}\s)/);

  for (let part of parts) {
    part = part.trim();
    if (!part) continue;

    // Check if this starts an instruction (numbered or verb)
    const isNumbered = /^\d+\.\s*[A-Z]/.test(part);
    const startsWithVerb = INSTRUCTION_VERBS.some(verb =>
      part.toUpperCase().startsWith(verb + ' ') ||
      part.toUpperCase().startsWith(verb + ',')
    );

    if (isNumbered || startsWithVerb) {
      inInstructions = true;
      // Clean the instruction
      let instruction = part.replace(/^\d+\.\s*/, '').trim();
      instructions.push(instruction);
    } else if (!inInstructions) {
      // Parse as ingredients - split by measurements
      const ingredientParts = part.split(/(?=\d+[\s\/½¼¾⅓⅔⅛]+(?:oz|cup|cups|tbsp|tsp|lb|g|mg|clove|cloves|medium|large|small)?)/i);
      for (const ing of ingredientParts) {
        const cleaned = ing.trim();
        if (cleaned && cleaned.length > 2) {
          ingredients.push(cleaned);
        }
      }
    } else {
      // Continue last instruction
      if (instructions.length > 0) {
        instructions[instructions.length - 1] += ' ' + part;
      }
    }
  }

  // Build formatted output
  let result = '';

  if (servings) {
    result += servings + '\n\n';
  }

  if (ingredients.length > 0) {
    result += 'INGREDIENTS:\n';
    for (const ing of ingredients) {
      result += '• ' + ing + '\n';
    }
    result += '\n';
  }

  if (instructions.length > 0) {
    result += 'INSTRUCTIONS:\n';
    for (let i = 0; i < instructions.length; i++) {
      result += (i + 1) + '. ' + instructions[i] + '\n';
    }
    result += '\n';
  }

  if (nutrition) {
    result += 'Nutritional info per serving: ' + nutrition;
  }

  return result.trim();
}

async function fixMergedRecipes(dryRun = true) {
  // Get all meals grouped by page
  const { data: meals } = await supabase
    .from('meals')
    .select('id, name, recipe_text, phase_id, week, day, page, meal_type')
    .not('recipe_text', 'is', null)
    .order('phase_id')
    .order('week')
    .order('day');

  // Group by page
  const pageGroups = new Map<string, any[]>();
  for (const meal of meals || []) {
    const key = `${meal.phase_id}-w${meal.week}-d${meal.day}-p${meal.page}`;
    if (!pageGroups.has(key)) {
      pageGroups.set(key, []);
    }
    pageGroups.get(key)!.push(meal);
  }

  let fixedCount = 0;
  let skippedCount = 0;

  for (const [pageKey, pageMeals] of pageGroups) {
    // Only process pages with multiple meals
    if (pageMeals.length <= 1) continue;

    const allMealNames = pageMeals.map(m => m.name);

    for (const meal of pageMeals) {
      if (!meal.recipe_text) continue;

      // Check if this recipe contains other meal names (merged)
      const otherNames = allMealNames.filter(n => n !== meal.name);
      const isMerged = otherNames.some(other =>
        meal.recipe_text.includes(other) ||
        meal.recipe_text.toUpperCase().includes(other.toUpperCase())
      );

      if (!isMerged) continue;

      // Extract just this meal's recipe
      const extractedText = extractMealRecipe(meal.recipe_text, meal.name, allMealNames);

      if (!extractedText || extractedText.length < 50) {
        console.log(`[SKIP] ${meal.name}: Could not extract clean recipe`);
        skippedCount++;
        continue;
      }

      // Check if the extracted text is significantly shorter (indicates successful separation)
      if (extractedText.length >= meal.recipe_text.length * 0.9) {
        console.log(`[SKIP] ${meal.name}: Extraction didn't significantly reduce text`);
        skippedCount++;
        continue;
      }

      console.log(`[FIX] ${meal.name}`);
      console.log(`  Before: ${meal.recipe_text.length} chars`);
      console.log(`  After: ${extractedText.length} chars`);
      console.log(`  Preview: ${extractedText.substring(0, 100)}...`);

      if (!dryRun) {
        const { error } = await supabase
          .from('meals')
          .update({ recipe_text: extractedText })
          .eq('id', meal.id);

        if (error) {
          console.log(`  ERROR: ${error.message}`);
        } else {
          console.log(`  UPDATED`);
          fixedCount++;
        }
      } else {
        fixedCount++;
      }
      console.log('');
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`${dryRun ? 'Would fix' : 'Fixed'}: ${fixedCount} recipes`);
  console.log(`Skipped: ${skippedCount} recipes`);

  if (dryRun) {
    console.log('\nRun with --apply to actually update the database');
  }
}

const dryRun = !process.argv.includes('--apply');
console.log(dryRun ? '=== DRY RUN MODE ===' : '=== APPLYING FIXES ===');
console.log('');

fixMergedRecipes(dryRun);
