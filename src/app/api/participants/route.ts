import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';

// GET - Récupérer les participants d'un événement
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    if (!eventId) {
      return NextResponse.json({
        success: false,
        error: 'Event ID is required'
      }, { status: 400 });
    }

    const supabase = supabaseApi();

    let query = supabase
      .from('inscription_participants')
      .select('*')
      .eq('evenement_id', eventId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (parseInt(limit) || 10) - 1);
    }

    const { data: participants, error, count } = await query;

    if (error) {
      console.error('Error fetching participants:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch participants'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      participants: participants || [],
      total: count || participants?.length || 0
    });

  } catch (error) {
    console.error('Participants GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}