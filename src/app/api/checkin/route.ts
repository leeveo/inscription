import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use the anon key for database access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, anonKey)

export async function POST(req: NextRequest) {
  try {
    console.log('=== DÉBUT CHECK-IN ===')
    const body = await req.json()
    const { 
      qrToken, 
      sessionId, 
      checkedBy, 
      deviceInfo,
      notes 
    } = body
    
    console.log('Paramètres reçus:', { 
      qrToken: qrToken?.substring(0, 8) + '...',
      sessionId,
      checkedBy
    })
    
    if (!qrToken || !sessionId) {
      console.log('Paramètres manquants')
      return NextResponse.json(
        { success: false, message: 'Token QR et ID de session requis' },
        { status: 400 }
      )
    }
    
    // Vérifier le token QR et récupérer les infos du participant
    console.log('Vérification du token QR...')
    const { data: tokenData, error: tokenError } = await supabase
      .from('inscription_participant_qr_tokens')
      .select(`
        participant_id,
        evenement_id,
        is_active,
        expires_at,
        inscription_participants (
          id,
          prenom,
          nom,
          email
        )
      `)
      .eq('qr_token', qrToken)
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

    // Vérifier que la session existe et appartient bien à l'événement
    console.log('Vérification de la session...')
    const { data: sessionData, error: sessionError } = await supabase
      .from('inscription_sessions')
      .select('id, titre, evenement_id, date, heure_debut, heure_fin')
      .eq('id', sessionId)
      .eq('evenement_id', tokenData.evenement_id)
      .maybeSingle()

    if (sessionError || !sessionData) {
      console.error('Session non trouvée:', sessionError)
      return NextResponse.json(
        { success: false, message: 'Session non trouvée pour cet événement' },
        { status: 404 }
      )
    }

    // Vérifier que le participant est inscrit à cette session
    console.log('Vérification de l\'inscription à la session...')
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('inscription_session_participants')
      .select('id')
      .eq('participant_id', tokenData.participant_id)
      .eq('session_id', sessionId)
      .maybeSingle()

    if (enrollmentError || !enrollment) {
      console.log('Participant non inscrit à cette session')
      return NextResponse.json(
        { 
          success: false, 
          message: 'Ce participant n\'est pas inscrit à cette session',
          sessionTitle: sessionData.titre
        },
        { status: 403 }
      )
    }

    // Vérifier si le participant a déjà fait son check-in pour cette session
    console.log('Vérification des check-ins existants...')
    const { data: existingCheckin, error: checkinError } = await supabase
      .from('inscription_checkins')
      .select('id, checked_in_at, checked_by')
      .eq('participant_id', tokenData.participant_id)
      .eq('session_id', sessionId)
      .maybeSingle()

    if (checkinError) {
      console.error('Erreur lors de la vérification des check-ins:', checkinError)
    }

    if (existingCheckin) {
      console.log('Check-in déjà effectué')
      return NextResponse.json({
        success: false,
        message: 'Check-in déjà effectué pour cette session',
        data: {
          participant: tokenData.inscription_participants,
          session: sessionData,
          checkedInAt: existingCheckin.checked_in_at,
          checkedBy: existingCheckin.checked_by
        }
      }, { status: 409 })
    }

    // Effectuer le check-in
    console.log('Enregistrement du check-in...')
    const { data: checkinResult, error: insertError } = await supabase
      .from('inscription_checkins')
      .insert({
        participant_id: tokenData.participant_id,
        evenement_id: tokenData.evenement_id,
        session_id: sessionId,
        qr_token: qrToken,
        checked_by: checkedBy || 'Système',
        device_info: deviceInfo || null,
        notes: notes || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erreur lors de l\'insertion du check-in:', insertError)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erreur lors de l\'enregistrement du check-in',
          details: insertError.message
        },
        { status: 500 }
      )
    }

    const participant = Array.isArray(tokenData.inscription_participants) 
      ? tokenData.inscription_participants[0] 
      : tokenData.inscription_participants

    console.log(`✅ Check-in réussi pour ${participant?.prenom} ${participant?.nom} - Session: ${sessionData.titre}`)
    console.log('=== FIN CHECK-IN ===')
    
    return NextResponse.json({
      success: true,
      message: 'Check-in effectué avec succès',
      data: {
        checkinId: checkinResult.id,
        participant: participant,
        session: sessionData,
        checkedInAt: checkinResult.checked_in_at,
        checkedBy: checkinResult.checked_by
      }
    })
    
  } catch (error) {
    console.error('=== ERREUR GLOBALE CHECK-IN ===')
    console.error('Error during check-in:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur serveur',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// GET endpoint pour récupérer les check-ins d'un événement
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    const sessionId = searchParams.get('sessionId')
    
    if (!eventId) {
      return NextResponse.json(
        { success: false, message: 'ID événement requis' },
        { status: 400 }
      )
    }
    
    let query = supabase
      .from('inscription_checkins_details')
      .select('*')
      .eq('evenement_id', eventId)
      .order('checked_in_at', { ascending: false })
    
    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }
    
    const { data: checkins, error } = await query
    
    if (error) {
      console.error('Erreur lors de la récupération des check-ins:', error)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la récupération des check-ins' },
        { status: 500 }
      )
    }
    
    // Statistiques
    const stats = {
      total: checkins?.length || 0,
      bySession: {} as Record<string, number>
    }
    
    checkins?.forEach(checkin => {
      const sessionTitle = checkin.session_titre
      if (sessionTitle) {
        stats.bySession[sessionTitle] = (stats.bySession[sessionTitle] || 0) + 1
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        checkins: checkins || [],
        stats
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de la récupération des check-ins:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erreur serveur' 
    }, { status: 500 })
  }
}