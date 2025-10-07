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

    // Utiliser la fonction PostgreSQL pour récupérer les données formatées
    const { data, error } = await supabase
      .rpc('get_event_data_for_builder', { event_uuid: eventId })

    if (error) {
      console.error('Error fetching event data:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
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
