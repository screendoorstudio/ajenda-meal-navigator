import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umghgoiipdedbeulyvsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA'
);

async function main() {
  const { data: meals } = await supabase
    .from('meals')
    .select('name, phase_id, week, day, meal_type')
    .is('recipe_text', null)
    .order('phase_id')
    .order('week')
    .order('day');

  console.log('Meals with null recipe_text:\n');
  let currentPhase = '';
  for (const m of meals || []) {
    if (m.phase_id !== currentPhase) {
      currentPhase = m.phase_id;
      console.log('\n=== ' + currentPhase.toUpperCase() + ' ===');
    }
    console.log(`Week ${m.week}, Day ${m.day}: ${m.name} (${m.meal_type})`);
  }
  console.log('\nTotal:', meals?.length);
}

main();
