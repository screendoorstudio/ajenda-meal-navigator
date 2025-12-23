/**
 * Formats raw recipe text extracted from PDFs into structured, readable format.
 *
 * The raw text typically contains:
 * - Recipe name with serving size: "Recipe Name (1 SERVING)"
 * - Ingredients listed inline
 * - Instructions in ALL CAPS (HEAT, MIX, POUR, etc.)
 * - Nutritional info: "Nutritional info per serving: XXX cal / XXg protein / XXg fiber"
 * - Sometimes multiple recipes concatenated together
 */

interface FormattedRecipe {
  title: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
  nutritionalInfo?: string;
}

// Common instruction verbs that start recipe steps (in ALL CAPS in original)
const INSTRUCTION_VERBS = [
  'HEAT', 'COOK', 'MIX', 'STIR', 'ADD', 'POUR', 'WHISK', 'BLEND', 'COMBINE',
  'PLACE', 'SPREAD', 'TOP', 'SERVE', 'BAKE', 'ROAST', 'GRILL', 'BROIL',
  'SAUTÉ', 'SAUTE', 'SIMMER', 'BOIL', 'FRY', 'STEAM', 'PREHEAT', 'SEASON',
  'SLICE', 'CHOP', 'DICE', 'CUT', 'DRAIN', 'RINSE', 'TOSS', 'FOLD',
  'LAYER', 'ARRANGE', 'TRANSFER', 'REMOVE', 'LET', 'COVER', 'SET',
  'REFRIGERATE', 'FREEZE', 'CHILL', 'WARM', 'MELT', 'BRUSH', 'COAT',
  'SPRINKLE', 'DRIZZLE', 'GARNISH', 'DIVIDE', 'ROLL', 'WRAP', 'STUFF',
  'MASH', 'PUREE', 'PULSE', 'PROCESS', 'BEAT', 'CREAM', 'KNEAD',
  'SHAPE', 'FORM', 'FLATTEN', 'PRESS', 'SQUEEZE', 'STRAIN', 'SOAK',
  'MARINATE', 'RUB', 'MASSAGE', 'SCORE', 'PIERCE', 'FLIP', 'TURN',
  'REDUCE', 'THICKEN', 'BRING', 'RETURN', 'REPEAT', 'CONTINUE',
  'IN', 'USING', 'WORKING', 'MEANWHILE', 'WHILE', 'ONCE', 'WHEN', 'AFTER'
];

// Measurement patterns for identifying ingredients
const MEASUREMENT_PATTERN = /^(\d+\/?\d*|\d+\s*\/\s*\d+|\d+\.?\d*)\s*(tsp|tbsp|cup|cups|oz|ounce|ounces|lb|lbs|pound|pounds|g|gram|grams|mg|ml|liter|liters|slice|slices|piece|pieces|small|medium|large|clove|cloves|bunch|bunches|can|cans|package|pkg|container|bag|box|jar|bottle|head|stalk|stalks|sprig|sprigs|pinch|dash|handful|serving|servings)s?\b/i;

/**
 * Check if recipe text contains garbage from PDF extraction
 */
function isGarbageText(text: string): boolean {
  // Reject text with YES NO patterns (from PDF checkbox grids)
  if (/YES\s+NO\s+YES\s+NO/i.test(text)) return true;

  // Reject text with "TRACK YOUR THOUGHTS" (PDF footer)
  if (/TRACK YOUR THOUGHTS/i.test(text)) return true;

  // Reject text that's mostly ALL CAPS meal names concatenated
  const allCapsWords = text.match(/\b[A-Z]{2,}(?:\s+[A-Z]{2,}){2,}\b/g) || [];
  if (allCapsWords.length > 5) return true;

  return false;
}

/**
 * Parse raw recipe text into structured format
 */
export function parseRecipe(rawText: string, mealName: string): FormattedRecipe | null {
  if (!rawText || !mealName) return null;

  // Reject garbage text from bad PDF extraction
  if (isGarbageText(rawText)) return null;

  // Try to extract just this recipe (stop at next recipe or end)
  let recipeText = extractSingleRecipe(rawText, mealName);

  // Find serving info
  const servingMatch = recipeText.match(/\((\d+\s*SERVINGS?)\)/i);
  const servings = servingMatch ? servingMatch[1] : '1 SERVING';

  // Remove the title and serving from the text
  const titlePattern = new RegExp(`${escapeRegex(mealName)}\\s*\\(\\d+\\s*SERVINGS?\\)`, 'i');
  recipeText = recipeText.replace(titlePattern, '').trim();

  // Extract nutritional info
  let nutritionalInfo: string | undefined;
  const nutritionMatch = recipeText.match(/Nutritional info per serving:\s*([^L\n]+)/i);
  if (nutritionMatch) {
    nutritionalInfo = nutritionMatch[1].trim();
    recipeText = recipeText.substring(0, recipeText.indexOf('Nutritional info')).trim();
  }

  // Split into ingredients and instructions
  const { ingredients, instructions } = splitIngredientsAndInstructions(recipeText);

  return {
    title: mealName,
    servings,
    ingredients,
    instructions,
    nutritionalInfo
  };
}

/**
 * Extract just the recipe for this meal from potentially concatenated text
 */
function extractSingleRecipe(fullText: string, mealName: string): string {
  // Find where this recipe starts
  const startIndex = fullText.toLowerCase().indexOf(mealName.toLowerCase());
  if (startIndex === -1) {
    // Recipe name not found, return full text
    return fullText;
  }

  let recipeText = fullText.substring(startIndex);

  // Find where the next recipe might start (after nutritional info)
  // Look for patterns like "L U N C H", "D I N N E R", "B R E A K F A S T", "S N A C K"
  // or another recipe title after nutritional info
  const nextMealMarkers = [
    /\bL\s*U\s*N\s*C\s*H\b/,
    /\bD\s*I\s*N\s*N\s*E\s*R\b/,
    /\bB\s*R\s*E\s*A\s*K\s*F\s*A\s*S\s*T\b/,
    /\bS\s*N\s*A\s*C\s*K\b/,
    /\bD\s*E\s*S\s*S\s*E\s*R\s*T\b/,
  ];

  // Find nutritional info first
  const nutritionIndex = recipeText.search(/Nutritional info per serving:/i);
  if (nutritionIndex !== -1) {
    // Look for next recipe marker after nutritional info
    const afterNutrition = recipeText.substring(nutritionIndex);
    const fiberMatch = afterNutrition.match(/\d+g?\s*fiber/i);

    if (fiberMatch && fiberMatch.index !== undefined) {
      const endOfNutrition = nutritionIndex + fiberMatch.index + fiberMatch[0].length;

      // Check if there's another meal marker after
      for (const marker of nextMealMarkers) {
        const markerMatch = recipeText.substring(endOfNutrition).match(marker);
        if (markerMatch && markerMatch.index !== undefined) {
          recipeText = recipeText.substring(0, endOfNutrition);
          break;
        }
      }

      // Also check for another (X SERVING) pattern which indicates new recipe
      const nextServingMatch = recipeText.substring(endOfNutrition).match(/\(\d+\s*SERVINGS?\)/i);
      if (nextServingMatch && nextServingMatch.index !== undefined) {
        // Find the recipe name before this serving indicator
        recipeText = recipeText.substring(0, endOfNutrition);
      }
    }
  }

  return recipeText;
}

/**
 * Split recipe text into ingredients and instructions
 */
function splitIngredientsAndInstructions(text: string): { ingredients: string[], instructions: string[] } {
  const ingredients: string[] = [];
  const instructions: string[] = [];

  // Find where instructions start - look for ALL CAPS verb at start of a "sentence"
  // Instructions typically start with verbs like HEAT, COOK, MIX etc in all caps
  const instructionStartPattern = /\b(HEAT|COOK|MIX|STIR|ADD|POUR|WHISK|BLEND|COMBINE|PLACE|SPREAD|TOP|SERVE|BAKE|ROAST|GRILL|BROIL|SAUTÉ|SAUTE|SIMMER|BOIL|PREHEAT|TOSS|LAYER|TRANSFER|COVER|MELT|BRUSH|SPRINKLE|DRIZZLE|DIVIDE|MASH|BEAT|BRING)\s/;

  const instructionMatch = text.match(instructionStartPattern);
  let instructionStart = instructionMatch?.index ?? -1;

  // Split text into ingredients and instructions sections
  let ingredientText = instructionStart > 0 ? text.substring(0, instructionStart) : '';
  let instructionText = instructionStart > 0 ? text.substring(instructionStart) : text;

  // Parse ingredients - they follow patterns like "1 tsp olive oil" or "1/2 cup milk"
  if (ingredientText) {
    // Match ingredient patterns: number (with optional fraction) + unit + ingredient name
    // Look for: digit, optional space, optional slash+digit (fraction), space, unit word
    const ingredientPattern = /(\d+\s*\/?\s*\d*\s*(?:tsp|tbsp|cup|cups|oz|ounces?|lb|lbs?|pounds?|g|grams?|mg|ml|liters?|slices?|pieces?|small|medium|large|cloves?|bunch|bunches|cans?|packages?|pkg|heads?|stalks?|sprigs?|pinch|dash|handful)[s]?\s+[^0-9]+?)(?=\d+\s*\/?\s*\d*\s*(?:tsp|tbsp|cup|cups|oz|ounces?|lb|lbs?|pounds?|g|grams?|mg|ml|liters?|slices?|pieces?|small|medium|large|cloves?|bunch|bunches|cans?|packages?|pkg|heads?|stalks?|sprigs?|pinch|dash|handful)|$)/gi;

    let match;
    while ((match = ingredientPattern.exec(ingredientText)) !== null) {
      const cleaned = match[1].trim();
      if (cleaned && cleaned.length > 3) {
        ingredients.push(formatIngredient(cleaned));
      }
    }

    // If regex didn't work well, try simpler splitting
    if (ingredients.length === 0) {
      // Split on patterns that look like start of ingredient (number + space)
      const parts = ingredientText.split(/(?=\d+\s*\/?\s*\d*\s+(?:tsp|tbsp|cup|oz|lb|slice|piece|small|medium|large|clove|bunch|can|package|head|stalk|sprig|pinch|dash))/i);
      for (const part of parts) {
        const cleaned = part.trim();
        if (cleaned && cleaned.length > 3 && /^\d/.test(cleaned)) {
          ingredients.push(formatIngredient(cleaned));
        }
      }
    }

    // Handle "Salt and pepper to taste" type ingredients without measurements
    if (ingredientText.includes('Salt and pepper')) {
      const saltMatch = ingredientText.match(/Salt and pepper[^0-9]*/i);
      if (saltMatch) {
        const cleaned = saltMatch[0].trim();
        if (!ingredients.some(i => i.toLowerCase().includes('salt and pepper'))) {
          ingredients.push(cleaned);
        }
      }
    }
  }

  // Parse instructions - split on sentence-ending patterns followed by ALL CAPS verbs
  if (instructionText) {
    // Split on periods/sentence ends followed by ALL CAPS instruction verbs
    const sentencePattern = /\.\s*(?=[A-Z]{2,})/g;
    const instructionParts = instructionText.split(sentencePattern);

    for (const part of instructionParts) {
      const cleaned = part.trim();
      if (cleaned && cleaned.length > 10) {
        instructions.push(formatInstruction(cleaned));
      }
    }

    // If that didn't work well, just keep as single instruction
    if (instructions.length === 0 && instructionText.length > 10) {
      instructions.push(formatInstruction(instructionText));
    }
  }

  return { ingredients, instructions };
}

/**
 * Format a single ingredient line
 */
function formatIngredient(text: string): string {
  // Capitalize first letter, clean up spacing
  let cleaned = text.trim();

  // Fix fraction spacing (1 / 2 -> 1/2)
  cleaned = cleaned.replace(/(\d)\s*\/\s*(\d)/g, '$1/$2');

  // Ensure proper spacing after measurements
  cleaned = cleaned.replace(/(\d)(tsp|tbsp|cup|oz|lb|g|ml)/gi, '$1 $2');

  // Remove "Salt and pepper to taste" from end if it got concatenated
  cleaned = cleaned.replace(/\s+Salt and pepper.*$/i, '');

  return cleaned;
}

/**
 * Format a single instruction step
 */
function formatInstruction(text: string): string {
  let cleaned = text.trim();

  // Convert ALL CAPS verbs to sentence case
  for (const verb of INSTRUCTION_VERBS) {
    const pattern = new RegExp(`\\b${verb}\\b`, 'g');
    cleaned = cleaned.replace(pattern, verb.charAt(0).toUpperCase() + verb.slice(1).toLowerCase());
  }

  // Ensure ends with period
  if (cleaned && !cleaned.endsWith('.') && !cleaned.endsWith('!')) {
    cleaned += '.';
  }

  return cleaned;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Convert parsed recipe to formatted HTML/JSX-friendly structure
 */
export function formatRecipeForDisplay(rawText: string, mealName: string): {
  ingredients: string[];
  instructions: string[];
} | null {
  const parsed = parseRecipe(rawText, mealName);
  if (!parsed) return null;

  return {
    ingredients: parsed.ingredients,
    instructions: parsed.instructions
  };
}
