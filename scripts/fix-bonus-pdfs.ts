import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PDF_BASE_PATH = '/Users/jameswaitzman/Documents/_Claude Projects/Jake/Ajenda Ajent/pdfs';

async function fixBonusPdfs() {
  // First, let's see what bonus phase meals exist
  const { data: bonusMeals } = await supabase
    .from('meals')
    .select('phase_id, week, name')
    .eq('phase_id', 'bonus')
    .order('week')
    .order('name');

  console.log('Bonus meals by week:');
  const weekCounts: Record<number, number> = {};
  for (const m of bonusMeals || []) {
    weekCounts[m.week] = (weekCounts[m.week] || 0) + 1;
  }
  console.log(weekCounts);

  // Map bonus PDFs in PHASE 3 folder
  const phase3Path = path.join(PDF_BASE_PATH, 'PHASE 3');
  const files = fs.readdirSync(phase3Path);

  console.log('\nBonus PDF files in PHASE 3 folder:');
  const bonusPdfs = files.filter(f => f.toLowerCase().includes('bonus'));
  for (const pdf of bonusPdfs) {
    console.log(`  - ${pdf}`);
  }

  // The mapping should be:
  // "Nutrition Bonus Week.pdf" -> bonus Week 1 (or maybe Week 0?)
  // "Nutrition_bonus week 2.pdf" -> bonus Week 2
  // "Nutrition_bonus week 4.pdf" -> bonus Week 4
  // "Nutrition_bonus weeks 2-3 part 2.pdf" -> bonus Week 3?

  // Check existing bonus PDF records
  const { data: existingBonusPdfs } = await supabase
    .from('weekly_pdfs')
    .select('*')
    .eq('phase_id', 'bonus');

  console.log('\nExisting bonus PDF records:', existingBonusPdfs);

  // Check what needs to be uploaded
  console.log('\n=== Action Plan ===');

  // Check if PDFs are already in storage
  const { data: storageFiles } = await supabase.storage
    .from('pdfs')
    .list('', { limit: 100 });

  console.log('\nPDFs in Supabase storage:');
  for (const f of storageFiles || []) {
    console.log(`  - ${f.name}`);
  }

  // Let's check the meals that are missing recipes and are in bonus phase
  const { data: bonusMealsNoRecipe } = await supabase
    .from('meals')
    .select('id, name, phase_id, week, day, page')
    .eq('phase_id', 'bonus')
    .is('recipe_text', null)
    .order('week')
    .order('day');

  console.log('\nBonus meals missing recipes:');
  for (const m of bonusMealsNoRecipe || []) {
    console.log(`  Week ${m.week} Day ${m.day}: ${m.name} (page ${m.page})`);
  }
}

fixBonusPdfs();
