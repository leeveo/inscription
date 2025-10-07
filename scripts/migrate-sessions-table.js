/**
 * Migration Script: Add intervenant_id and programme to inscription_sessions
 *
 * This script adds the necessary columns to the inscription_sessions table
 * to support linking sessions to speakers (intervenants) and storing session programs.
 *
 * Run this script with: node scripts/migrate-sessions-table.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Starting migration: Add intervenant_id and programme to inscription_sessions\n')

  try {
    // Step 1: Add intervenant_id column
    console.log('📝 Step 1: Adding intervenant_id column...')
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE inscription_sessions
        ADD COLUMN IF NOT EXISTS intervenant_id INTEGER REFERENCES inscription_intervenants(id) ON DELETE SET NULL;
      `
    })

    if (error1) {
      // Try alternative approach using raw SQL
      console.log('   Trying alternative approach...')
      const { error: altError1 } = await supabase
        .from('inscription_sessions')
        .select('intervenant_id')
        .limit(1)

      if (altError1 && altError1.message.includes('column') && altError1.message.includes('does not exist')) {
        console.error('❌ Column does not exist. Please run the SQL migration manually.')
        console.log('\nPlease execute this SQL in Supabase Dashboard > SQL Editor:')
        console.log('\n' + '='.repeat(80))
        console.log(`
ALTER TABLE inscription_sessions
ADD COLUMN IF NOT EXISTS intervenant_id INTEGER REFERENCES inscription_intervenants(id) ON DELETE SET NULL;

ALTER TABLE inscription_sessions
ADD COLUMN IF NOT EXISTS programme TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_intervenant_id ON inscription_sessions(intervenant_id);
        `.trim())
        console.log('='.repeat(80) + '\n')
        process.exit(1)
      } else {
        console.log('   ✅ Column intervenant_id already exists or created successfully')
      }
    } else {
      console.log('   ✅ Column intervenant_id added successfully')
    }

    // Step 2: Add programme column
    console.log('📝 Step 2: Adding programme column...')
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE inscription_sessions
        ADD COLUMN IF NOT EXISTS programme TEXT;
      `
    })

    if (error2) {
      const { error: altError2 } = await supabase
        .from('inscription_sessions')
        .select('programme')
        .limit(1)

      if (altError2 && altError2.message.includes('column') && altError2.message.includes('does not exist')) {
        console.error('❌ Failed to add programme column')
        throw altError2
      } else {
        console.log('   ✅ Column programme already exists or created successfully')
      }
    } else {
      console.log('   ✅ Column programme added successfully')
    }

    // Step 3: Create index
    console.log('📝 Step 3: Creating index on intervenant_id...')
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_sessions_intervenant_id ON inscription_sessions(intervenant_id);
      `
    })

    if (error3) {
      console.log('   ⚠️  Index might already exist or RPC not available')
    } else {
      console.log('   ✅ Index created successfully')
    }

    // Verify the migration
    console.log('\n🔍 Verifying migration...')
    const { data, error: verifyError } = await supabase
      .from('inscription_sessions')
      .select('id, intervenant_id, programme')
      .limit(1)

    if (verifyError) {
      throw new Error(`Verification failed: ${verifyError.message}`)
    }

    console.log('   ✅ Migration verified successfully!')
    console.log('\n✨ Migration completed successfully!\n')
    console.log('You can now:')
    console.log('  1. Restart your development server')
    console.log('  2. Try creating a session with an intervenant')
    console.log('  3. The modal should close properly after saving\n')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.log('\n📋 Manual migration required. Please run this SQL in Supabase Dashboard:\n')
    console.log('='.repeat(80))
    console.log(`
ALTER TABLE inscription_sessions
ADD COLUMN IF NOT EXISTS intervenant_id INTEGER REFERENCES inscription_intervenants(id) ON DELETE SET NULL;

ALTER TABLE inscription_sessions
ADD COLUMN IF NOT EXISTS programme TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_intervenant_id ON inscription_sessions(intervenant_id);
    `.trim())
    console.log('='.repeat(80) + '\n')
    process.exit(1)
  }
}

runMigration()
