import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/events/[eventId]/builder-page
 * Récupère la page builder associée à un événement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const supabase = await supabaseServer()

    // Récupérer l'événement avec sa page builder
    const { data: event, error: eventError } = await supabase
      .from('inscription_evenements')
      .select('builder_page_id')
      .eq('id', eventId)
      .single()

    if (eventError) {
      return NextResponse.json(
        { error: eventError.message },
        { status: 500 }
      )
    }

    if (!event?.builder_page_id) {
      return NextResponse.json({
        success: true,
        data: null
      })
    }

    // Récupérer les détails de la page builder
    const { data: page, error: pageError } = await supabase
      .from('builder_pages')
      .select('*')
      .eq('id', event.builder_page_id)
      .single()

    if (pageError) {
      return NextResponse.json(
        { error: pageError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: page
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events/[eventId]/builder-page
 * Associe une page builder à un événement
 * Body: { pageId: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const body = await request.json()
    const { pageId } = body

    if (!pageId) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      )
    }

    const supabase = await supabaseServer()

    // Vérifier que la page existe
    const { data: page, error: pageError } = await supabase
      .from('builder_pages')
      .select('id')
      .eq('id', pageId)
      .single()

    if (pageError || !page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    // Associer la page à l'événement
    const { error: updateError } = await supabase
      .from('inscription_evenements')
      .update({ builder_page_id: pageId })
      .eq('id', eventId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Mettre à jour aussi la relation inverse dans builder_pages
    await supabase
      .from('builder_pages')
      .update({ event_id: eventId })
      .eq('id', pageId)

    return NextResponse.json({
      success: true,
      message: 'Builder page associated successfully'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/events/[eventId]/builder-page
 * Dissocie la page builder de l'événement
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params
    const supabase = await supabaseServer()

    // Récupérer d'abord l'ID de la page pour mettre à jour la relation inverse
    const { data: event } = await supabase
      .from('inscription_evenements')
      .select('builder_page_id')
      .eq('id', eventId)
      .single()

    // Dissocier la page de l'événement
    const { error: updateError } = await supabase
      .from('inscription_evenements')
      .update({ builder_page_id: null })
      .eq('id', eventId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Mettre à jour aussi la relation inverse si elle existait
    if (event?.builder_page_id) {
      await supabase
        .from('builder_pages')
        .update({ event_id: null })
        .eq('id', event.builder_page_id)
    }

    return NextResponse.json({
      success: true,
      message: 'Builder page dissociated successfully'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
