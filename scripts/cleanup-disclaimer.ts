import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const DISCLAIMER_TEXT = `Nutritional counts are approximate. This plan is informational only and not medical advice. Consult a healthcare professional before changing your diet—especially if you're pregnant, under 18, on GLP-1, or taking blood thinners, or if you have other health concerns. If you take blood thinners, please discuss your intake of vitamin K–rich foods (such as leafy greens) with your doctor.`;

async function cleanupDisclaimer() {
  // Find all recipes containing the disclaimer text
  const { data: meals, error } = await supabase
    .from('meals')
    .select('id, name, recipe_text')
    .ilike('recipe_text', '%Nutritional counts are approximate%');

  if (error) {
    console.error('Error fetching meals:', error);
    return;
  }

  console.log(`Found ${meals?.length || 0} meals with disclaimer text\n`);

  if (!meals || meals.length === 0) {
    console.log('No recipes need cleanup.');
    return;
  }

  let cleanedCount = 0;

  for (const meal of meals) {
    if (!meal.recipe_text) continue;

    // Show first match to debug
    if (cleanedCount === 0) {
      console.log('Sample recipe text:');
      console.log(meal.recipe_text.substring(0, 500));
      console.log('---');
    }

    // Remove the disclaimer text - search for "Nutritional counts are approximate" through end
    let cleanedText = meal.recipe_text
      // Remove from "Nutritional counts" to end of the disclaimer (greedy match to doctor.)
      .replace(/Nutritional counts are approximate\.[\s\S]*?with your doctor\./gi, '')
      // Clean up extra whitespace/newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (cleanedText !== meal.recipe_text) {
      console.log(`Cleaning: ${meal.name}`);
      console.log(`  Before: ${meal.recipe_text.length} chars`);
      console.log(`  After: ${cleanedText.length} chars`);

      const { error: updateError } = await supabase
        .from('meals')
        .update({ recipe_text: cleanedText })
        .eq('id', meal.id);

      if (updateError) {
        console.log(`  ERROR: ${updateError.message}`);
      } else {
        console.log(`  OK`);
        cleanedCount++;
      }
    }
  }

  console.log(`\nCleaned ${cleanedCount} recipes.`);
}

cleanupDisclaimer().catch(console.error);
