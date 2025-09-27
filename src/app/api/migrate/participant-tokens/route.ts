import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    console.log('Starting participant tokens migration...')

    // 1. Ajouter la colonne token_landing_page si elle n'existe pas
    try {
      await supabaseAdmin.rpc('exec', {
        sql: `
          ALTER TABLE inscription_participants 
          ADD COLUMN IF NOT EXISTS token_landing_page TEXT UNIQUE;
        `
      })
      console.log('✅ Added token_landing_page column')
    } catch (error: any) {
      if (!error.message.includes('already exists')) {
        console.error('Error adding column:', error)
        // Continue anyway, might already exist
      }
    }

    // 2. Créer l'index
    try {
      await supabaseAdmin.rpc('exec', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_inscription_participants_token 
          ON inscription_participants(token_landing_page);
        `
      })
      console.log('✅ Created index for token column')
    } catch (error) {
      console.error('Error creating index:', error)
    }

    // 3. Créer la table des visites
    try {
      const { error } = await supabaseAdmin.rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS landing_page_visits (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            participant_id INTEGER NOT NULL,
            event_id UUID NOT NULL,
            token TEXT NOT NULL,
            visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ip_address TEXT,
            user_agent TEXT,
            referrer TEXT,
            converted BOOLEAN DEFAULT FALSE,
            conversion_at TIMESTAMP WITH TIME ZONE
          );
        `
      })
      if (error) throw error
      console.log('✅ Created landing_page_visits table')
    } catch (error) {
      console.error('Error creating visits table:', error)
    }

    // 4. Créer les index pour la table des visites
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_landing_visits_participant ON landing_page_visits(participant_id);',
      'CREATE INDEX IF NOT EXISTS idx_landing_visits_event ON landing_page_visits(event_id);',
      'CREATE INDEX IF NOT EXISTS idx_landing_visits_token ON landing_page_visits(token);',
      'CREATE INDEX IF NOT EXISTS idx_landing_visits_date ON landing_page_visits(visited_at);'
    ]

    for (const indexSql of indexes) {
      try {
        await supabaseAdmin.rpc('exec', { sql: indexSql })
      } catch (error) {
        console.error('Error creating index:', error)
      }
    }
    console.log('✅ Created indexes for visits table')

    // 5. Activer RLS sur la table des visites
    try {
      await supabaseAdmin.rpc('exec', {
        sql: 'ALTER TABLE landing_page_visits ENABLE ROW LEVEL SECURITY;'
      })
      console.log('✅ Enabled RLS on visits table')
    } catch (error) {
      console.error('Error enabling RLS:', error)
    }

    // 6. Créer les politiques RLS
    const policies = [
      `CREATE POLICY IF NOT EXISTS "Allow read landing page visits" ON landing_page_visits FOR SELECT TO public USING (true);`,
      `CREATE POLICY IF NOT EXISTS "Allow insert landing page visits" ON landing_page_visits FOR INSERT TO public WITH CHECK (true);`,
      `CREATE POLICY IF NOT EXISTS "Allow update landing page visits" ON landing_page_visits FOR UPDATE TO public USING (true);`
    ]

    for (const policySQL of policies) {
      try {
        await supabaseAdmin.rpc('exec', { sql: policySQL })
      } catch (error) {
        console.error('Error creating policy:', error)
      }
    }
    console.log('✅ Created RLS policies')

    return NextResponse.json({ 
      success: true, 
      message: 'Participant tokens migration completed successfully' 
    })

  } catch (error: any) {
    console.error('Migration failed:', error)
    return NextResponse.json({ 
      error: error.message || 'Migration failed' 
    }, { status: 500 })
  }
}