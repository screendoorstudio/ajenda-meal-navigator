import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('Running database migration...');

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20231223000000_initial_schema.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  // Split into individual statements
  const statements = migrationSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute`);

  // Execute each statement using the Supabase SQL endpoint via fetch
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;

    console.log(`Executing statement ${i + 1}/${statements.length}...`);

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          query: statement
        })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Failed on statement ${i + 1}:`, text);
        console.error('Statement:', statement.substring(0, 100) + '...');
      }
    } catch (error) {
      console.error(`Error on statement ${i + 1}:`, error);
    }
  }

  console.log('Migration complete!');
}

runMigration().catch(console.error);
