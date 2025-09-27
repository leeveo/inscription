import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use the anon key for database access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, anonKey)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventCode } = body
    
    console.log(`🔍 [EVENT-ACCESS] Tentative d'accès avec le code: "${eventCode}"`)
    console.log(`🔍 [EVENT-ACCESS] Type du code: ${typeof eventCode}, Longueur: ${eventCode?.length}`)
    
    if (!eventCode) {
      console.log(`❌ [EVENT-ACCESS] Code événement manquant`)
      return NextResponse.json(
        { success: false, message: 'Code événement requis' },
        { status: 400 }
      )
    }

    // Accepter les codes de 3 à 5 chiffres pour plus de flexibilité
    const codeStr = String(eventCode).trim()
    if (codeStr.length < 3 || codeStr.length > 5) {
      console.log(`❌ [EVENT-ACCESS] Code événement invalide - longueur: ${codeStr.length}`)
      return NextResponse.json(
        { success: false, message: 'Code événement invalide (3-5 chiffres requis)' },
        { status: 400 }
      )
    }

    // Vérifier si le code existe et récupérer l'événement
    console.log(`🔍 [EVENT-ACCESS] Recherche de l'événement avec code_acces = "${codeStr}"`)
    let { data: eventData, error: eventError } = await supabase
      .from('inscription_evenements')
      .select(`
        id,
        nom,
        description,
        lieu,
        date_debut,
        date_fin,
        code_acces
      `)
      .eq('code_acces', codeStr)
      .maybeSingle()

    console.log(`🔍 [EVENT-ACCESS] Résultat recherche événement:`, { eventData, eventError })

    if (eventError) {
      console.error('❌ [EVENT-ACCESS] Erreur lors de la recherche de l\'événement:', eventError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la validation du code' },
        { status: 500 }
      )
    }

    if (!eventData) {
      console.log(`❌ [EVENT-ACCESS] Aucun événement trouvé pour le code: "${codeStr}"`)
      // Essayons aussi de chercher par ID au cas où
      console.log(`🔍 [EVENT-ACCESS] Tentative de recherche par ID...`)
      const { data: eventByIdData, error: eventByIdError } = await supabase
        .from('inscription_evenements')
        .select(`
          id,
          nom,
          description,
          lieu,
          date_debut,
          date_fin,
          code_acces
        `)
        .eq('id', codeStr)
        .maybeSingle()

      console.log(`🔍 [EVENT-ACCESS] Résultat recherche par ID:`, { eventByIdData, eventByIdError })

      if (!eventByIdData) {
        return NextResponse.json(
          { success: false, message: `Code événement invalide ou inexistant: "${codeStr}"` },
          { status: 404 }
        )
      }
      
      // Utiliser les données trouvées par ID
      eventData = eventByIdData
    }

    // Récupérer les sessions de cet événement
    console.log(`🔍 [EVENT-ACCESS] Recherche des sessions pour l'événement ID: ${eventData.id}`)
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('inscription_sessions')
      .select(`
        id,
        titre,
        description,
        date,
        heure_debut,
        heure_fin,
        lieu,
        intervenant,
        type,
        evenement_id
      `)
      .eq('evenement_id', eventData.id)
      .order('date', { ascending: true })
      .order('heure_debut', { ascending: true })

    console.log(`🔍 [EVENT-ACCESS] Résultat sessions:`, { 
      sessionsCount: sessionsData?.length || 0, 
      sessionsError,
      sessionsData: sessionsData?.slice(0, 3) // Afficher les 3 premières sessions seulement
    })

    if (sessionsError) {
      console.error('❌ [EVENT-ACCESS] Erreur lors de la récupération des sessions:', sessionsError)
      // Continue sans les sessions
    }

    // Compter les participants de l'événement
    console.log(`🔍 [EVENT-ACCESS] Comptage des participants pour l'événement ID: ${eventData.id}`)
    const { count: participantCount, error: countError } = await supabase
      .from('inscription_participants')
      .select('*', { count: 'exact', head: true })
      .eq('evenement_id', eventData.id)

    console.log(`🔍 [EVENT-ACCESS] Résultat participants:`, { 
      participantCount, 
      countError 
    })

    console.log(`✅ [EVENT-ACCESS] Code valide - Événement: ${eventData.nom}`)
    console.log(`✅ [EVENT-ACCESS] Sessions trouvées: ${sessionsData?.length || 0}`)
    console.log(`✅ [EVENT-ACCESS] Participants: ${participantCount || 0}`)
    
    const responseData = {
      event: {
        id: eventData.id,
        nom: eventData.nom,
        description: eventData.description,
        lieu: eventData.lieu,
        date_debut: eventData.date_debut,
        date_fin: eventData.date_fin
      },
      sessions: sessionsData || [],
      stats: {
        totalSessions: sessionsData?.length || 0,
        totalParticipants: participantCount || 0
      }
    }

    console.log(`📊 [EVENT-ACCESS] Données de réponse:`, responseData)
    
    return NextResponse.json({
      success: true,
      data: responseData,
      message: `Accès autorisé à l'événement: ${eventData.nom}`
    })

  } catch (error) {
    console.error('Erreur lors de la validation du code événement:', error)
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

// GET endpoint pour récupérer les participants d'une session
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const eventCode = searchParams.get('eventCode')
    const email = searchParams.get('email')
    
    if (!sessionId || !eventCode) {
      return NextResponse.json(
        { success: false, message: 'Session ID et code événement requis' },
        { status: 400 }
      )
    }

    // Vérifier le code événement
    const { data: eventData } = await supabase
      .from('inscription_evenements')
      .select('id')
      .eq('code_acces', eventCode)
      .single()

    if (!eventData) {
      return NextResponse.json(
        { success: false, message: 'Code événement invalide' },
        { status: 403 }
      )
    }

    // Construire la requête des participants
    let query = supabase
      .from('inscription_session_participants')
      .select(`
        inscription_participants (
          id,
          prenom,
          nom,
          email,
          telephone,
          profession,
          created_at
        )
      `)
      .eq('session_id', sessionId)

    const { data: participantsData, error } = await query

    if (error) {
      console.error('Erreur lors de la récupération des participants:', error)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la récupération des participants' },
        { status: 500 }
      )
    }

    // Extraire les participants et filtrer par email si fourni
    let participants = participantsData
      ?.map(item => item.inscription_participants)
      .filter(Boolean) || []

    // Cast explicite pour éviter les erreurs TypeScript
    const typedParticipants = participants as any[]

    if (email) {
      participants = typedParticipants.filter(p => 
        p?.email?.toLowerCase().includes(email.toLowerCase())
      )
    } else {
      participants = typedParticipants
    }

    // Récupérer les statuts de check-in
    const participantIds = (participants as any[]).map(p => p?.id).filter(Boolean)
    const { data: checkinData } = await supabase
      .from('inscription_checkins')
      .select('participant_id, checked_in_at, checked_by')
      .eq('session_id', sessionId)
      .in('participant_id', participantIds)

    // Enrichir les participants avec le statut de check-in
    const participantsWithCheckin = (participants as any[]).map(participant => {
      const checkin = checkinData?.find(c => c.participant_id === participant?.id)
      return {
        ...participant,
        isCheckedIn: !!checkin,
        checkedInAt: checkin?.checked_in_at,
        checkedBy: checkin?.checked_by
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        participants: participantsWithCheckin,
        total: participantsWithCheckin.length,
        checkedIn: participantsWithCheckin.filter(p => p.isCheckedIn).length
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des participants:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur serveur' 
      },
      { status: 500 }
    )
  }
}