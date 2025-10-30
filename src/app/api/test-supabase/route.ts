import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
    },
    tests: {} as Record<string, any>
  }

  try {
    // Test 1: Connexion avec anon key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

    // Test de connexion basique
    const { data: connectionTest, error: connectionError } = await supabaseAnon
      .from('inscription_evenements')
      .select('id')
      .limit(1)

    diagnostics.tests.anonConnection = {
      success: !connectionError,
      error: connectionError?.message || null,
      hasData: !!connectionTest
    }

    // Test 2: Vérifier si la table landing_page_configs existe
    const { data: tableCheck, error: tableError } = await supabaseAnon
      .from('landing_page_configs')
      .select('id')
      .limit(1)

    diagnostics.tests.landingPageConfigsTable = {
      exists: !tableError || tableError.code !== '42P01', // 42P01 = table does not exist
      error: tableError?.message || null,
      errorCode: tableError?.code || null,
      hasData: !!tableCheck
    }

    // Test 3: Connexion avec service role key
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data: adminTest, error: adminError } = await supabaseAdmin
        .from('inscription_evenements')
        .select('id')
        .limit(1)

      diagnostics.tests.serviceRoleConnection = {
        success: !adminError,
        error: adminError?.message || null,
        hasData: !!adminTest
      }

      // Test 4: Essayer de lire landing_page_configs avec service role
      const { data: adminLandingTest, error: adminLandingError } = await supabaseAdmin
        .from('landing_page_configs')
        .select('*')
        .limit(1)

      diagnostics.tests.serviceRoleLandingPageConfigs = {
        success: !adminLandingError,
        error: adminLandingError?.message || null,
        errorCode: adminLandingError?.code || null,
        hasData: !!adminLandingTest,
        dataCount: adminLandingTest?.length || 0
      }
    } else {
      diagnostics.tests.serviceRoleConnection = {
        success: false,
        error: 'SUPABASE_SERVICE_ROLE_KEY not configured'
      }
    }

    // Test 5: Vérifier les événements existants
    const { data: events, error: eventsError } = await supabaseAnon
      .from('inscription_evenements')
      .select('id, nom')
      .limit(5)

    diagnostics.tests.sampleEvents = {
      success: !eventsError,
      error: eventsError?.message || null,
      count: events?.length || 0,
      events: events?.map(e => ({ id: e.id, nom: e.nom })) || []
    }

    // Test 6: Vérifier les participants avec tokens
    const { data: participants, error: participantsError } = await supabaseAnon
      .from('inscription_participants')
      .select('id, nom, prenom, token_landing_page, evenement_id')
      .not('token_landing_page', 'is', null)
      .limit(5)

    diagnostics.tests.participantsWithTokens = {
      success: !participantsError,
      error: participantsError?.message || null,
      count: participants?.length || 0,
      samples: participants?.map(p => ({
        id: p.id,
        nom: `${p.prenom} ${p.nom}`,
        hasToken: !!p.token_landing_page,
        tokenLength: p.token_landing_page?.length || 0,
        eventId: p.evenement_id
      })) || []
    }

  } catch (error: any) {
    diagnostics.tests.criticalError = {
      message: error.message,
      stack: error.stack
    }
  }

  return NextResponse.json(diagnostics, {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
