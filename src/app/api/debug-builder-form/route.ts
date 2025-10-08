import { NextResponse } from 'next/server'
import { supabaseApi } from '@/lib/supabase/server'

export async function GET() {
  console.log('🔍 Debug API appelée')

  try {
    const supabase = await supabaseApi()
    console.log('🔌 Client Supabase API initialisé')

    // Vérifier la connexion
    console.log('📊 Test de connexion Supabase...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('inscription_evenements')
      .select('count')
      .limit(1)

    if (connectionError) {
      console.error('❌ Erreur de connexion:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Erreur de connexion à la base de données',
        details: connectionError
      })
    }

    console.log('✅ Connexion réussie')

    // Vérifier les événements publiés
    const { data: events, error: eventsError } = await supabase
      .from('inscription_evenements')
      .select('id, nom, statut, date_debut')
      .eq('statut', 'publié')
      .limit(5)

    if (eventsError) {
      console.error('❌ Erreur lors de la récupération des événements:', eventsError)
    } else {
      console.log('✅ Événements publiés trouvés:', events?.length || 0)
    }

    // Vérifier les sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('inscription_sessions')
      .select('id, titre, evenement_id')
      .limit(5)

    if (sessionsError) {
      console.error('❌ Erreur lors de la récupération des sessions:', sessionsError)
    } else {
      console.log('✅ Sessions trouvées:', sessions?.length || 0)
    }

    // Vérifier la structure des tables
    const { data: participantTest, error: participantError } = await supabase
      .from('inscription_participants')
      .select('*')
      .limit(1)

    if (participantError && !participantError.message.includes('no rows')) {
      console.error('❌ Erreur lors de l\'accès à la table participants:', participantError)
    } else {
      console.log('✅ Table inscription_participants accessible')
    }

    const { data: tokenTest, error: tokenError } = await supabase
      .from('inscription_participant_qr_tokens')
      .select('*')
      .limit(1)

    if (tokenError && !tokenError.message.includes('no rows')) {
      console.error('❌ Erreur lors de l\'accès à la table tokens:', tokenError)
    } else {
      console.log('✅ Table inscription_participant_qr_tokens accessible')
    }

    return NextResponse.json({
      success: true,
      message: 'Base de données accessible',
      data: {
        events: events || [],
        sessions: sessions || [],
        eventsCount: events?.length || 0,
        sessionsCount: sessions?.length || 0,
        participantTable: !participantError || participantError.message.includes('no rows'),
        tokenTable: !tokenError || tokenError.message.includes('no rows')
      }
    })

  } catch (error) {
    console.error('💥 Erreur lors du debug:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    })
  }
}