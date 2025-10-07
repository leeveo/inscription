import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check if columns already exist
    const { data: existingData, error: checkError } = await supabase
      .from('inscription_sessions')
      .select('intervenant_id, programme')
      .limit(1)

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: 'Migration already completed. Columns intervenant_id and programme exist.',
        alreadyMigrated: true
      })
    }

    // If columns don't exist, we need to run the migration manually
    if (checkError.message.includes('column') && checkError.message.includes('does not exist')) {
      return NextResponse.json({
        success: false,
        message: 'Migration required. Please run the SQL migration manually in Supabase Dashboard.',
        sql: `
ALTER TABLE inscription_sessions
ADD COLUMN IF NOT EXISTS intervenant_id INTEGER REFERENCES inscription_intervenants(id) ON DELETE SET NULL;

ALTER TABLE inscription_sessions
ADD COLUMN IF NOT EXISTS programme TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_intervenant_id ON inscription_sessions(intervenant_id);
        `.trim(),
        instructions: [
          '1. Go to Supabase Dashboard',
          '2. Click on SQL Editor',
          '3. Create a new query',
          '4. Paste the SQL above',
          '5. Click Run',
          '6. Refresh this page'
        ]
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Unexpected error checking migration status',
      error: checkError.message
    }, { status: 500 })

  } catch (error) {
    console.error('Migration check error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to check migration status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Check migration status
    const { error: checkError } = await supabase
      .from('inscription_sessions')
      .select('intervenant_id, programme')
      .limit(1)

    if (!checkError) {
      return NextResponse.json({
        migrated: true,
        message: 'Database is up to date. Columns exist.'
      })
    }

    if (checkError.message.includes('column') && checkError.message.includes('does not exist')) {
      return NextResponse.json({
        migrated: false,
        message: 'Migration needed. Columns do not exist.',
        missingColumns: checkError.message.includes('intervenant_id')
          ? ['intervenant_id', 'programme']
          : checkError.message.includes('programme')
            ? ['programme']
            : ['unknown']
      })
    }

    return NextResponse.json({
      migrated: false,
      message: 'Unable to determine migration status',
      error: checkError.message
    }, { status: 500 })

  } catch (error) {
    console.error('Migration status check error:', error)
    return NextResponse.json({
      migrated: false,
      message: 'Failed to check migration status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
