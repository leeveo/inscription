import { NextRequest, NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      );
    }

    const supabase = supabaseApi();

    // 1. Compter le nombre total de sessions
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('inscription_sessions')
      .select('id, max_participants')
      .eq('evenement_id', eventId);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json(
        { error: 'Error fetching sessions data' },
        { status: 500 }
      );
    }

    const totalSessions = sessionsData?.length || 0;

    // 2. Compter le nombre total de participants inscrits à toutes les sessions
    const { data: participantsData, error: participantsError } = await supabase
      .from('inscription_session_participants')
      .select(`
        participant_id,
        inscription_sessions!inner (
          evenement_id
        )
      `)
      .eq('inscription_sessions.evenement_id', eventId);

    if (participantsError) {
      console.error('Error fetching session participants:', participantsError);
      return NextResponse.json(
        { error: 'Error fetching participants data' },
        { status: 500 }
      );
    }

    const totalParticipantsInscriptions = participantsData?.length || 0;

    // 3. Calculer le taux de remplissage basé sur les places disponibles
    let totalCapacity = 0;
    let fillRate = 0;

    if (sessionsData && sessionsData.length > 0) {
      // Calculer la capacité totale pour toutes les sessions ayant une capacité définie
      const sessionsWithCapacity = sessionsData.filter(session => session.max_participants);
      totalCapacity = sessionsWithCapacity.reduce((sum, session) => {
        const capacity = typeof session.max_participants === 'number' ? session.max_participants : 0;
        return sum + capacity;
      }, 0);

      if (totalCapacity > 0) {
        fillRate = Math.round((totalParticipantsInscriptions / totalCapacity) * 100);
      } else {
        // Si aucune session n'a de capacité définie, on ne peut pas calculer le taux
        fillRate = 0;
      }
    }

    // 4. Statistiques détaillées par session
    const sessionStats = await Promise.all(
      (sessionsData || []).map(async (session) => {
        const { count, error: countError } = await supabase
          .from('inscription_session_participants')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id);

        if (countError) {
          console.error('Error counting participants for session:', session.id, countError);
          return {
            sessionId: session.id,
            participantCount: 0,
            maxParticipants: session.max_participants,
            fillRate: 0
          };
        }

        const participantCount = count || 0;
        const maxParticipants = typeof session.max_participants === 'number' ? session.max_participants : null;
        const sessionFillRate = maxParticipants 
          ? Math.round((participantCount / maxParticipants) * 100)
          : 0;

        return {
          sessionId: session.id,
          participantCount,
          maxParticipants: maxParticipants,
          fillRate: sessionFillRate
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        totalSessions,
        totalParticipantsInscriptions,
        totalCapacity,
        fillRate,
        sessionStats
      }
    });

  } catch (error) {
    console.error('Error in sessions stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}