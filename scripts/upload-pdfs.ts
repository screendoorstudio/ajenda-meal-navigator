/**
 * Upload PDFs to Supabase Storage
 *
 * Usage: npx tsx scripts/upload-pdfs.ts
 *
 * Requires:
 * - SUPABASE_URL environment variable
 * - SUPABASE_SERVICE_ROLE_KEY environment variable
 * - PDFs at ../pdfs/
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// PDF folder to phase mapping
const FOLDER_MAPPING: Record<string, string> = {
  'PHASE 1': 'phase-1',
  'PHASE 2': 'phase-2',
  'PHASE 3': 'phase-3',
  'Month 7': 'm7',
  'Month 8': 'm8',
  'Month 9': 'm9',
  'Month 10': 'm10',
};

// Extract week number from filename
function extractWeekNumber(filename: string): number | null {
  // Match patterns like "Week 1", "Week1", "_Week2", etc.
  const match = filename.match(/[Ww]eek\s*(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  // Handle bonus weeks
  if (filename.toLowerCase().includes('bonus')) {
    return 0; // Use 0 for bonus weeks
  }
  return null;
}

// Normalize filename for storage
function normalizeFilename(phaseId: string, weekNum: number): string {
  return `${phaseId}-week-${weekNum}.pdf`;
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

  // PDF source directory
  const pdfDir = path.resolve(__dirname, '../../pdfs');
  console.log(`Reading PDFs from: ${pdfDir}`);

  // Create storage bucket if it doesn't exist
  const { error: bucketError } = await supabase.storage.createBucket('pdfs', {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['application/pdf'],
  });

  if (bucketError && !bucketError.message.includes('already exists')) {
    console.error('Failed to create bucket:', bucketError);
    process.exit(1);
  }
  console.log('Storage bucket ready');

  // Track results
  let successCount = 0;
  let errorCount = 0;
  const results: { phase: string; week: number; path: string; url: string }[] = [];

  // Process each folder
  const folders = fs.readdirSync(pdfDir);

  for (const folder of folders) {
    const folderPath = path.join(pdfDir, folder);

    // Skip non-directories and hidden files
    if (!fs.statSync(folderPath).isDirectory() || folder.startsWith('.')) {
      continue;
    }

    // Map folder to phase
    const phaseId = FOLDER_MAPPING[folder];
    if (!phaseId) {
      console.warn(`Unknown folder: ${folder}, skipping`);
      continue;
    }

    console.log(`\nProcessing: ${folder} (${phaseId})`);

    // Get PDF files in folder
    const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.pdf'));

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      // Extract week number
      const weekNum = extractWeekNumber(file);
      if (weekNum === null) {
        console.warn(`  Could not extract week from: ${file}, skipping`);
        continue;
      }

      // Read file
      const fileBuffer = fs.readFileSync(filePath);
      const storagePath = `${phaseId}/${normalizeFilename(phaseId, weekNum)}`;

      console.log(`  Uploading: ${file} -> ${storagePath}`);

      try {
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(storagePath, fileBuffer, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('pdfs')
          .getPublicUrl(storagePath);

        // Insert into weekly_pdfs table
        const { error: dbError } = await supabase
          .from('weekly_pdfs')
          .upsert({
            phase_id: phaseId,
            week_number: weekNum,
            pdf_storage_path: storagePath,
            pdf_url: urlData.publicUrl,
          }, {
            onConflict: 'phase_id,week_number',
          });

        if (dbError) {
          throw dbError;
        }

        results.push({
          phase: phaseId,
          week: weekNum,
          path: storagePath,
          url: urlData.publicUrl,
        });

        successCount++;
      } catch (error) {
        console.error(`  Error uploading ${file}:`, error);
        errorCount++;
      }
    }
  }

  // Summary
  console.log('\n=== Upload Summary ===');
  console.log(`Total uploaded: ${successCount}`);
  console.log(`Errors: ${errorCount}`);

  // Save results to JSON
  const resultsPath = path.resolve(__dirname, '../data/pdf-uploads.json');
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${resultsPath}`);
}

main().catch(console.error);
