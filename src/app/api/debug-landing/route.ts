import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

// Debug endpoint pour tester les fonctions de landing page isolément
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId') || '533c4f88-f3ed-47b9-8e99-630e5e6bf5b4'
    const token = searchParams.get('token') || 'TIoHD1jVOz8jh1fWei6qs7c3P6bLZp9C'
    
    console.log('🔍 Debug Landing Page Functions')
    console.log('EventID:', eventId)
    console.log('Token:', token)
    
    const results: any = {
      eventId,
      token,
      tests: {}
    }
    
    // Test 1: Connexion Supabase
    try {
      const supabase = await supabaseServer()
      results.tests.supabaseConnection = '✅ OK'
    } catch (error) {
      results.tests.supabaseConnection = '❌ ' + error.message
      return NextResponse.json(results, { status: 500 })
    }
    
    // Test 2: Récupération de l'événement
    try {
      const supabase = await supabaseServer()
      const { data: event, error } = await supabase
        .from('inscription_evenements')
        .select('*')
        .eq('id', eventId)
        .single()
      
      if (error) {
        results.tests.eventData = '❌ ' + error.message
      } else {
        results.tests.eventData = '✅ Trouvé: ' + event.nom
      }
    } catch (error) {
      results.tests.eventData = '❌ Exception: ' + error.message
    }
    
    // Test 3: Récupération du participant
    try {
      const supabase = await supabaseServer()
      const { data: participant, error } = await supabase
        .from('inscription_participants')
        .select('id, nom, prenom, token_landing_page, evenement_id')
        .eq('token_landing_page', token)
        .single()
      
      if (error) {
        results.tests.participantData = '❌ ' + error.message
        
        // Chercher des tokens similaires
        const { data: similarTokens } = await supabase
          .from('inscription_participants')
          .select('id, nom, token_landing_page')
          .ilike('token_landing_page', token.substring(0, 10) + '%')
          .limit(3)
        
        results.tests.similarTokens = similarTokens?.map(p => ({
          id: p.id,
          nom: p.nom,
          token: p.token_landing_page?.substring(0, 10) + '...'
        }))
      } else {
        results.tests.participantData = '✅ Trouvé: ' + participant.nom + ' ' + participant.prenom
        results.tests.eventIdMatch = participant.evenement_id === eventId ? '✅ Correspond' : '❌ Ne correspond pas'
      }
    } catch (error) {
      results.tests.participantData = '❌ Exception: ' + error.message
    }
    
    // Test 4: Configuration landing page
    try {
      const supabase = await supabaseServer()
      const { data: config, error } = await supabase
        .from('landing_page_configs')
        .select('*')
        .eq('event_id', eventId)
        .single()
      
      if (error) {
        results.tests.landingConfig = '⚠️ Pas de config (utilise défaut): ' + error.message
      } else {
        results.tests.landingConfig = '✅ Config trouvée: ' + config.template_id
      }
    } catch (error) {
      results.tests.landingConfig = '❌ Exception: ' + error.message
    }
    
    return NextResponse.json(results)
    
  } catch (error) {
    return NextResponse.json({
      error: 'Erreur globale du debug',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}