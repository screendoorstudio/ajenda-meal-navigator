/**
 * Import Excel data into Supabase
 *
 * Usage: npx tsx scripts/import-excel.ts
 *
 * Requires:
 * - SUPABASE_URL environment variable
 * - SUPABASE_SERVICE_ROLE_KEY environment variable
 * - Excel file at ../Ajenda_Meal_Plan_Index (1).xlsx
 */

import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';

// Phase mapping from Excel format to database format
const PHASE_MAPPING: Record<string, string> = {
  '1': 'phase-1',
  '2': 'phase-2',
  '3': 'phase-3',
  'Bonus': 'bonus',
  'M7': 'm7',
  'M8': 'm8',
  'M9': 'm9',
  'M10': 'm10',
};

// Meal type validation
const VALID_MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Party'];

// Plan type mapping
const PLAN_TYPE_MAPPING: Record<string, string | null> = {
  'Autophagy': 'Autophagy',
  'Liquid-Only': 'Liquid-Only',
  'Wt. Adj. Avail.': 'Wt. Adj. Avail.',
  'Serves 12': 'Serves 12',
  'Special Exception': 'Special Exception',
  '': null,
};

interface ExcelRow {
  Meal: string;
  'Meal Name': string;
  Phase: string | number;
  Week: string | number;
  Day: string | number;
  Page: number;
  Calories: number;
  Protein_g: number;
  Fiber_g: number;
  'Plan Type': string;
  'Other Meal Plans': string;
}

async function main() {
  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables:');
    console.error('  SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
    console.error('  SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Read Excel file
  const excelPath = path.resolve(__dirname, '../../Ajenda_Meal_Plan_Index (1).xlsx');
  console.log(`Reading Excel file: ${excelPath}`);

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.readFile(excelPath);
  } catch (error) {
    console.error(`Failed to read Excel file: ${error}`);
    process.exit(1);
  }

  // Get first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);
  console.log(`Found ${rows.length} rows in Excel`);

  // Process and insert meals
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      // Map phase
      const phaseRaw = String(row.Phase).trim();
      const phaseId = PHASE_MAPPING[phaseRaw];
      if (!phaseId) {
        throw new Error(`Unknown phase: ${phaseRaw}`);
      }

      // Validate meal type
      const mealType = row.Meal?.trim();
      if (!VALID_MEAL_TYPES.includes(mealType)) {
        throw new Error(`Invalid meal type: ${mealType}`);
      }

      // Map plan type
      const planTypeRaw = row['Plan Type']?.trim() || '';
      const planType = PLAN_TYPE_MAPPING[planTypeRaw];
      if (planTypeRaw && planType === undefined) {
        console.warn(`Unknown plan type: ${planTypeRaw}, setting to null`);
      }

      // Prepare meal data
      const meal = {
        meal_type: mealType,
        name: row['Meal Name']?.trim() || '',
        phase_id: phaseId,
        week: Number(row.Week) || 1,
        day: String(row.Day).trim(),
        page: Number(row.Page) || 1,
        calories: row.Calories ? Number(row.Calories) : null,
        protein_g: row.Protein_g ? Number(row.Protein_g) : null,
        fiber_g: row.Fiber_g ? Number(row.Fiber_g) : null,
        plan_type: planType || null,
        other_meal_plans: row['Other Meal Plans']?.trim() || null,
        recipe_text: null, // Will be populated later via AI extraction
      };

      // Insert into database
      const { error } = await supabase.from('meals').insert(meal);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      successCount++;
      if (successCount % 50 === 0) {
        console.log(`Processed ${successCount} meals...`);
      }
    } catch (error) {
      errorCount++;
      const errorMsg = `Row ${successCount + errorCount}: ${row['Meal Name']} - ${error}`;
      errors.push(errorMsg);
      if (errorCount <= 10) {
        console.error(errorMsg);
      }
    }
  }

  // Summary
  console.log('\n=== Import Summary ===');
  console.log(`Total rows: ${rows.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Errors: ${errorCount}`);

  if (errors.length > 10) {
    console.log(`\nFirst 10 errors shown. Total errors: ${errors.length}`);
  }

  // Save errors to file
  if (errors.length > 0) {
    const fs = await import('fs');
    const errorLogPath = path.resolve(__dirname, '../data/import-errors.log');
    fs.mkdirSync(path.dirname(errorLogPath), { recursive: true });
    fs.writeFileSync(errorLogPath, errors.join('\n'));
    console.log(`\nError log saved to: ${errorLogPath}`);
  }
}

main().catch(console.error);
