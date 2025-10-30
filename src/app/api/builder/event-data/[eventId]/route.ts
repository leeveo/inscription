import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/builder/event-data/[eventId]
 * Récupère toutes les données d'un événement pour utilisation dans le builder
 * Inclut: événement, sessions, intervenants, statistiques participants
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const supabase = await supabaseServer()

    // Récupérer les données de l'événement directement
    const { data: eventData, error: eventError } = await supabase
      .from('inscription_evenements')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) {
      console.error('Error fetching event data:', eventError)
      return NextResponse.json(
        { error: eventError.message },
        { status: 500 }
      )
    }

    if (!eventData) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Récupérer les sessions de l'événement
    const { data: sessions, error: sessionsError } = await supabase
      .from('inscription_sessions')
      .select('*')
      .eq('evenement_id', eventId)
      .order('date', { ascending: true })
      .order('heure_debut', { ascending: true })

    // Récupérer le nombre de participants
    const { count: participantCount, error: countError } = await supabase
      .from('inscription_participants')
      .select('*', { count: 'exact', head: true })
      .eq('evenement_id', eventId)

    // Construire la réponse avec toutes les données
    const data = {
      ...eventData,
      sessions: sessions || [],
      participant_count: participantCount || 0
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
