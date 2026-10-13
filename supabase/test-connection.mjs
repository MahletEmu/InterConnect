/**
 * Supabase Connection Test Script
 * Run with: node --env-file=.env.local supabase/test-connection.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

console.log('\n=== InterConnect — Supabase Connection Test ===\n');

// 1. Check credentials are present
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ MISSING CREDENTIALS');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'MISSING');
  console.error('   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:', supabaseKey ? 'set' : 'MISSING');
  process.exit(1);
}

// 2. Check URL format - must be https://[project-id].supabase.co
const urlPattern = /^https:\/\/[a-z0-9_-]+\.supabase\.co$/;
const urlValid = urlPattern.test(supabaseUrl);
if (!urlValid) {
  console.error('❌ WRONG URL FORMAT');
  console.error('   Expected format: https://<project-id>.supabase.co');
  console.error('');
  console.error('   Your URL must be in this format:');
  console.error('   https://xxxxxxxxxxxxxxxxxxxx.supabase.co');
  console.error('');
  console.error('   HOW TO FIX:');
  console.error('   1. Go to: https://supabase.com/dashboard');
  console.error('   2. Select your project');
  console.error('   3. Go to: Project Settings → API');
  console.error('   4. Copy the value under "Project URL"');
  console.error('   5. It will look like: https://abcdefghijklmnopqrst.supabase.co');
  process.exit(1);
}

// 3. Check key format — supports modern sb_publishable_ keys and legacy eyJ JWT keys
const keyValid = supabaseKey.startsWith('sb_publishable_') || supabaseKey.startsWith('eyJ');
if (!keyValid) {
  console.error('❌ UNRECOGNIZED KEY FORMAT');
  console.error('   Key must start with "sb_publishable_" (current Supabase publishable key) or "eyJ" (legacy anon key).');
  process.exit(1);
}

console.log('✅ NEXT_PUBLIC_SUPABASE_URL    — present and format OK');
console.log('✅ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — present and format OK');
console.log('');

// 4. Try to connect and query skills table
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Connecting to Supabase...');

try {
  const { data, error, status } = await supabase
    .from('skills')
    .select('id, name, category')
    .limit(5);

  if (error) {
    console.error('❌ QUERY FAILED');
    console.error('   Status:', status);
    console.error('   Error code:', error.code);
    console.error('   Message:', error.message);

    if (error.code === '42P01') {
      console.error('');
      console.error('   The "skills" table does not exist yet.');
      console.error('   → Run the migration SQL from supabase/migrations/20261004_initial_schema.sql');
      console.error('   → Then run the seed from supabase/seed.sql');
    } else if (status === 401) {
      console.error('');
      console.error('   Authentication failed. Check your anon key.');
    }
    process.exit(1);
  }

  console.log('✅ SUPABASE CONNECTION SUCCESSFUL');
  console.log('✅ "skills" table is accessible');
  console.log('');

  if (data && data.length > 0) {
    console.log(`   Found ${data.length} skill records (showing up to 5):`);
    data.forEach((s) => console.log(`   → [${s.category}] ${s.name}`));
  } else {
    console.log('   ⚠️  The skills table is empty.');
    console.log('   → Run the seed SQL from supabase/seed.sql to populate it.');
  }

} catch (err) {
  console.error('❌ UNEXPECTED ERROR:', err.message);
  process.exit(1);
}

console.log('');
console.log('=== Test Complete ===');
