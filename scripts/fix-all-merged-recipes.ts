import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umghgoiipdedbeulyvsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA'
);

async function fixMergedRecipes() {
  // Find all recipes with merged content (containing "Dinner *", "Lunch *", etc.)
  const { data: meals } = await supabase
    .from('meals')
    .select('id, name, recipe_text, phase_id, week, day')
    .not('recipe_text', 'is', null);

  let fixedCount = 0;
  const mergedPatterns = [
    /\s*(Dinner|Lunch|Breakfast|Snack)\s+\*\s*[A-Z].*/gi,
    /\s*APPROXIMATE DAILY TOTALS:.*$/gi,
    /\s*PLAN AHEAD:.*$/gi,
  ];

  for (const meal of meals || []) {
    let recipeText = meal.recipe_text;
    let needsUpdate = false;

    // Check for merged patterns
    for (const pattern of mergedPatterns) {
      if (pattern.test(recipeText)) {
        needsUpdate = true;
        recipeText = recipeText.replace(pattern, '');
      }
      // Reset regex lastIndex
      pattern.lastIndex = 0;
    }

    // Also clean up trailing whitespace
    recipeText = recipeText.trim();

    if (needsUpdate && recipeText !== meal.recipe_text) {
      const { error } = await supabase
        .from('meals')
        .update({ recipe_text: recipeText })
        .eq('id', meal.id);

      if (error) {
        console.error(`Error updating ${meal.name}:`, error);
      } else {
        console.log(`Fixed: ${meal.name} (${meal.phase_id}, Week ${meal.week}, Day ${meal.day})`);
        fixedCount++;
      }
    }
  }

  console.log(`\nTotal recipes fixed: ${fixedCount}`);
}

fixMergedRecipes();
