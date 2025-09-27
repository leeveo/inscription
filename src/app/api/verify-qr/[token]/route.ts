import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use the anon key for database access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, anonKey)

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token QR manquant' },
        { status: 400 }
      )
    }

    console.log(`Vérification du token QR: ${token.substring(0, 8)}...`)

    // Vérifier si le token existe et est valide
    const { data: tokenData, error: tokenError } = await supabase
      .from('inscription_participant_qr_tokens')
      .select(`
        qr_token,
        participant_id,
        evenement_id,
        is_active,
        expires_at,
        created_at,
        inscription_participants (
          id,
          prenom,
          nom,
          email,
          telephone,
          profession,
          created_at
        ),
        inscription_evenements (
          id,
          nom,
          date_debut,
          date_fin,
          lieu,
          description
        )
      `)
      .eq('qr_token', token)
      .eq('is_active', true)
      .maybeSingle()

    if (tokenError) {
      console.error('Erreur lors de la vérification du token:', tokenError)
      return NextResponse.json(
        { success: false, message: 'Erreur de vérification du token' },
        { status: 500 }
      )
    }

    if (!tokenData) {
      console.log('Token QR non trouvé ou inactif')
      return NextResponse.json(
        { success: false, message: 'Token QR invalide ou expiré' },
        { status: 404 }
      )
    }

    // Vérifier si le token a expiré
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      console.log('Token QR expiré')
      return NextResponse.json(
        { success: false, message: 'Token QR expiré' },
        { status: 410 }
      )
    }

    // Récupérer les sessions auxquelles le participant est inscrit
    const { data: sessions, error: sessionsError } = await supabase
      .from('inscription_session_participants')
      .select(`
        inscription_sessions (
          id,
          titre,
          description,
          date,
          heure_debut,
          heure_fin,
          lieu,
          intervenant,
          type,
          capacite_max
        )
      `)
      .eq('participant_id', tokenData.participant_id)

    if (sessionsError) {
      console.error('Erreur lors de la récupération des sessions:', sessionsError)
    }

    // Récupérer les check-ins existants
    const { data: checkins, error: checkinsError } = await supabase
      .from('inscription_checkins')
      .select('session_id, checked_in_at, checked_by')
      .eq('participant_id', tokenData.participant_id)
      .eq('evenement_id', tokenData.evenement_id)

    if (checkinsError) {
      console.error('Erreur lors de la récupération des check-ins:', checkinsError)
    }

    // Organiser les données pour l'interface
    const participantSessions = sessions?.map(sessionData => {
      const session = sessionData.inscription_sessions as any
      if (!session) return null
      
      const checkin = checkins?.find(c => c.session_id === session.id)
      
      return {
        id: session.id,
        titre: session.titre,
        description: session.description,
        date: session.date,
        heure_debut: session.heure_debut,
        heure_fin: session.heure_fin,
        lieu: session.lieu,
        intervenant: session.intervenant,
        type: session.type,
        capacite_max: session.capacite_max,
        isCheckedIn: !!checkin,
        checkedInAt: checkin?.checked_in_at,
        checkedBy: checkin?.checked_by
      }
    }).filter(Boolean) || []

    const participant = Array.isArray(tokenData.inscription_participants) 
      ? tokenData.inscription_participants[0] 
      : tokenData.inscription_participants
      
    const event = Array.isArray(tokenData.inscription_evenements) 
      ? tokenData.inscription_evenements[0] 
      : tokenData.inscription_evenements

    const response = {
      success: true,
      data: {
        token: token,
        participant: participant,
        event: event,
        sessions: participantSessions,
        totalSessions: participantSessions.length,
        checkedInSessions: participantSessions.filter(s => s.isCheckedIn).length
      }
    }

    console.log(`Token valide pour ${participant?.prenom} ${participant?.nom}`)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la vérification du QR code:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur serveur',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}