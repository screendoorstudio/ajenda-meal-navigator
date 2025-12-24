import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umghgoiipdedbeulyvsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA'
);

async function findMergedRecipes() {
  const { data: meals } = await supabase
    .from('meals')
    .select('id, name, recipe_text, phase_id, week, day, page, meal_type')
    .not('recipe_text', 'is', null)
    .order('phase_id')
    .order('week')
    .order('day');

  console.log('Looking for recipes with multiple SERVING mentions (likely merged)...\n');

  const mergedRecipes: any[] = [];

  for (const meal of meals || []) {
    if (!meal.recipe_text) continue;

    // Count how many times "SERVING" appears
    const servingMatches = meal.recipe_text.match(/\d+\s*SERVING/gi) || [];

    // Check for very long recipes (likely multiple merged)
    const isVeryLong = meal.recipe_text.length > 1000;

    // Check for multiple nutritional info lines
    const nutritionMatches = meal.recipe_text.match(/\d+\s*cal\s*\/\s*\d+g\s*protein/gi) || [];

    if (servingMatches.length > 1 || nutritionMatches.length > 1) {
      mergedRecipes.push({
        id: meal.id,
        name: meal.name,
        phase: meal.phase_id,
        week: meal.week,
        day: meal.day,
        page: meal.page,
        meal_type: meal.meal_type,
        servingCount: servingMatches.length,
        nutritionCount: nutritionMatches.length,
        length: meal.recipe_text.length,
        preview: meal.recipe_text.substring(0, 150) + '...'
      });
    }
  }

  console.log(`Found ${mergedRecipes.length} potentially merged recipes:\n`);

  for (const r of mergedRecipes) {
    console.log(`[${r.phase}] Week ${r.week} Day ${r.day} - ${r.name} (${r.meal_type})`);
    console.log(`  ID: ${r.id}`);
    console.log(`  SERVING mentions: ${r.servingCount}, Nutrition lines: ${r.nutritionCount}, Length: ${r.length}`);
    console.log(`  Preview: ${r.preview}`);
    console.log('');
  }
}

findMergedRecipes();
