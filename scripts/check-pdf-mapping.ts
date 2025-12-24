import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkPdfMapping() {
  // Find meals with no recipe text that might have PDFs
  const { data: mealsWithoutRecipe } = await supabase
    .from('meals')
    .select('id, name, phase_id, week, day, page')
    .is('recipe_text', null)
    .order('phase_id')
    .order('week');

  console.log(`Found ${mealsWithoutRecipe?.length} meals without recipe text\n`);

  // Get all PDFs in the database
  const { data: allPdfs } = await supabase
    .from('weekly_pdfs')
    .select('*')
    .order('phase_id')
    .order('week_number');

  console.log('PDFs in database:');
  for (const pdf of allPdfs || []) {
    console.log(`  ${pdf.phase_id} Week ${pdf.week_number}: ${pdf.pdf_url ? 'HAS URL' : 'NO URL'}`);
  }

  // Check physical PDF files
  const pdfBasePath = '/Users/jameswaitzman/Documents/_Claude Projects/Jake/Ajenda Ajent/pdfs';
  console.log('\n\nPhysical PDF files:');

  const folders = fs.readdirSync(pdfBasePath);
  for (const folder of folders) {
    const folderPath = path.join(pdfBasePath, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      console.log(`\n${folder}/`);
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.pdf'));
      for (const file of files) {
        console.log(`  - ${file}`);
      }
    }
  }

  // Check specific case: Tofu Stir-Fry with Broccoli
  console.log('\n\n=== Specific Check: Tofu Stir-Fry with Broccoli ===');
  const { data: meal } = await supabase
    .from('meals')
    .select('*')
    .ilike('name', '%Tofu Stir-Fry with Broccoli%')
    .single();

  if (meal) {
    console.log(`Meal: ${meal.name}`);
    console.log(`Phase: ${meal.phase_id}, Week: ${meal.week}, Day: ${meal.day}, Page: ${meal.page}`);
    console.log(`Has recipe_text: ${!!meal.recipe_text}`);

    // Check PDF for this phase/week
    const { data: pdf } = await supabase
      .from('weekly_pdfs')
      .select('*')
      .eq('phase_id', meal.phase_id)
      .eq('week_number', meal.week)
      .single();

    console.log(`PDF record: ${pdf ? JSON.stringify(pdf) : 'NOT FOUND'}`);
  }

  // Find all phase/week combinations that are missing PDF records
  console.log('\n\n=== Missing PDF Records ===');
  const { data: mealsByPhaseWeek } = await supabase
    .from('meals')
    .select('phase_id, week')
    .order('phase_id')
    .order('week');

  const uniquePhaseWeeks = new Set<string>();
  for (const m of mealsByPhaseWeek || []) {
    uniquePhaseWeeks.add(`${m.phase_id}|${m.week}`);
  }

  for (const pw of uniquePhaseWeeks) {
    const [phaseId, week] = pw.split('|');
    const { data: pdf } = await supabase
      .from('weekly_pdfs')
      .select('pdf_url')
      .eq('phase_id', phaseId)
      .eq('week_number', parseInt(week))
      .single();

    if (!pdf || !pdf.pdf_url) {
      console.log(`Missing/No URL: ${phaseId} Week ${week}`);
    }
  }
}

checkPdfMapping();
