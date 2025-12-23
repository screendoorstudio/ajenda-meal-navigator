import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('meals')
    .select('name, recipe_text')
    .not('recipe_text', 'is', null)
    .limit(3);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample recipes:');
  for (let i = 0; i < (data?.length || 0); i++) {
    const meal = data![i];
    console.log('\n=== ' + (i + 1) + '. ' + meal.name + ' ===');
    console.log((meal.recipe_text || '').substring(0, 400) + '...');
  }

  // Count totals
  const { count: withRecipes } = await supabase
    .from('meals')
    .select('*', { count: 'exact', head: true })
    .not('recipe_text', 'is', null);

  const { count: total } = await supabase
    .from('meals')
    .select('*', { count: 'exact', head: true });

  console.log('\n=== Stats ===');
  console.log('Meals with recipes:', withRecipes);
  console.log('Total meals:', total);
}

main();
