import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umghgoiipdedbeulyvsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA'
);

async function checkRecipe(name: string) {
  const { data } = await supabase
    .from('meals')
    .select('id, name, recipe_text, phase_id, week, day, page')
    .ilike('name', `%${name}%`);

  for (const meal of data || []) {
    console.log('=== ' + meal.name + ' ===');
    console.log('ID:', meal.id);
    console.log('Phase:', meal.phase_id, 'Week:', meal.week, 'Day:', meal.day, 'Page:', meal.page);
    console.log('Recipe text:');
    console.log(meal.recipe_text);
    console.log('');
  }
}

checkRecipe(process.argv[2] || 'Chicken Pozole');
