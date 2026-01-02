import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umghgoiipdedbeulyvsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA'
);

async function fixRecipe(id: string, newRecipeText: string, name: string) {
  const { error } = await supabase
    .from('meals')
    .update({ recipe_text: newRecipeText })
    .eq('id', id);

  if (error) {
    console.error(`Error updating ${name}:`, error);
  } else {
    console.log(`${name} - Recipe updated successfully!`);
  }
}

// Fix 1: Tofu, Kale & Broccoli Stir-Fry (Month 7, Week 4, Day A, Page 3)
// ID: 823c6c03-04e1-49ab-bc97-6a2110bdaab4
const tofuStirFryRecipe = `Tofu, Kale & Broccoli Stir-Fry (2 servings)

INGREDIENTS:
• 2 tsp toasted sesame oil
• 8 oz firm calcium-set tofu, cubed
• 4 cups chopped kale
• 2 cups chopped broccoli
• 3/4 cup shelled edamame
• 2 tbsp low-sodium soy sauce
• Salt and pepper to taste
• 1 cup cooked brown rice

INSTRUCTIONS:
1. HEAT oil in a large skillet over medium-high. Add tofu and stir-fry until crisp, 5-6 minutes.
2. ADD kale, broccoli, and edamame and stir-fry until kale wilts and broccoli is crisp-tender, 4-5 minutes. Stir in soy sauce and salt and pepper.
3. DIVIDE rice evenly between 2 shallow bowls. Top evenly with stir-fry.

Nutritional info per serving: 396 cal / 25g protein / 10g fiber

IF YOU WEIGH ~175 POUNDS: Increase tofu to 10 oz and edamame to 1 cup.`;

// Fix 2: Avocado Toast (Phase 1, Week 4, Day 1, Page 4)
// ID: 76bba502-c114-4a6d-9048-62981798f848
// Current text has "Dinner * TURKEY & QUINOA STUFFED BELL PEPPER" merged at the end - remove it
const avocadoToastRecipe = `Avocado Toast (1 serving)

INGREDIENTS:
• 1 medium slice sourdough (about 39g)
• 1/3 avocado, mashed
• 2 oz grilled tempeh
• 2 slices tomato
• 1 1/2 tsp olive oil
• Sprinkle of red pepper flakes
• 1/4 cup pickled radish

INSTRUCTIONS:
1. TOAST 1 medium slice sourdough (about 39g).
2. TOP with mashed avocado, grilled tempeh, tomato slices, olive oil, and red pepper flakes.
3. SERVE with pickled radish on the side.

Nutritional info per serving: 401 cal / 20g protein / 11g fiber`;

async function main() {
  console.log('Fixing missing/corrupted recipes...\n');

  await fixRecipe(
    '823c6c03-04e1-49ab-bc97-6a2110bdaab4',
    tofuStirFryRecipe,
    'Tofu, Kale & Broccoli Stir-Fry (Month 7, Week 4)'
  );

  await fixRecipe(
    '76bba502-c114-4a6d-9048-62981798f848',
    avocadoToastRecipe,
    'Avocado Toast (Phase 1, Week 4)'
  );

  console.log('\nDone!');
}

main();
