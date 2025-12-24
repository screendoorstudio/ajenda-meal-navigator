import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umghgoiipdedbeulyvsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA'
);

async function analyzeMergedRecipes() {
  const { data: meals } = await supabase
    .from('meals')
    .select('id, name, recipe_text, phase_id, week, day, page, meal_type')
    .not('recipe_text', 'is', null)
    .order('phase_id')
    .order('week')
    .order('day');

  // Group by phase_id, week, day, page to find meals sharing the same PDF page
  const pageGroups = new Map<string, any[]>();

  for (const meal of meals || []) {
    const key = `${meal.phase_id}-w${meal.week}-d${meal.day}-p${meal.page}`;
    if (!pageGroups.has(key)) {
      pageGroups.set(key, []);
    }
    pageGroups.get(key)!.push(meal);
  }

  console.log('=== ANALYSIS OF MERGED RECIPES ===\n');

  // Find pages with multiple meals where recipes might be merged
  let problemCount = 0;
  const problemPages: any[] = [];

  for (const [key, meals] of pageGroups) {
    if (meals.length > 1) {
      // Check if any recipes contain another meal's name (indicating merge)
      for (const meal of meals) {
        if (!meal.recipe_text) continue;

        const otherMeals = meals.filter(m => m.id !== meal.id);
        for (const other of otherMeals) {
          // Check if this recipe contains the other meal's name
          const otherNameSimple = other.name.split(' ').slice(0, 2).join(' ');
          if (meal.recipe_text.includes(otherNameSimple) ||
              meal.recipe_text.includes(other.name)) {
            problemPages.push({
              page: key,
              mealId: meal.id,
              mealName: meal.name,
              mealType: meal.meal_type,
              containsOther: other.name,
              otherType: other.meal_type,
              recipeLength: meal.recipe_text.length
            });
            problemCount++;
          }
        }
      }
    }
  }

  console.log(`Found ${problemCount} recipes that contain OTHER meal names (definitely merged)\n`);

  // Show by phase
  const byPhase = new Map<string, number>();
  for (const p of problemPages) {
    const phase = p.page.split('-')[0];
    byPhase.set(phase, (byPhase.get(phase) || 0) + 1);
  }

  console.log('By Phase:');
  for (const [phase, count] of [...byPhase.entries()].sort()) {
    console.log(`  ${phase}: ${count} merged recipes`);
  }

  console.log('\n=== SAMPLE MERGED RECIPES (first 20) ===\n');
  for (const p of problemPages.slice(0, 20)) {
    console.log(`${p.page}: "${p.mealName}" (${p.mealType})`);
    console.log(`  Contains: "${p.containsOther}" (${p.otherType})`);
    console.log(`  Recipe length: ${p.recipeLength} chars`);
    console.log('');
  }

  // Output list of IDs that need fixing
  console.log('\n=== IDs NEEDING FIXES ===\n');
  const uniqueIds = [...new Set(problemPages.map(p => p.mealId))];
  console.log(`Total unique meals to fix: ${uniqueIds.length}`);
  console.log('\nFirst 50 IDs:');
  for (const id of uniqueIds.slice(0, 50)) {
    const p = problemPages.find(x => x.mealId === id);
    console.log(`${id} - ${p?.mealName}`);
  }
}

analyzeMergedRecipes();
