import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')
  const token = searchParams.get('token')

  if (!eventId || !token) {
    return NextResponse.json({
      error: 'eventId and token are required',
      usage: '/api/debug-participant?eventId=XXX&token=YYY'
    }, { status: 400 })
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    input: {
      eventId,
      token,
      tokenLength: token.length
    },
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    },
    queries: {} as Record<string, any>
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test 1: Vérifier si l'événement existe
    const { data: event, error: eventError } = await supabase
      .from('inscription_evenements')
      .select('*')
      .eq('id', eventId)
      .single()

    diagnostics.queries.event = {
      success: !eventError,
      error: eventError?.message || null,
      errorCode: eventError?.code || null,
      found: !!event,
      eventName: event?.nom || null
    }

    // Test 2: Chercher le participant par token
    const { data: participant, error: participantError } = await supabase
      .from('inscription_participants')
      .select(`
        id,
        nom,
        prenom,
        email,
        telephone,
        profession,
        date_naissance,
        url_linkedin,
        url_facebook,
        url_twitter,
        url_instagram,
        evenement_id,
        token_landing_page
      `)
      .eq('token_landing_page', token)
      .single()

    diagnostics.queries.participant = {
      success: !participantError,
      error: participantError?.message || null,
      errorCode: participantError?.code || null,
      found: !!participant,
      participantId: participant?.id || null,
      participantName: participant ? `${participant.prenom} ${participant.nom}` : null,
      participantEventId: participant?.evenement_id || null,
      eventIdMatches: participant?.evenement_id === eventId
    }

    // Test 3: Vérifier la config de landing page
    const { data: config, error: configError } = await supabase
      .from('landing_page_configs')
      .select('*')
      .eq('event_id', eventId)
      .single()

    diagnostics.queries.landingConfig = {
      success: !configError && configError?.code !== 'PGRST116',
      error: configError?.message || null,
      errorCode: configError?.code || null,
      found: !!config,
      templateId: config?.template_id || null,
      hasCustomization: !!config?.customization
    }

    // Test 4: Si pas de config, retourner la config par défaut qui sera utilisée
    if (!config) {
      diagnostics.queries.defaultConfig = {
        willUseDefault: true,
        defaultTemplateId: 'modern-gradient',
        defaultCustomization: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          backgroundColor: '#F8FAFC',
          heroTitle: '',
          heroSubtitle: '',
          ctaButtonText: "S'inscrire maintenant",
          logoUrl: '',
          backgroundImage: '',
          customCSS: ''
        }
      }
    }

    // Test 5: Vérifier si le token correspond à un participant de cet événement
    if (participant && participant.evenement_id !== eventId) {
      diagnostics.queries.validation = {
        valid: false,
        reason: 'Token appartient à un autre événement',
        tokenEventId: participant.evenement_id,
        requestedEventId: eventId
      }
    } else if (participant) {
      diagnostics.queries.validation = {
        valid: true,
        reason: 'Token valide pour cet événement'
      }
    }

  } catch (error: any) {
    diagnostics.queries.criticalError = {
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
