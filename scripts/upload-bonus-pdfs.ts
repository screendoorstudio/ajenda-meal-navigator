import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

// Need service role key for storage uploads
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtZ2hnb2lpcGRlZGJldWx5dnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUwNzI0NiwiZXhwIjoyMDgyMDgzMjQ2fQ.i2kXYJd9G966xXOLDZRXDzrpM9bdI1VurVvK_H74eSA';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const PDF_BASE_PATH = '/Users/jameswaitzman/Documents/_Claude Projects/Jake/Ajenda Ajent/pdfs';

async function uploadBonusPdfs() {
  // First, check existing URL pattern
  const { data: existingPdf } = await supabase
    .from('weekly_pdfs')
    .select('pdf_url')
    .eq('phase_id', 'phase-1')
    .eq('week_number', 1)
    .single();

  console.log('Existing PDF URL pattern:', existingPdf?.pdf_url);

  // The bonus PDFs to upload
  const bonusPdfs = [
    { file: 'Nutrition Bonus Week.pdf', week: 1 },
    { file: 'Nutrition_bonus week 4.pdf', week: 4 },
  ];

  for (const pdf of bonusPdfs) {
    const filePath = path.join(PDF_BASE_PATH, 'PHASE 3', pdf.file);

    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `bonus/week-${pdf.week}.pdf`;

    console.log(`\nUploading ${pdf.file} to ${storagePath}...`);

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error(`Upload error:`, uploadError);
      continue;
    }

    console.log('Upload successful:', uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;
    console.log('Public URL:', publicUrl);

    // Create or update weekly_pdfs record
    const { data: upsertData, error: upsertError } = await supabase
      .from('weekly_pdfs')
      .upsert({
        phase_id: 'bonus',
        week_number: pdf.week,
        pdf_storage_path: storagePath,
        pdf_url: publicUrl,
        total_pages: null // Could count later
      }, {
        onConflict: 'phase_id,week_number'
      })
      .select();

    if (upsertError) {
      console.error('DB upsert error:', upsertError);
    } else {
      console.log('DB record created:', upsertData);
    }
  }

  // Verify the records
  console.log('\n=== Verification ===');
  const { data: bonusRecords } = await supabase
    .from('weekly_pdfs')
    .select('*')
    .eq('phase_id', 'bonus');

  console.log('Bonus PDF records:', bonusRecords);
}

uploadBonusPdfs();
