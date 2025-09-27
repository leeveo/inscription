import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== API Route sessions/participants POST ===')
    
    const { sessionId, participantId } = await request.json()
    console.log('Données reçues:', { sessionId, participantId })
    
    if (!sessionId || !participantId) {
      console.log('❌ Paramètres manquants')
      return NextResponse.json(
        { error: 'Session ID and Participant ID are required' },
        { status: 400 }
      )
    }
    
    // Await the supabase client before using it
    const supabase = await supabaseServer()
    console.log('✅ Client Supabase serveur initialisé')
    
    // Check if the participant is already registered for this session
    console.log('🔍 Vérification inscription existante...')
    const { data: existingRegistration, error: checkError } = await supabase
      .from('inscription_session_participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('participant_id', participantId)
      .maybeSingle()
    
    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError)
      throw checkError
    }
    
    if (existingRegistration) {
      console.log('ℹ️ Participant déjà inscrit:', existingRegistration)
      return NextResponse.json(
        { message: 'Participant already registered for this session', data: existingRegistration },
        { status: 200 }
      )
    }
    
    // Vérifier la capacité de la session avant inscription
    console.log('📊 Vérification de la capacité de la session...')
    const { data: sessionData, error: sessionError } = await supabase
      .from('inscription_sessions')
      .select('max_participants')
      .eq('id', sessionId)
      .single()
    
    if (sessionError) {
      console.error('❌ Erreur lors de la récupération de la session:', sessionError)
      throw sessionError
    }
    
    // Si la session a une limite de participants, vérifier la capacité
    if (sessionData.max_participants !== null) {
      console.log(`🎯 Session avec limite: ${sessionData.max_participants} participants max`)
      
      // Compter les participants actuels
      const { count, error: countError } = await supabase
        .from('inscription_session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
      
      if (countError) {
        console.error('❌ Erreur lors du comptage des participants:', countError)
        throw countError
      }
      
      console.log(`📈 Participants actuels: ${count}/${sessionData.max_participants}`)
      
      // Vérifier si la session est pleine
      if (count !== null && count >= sessionData.max_participants) {
        console.log('🚫 Session pleine - inscription refusée')
        return NextResponse.json(
          { 
            error: 'Session pleine', 
            message: 'Cette session a atteint sa capacité maximale', 
            capacity: {
              current: count,
              max: sessionData.max_participants
            }
          },
          { status: 409 }
        )
      }
      
      console.log(`✅ Place disponible: ${sessionData.max_participants - (count || 0)} places restantes`)
    } else {
      console.log('♾️ Session sans limite de participants')
    }
    
    // Register the participant for the session
    console.log('➕ Tentative d\'insertion...')
    const { data, error } = await supabase
      .from('inscription_session_participants')
      .insert({
        session_id: sessionId,
        participant_id: participantId
      })
      .select()
      .single()
    
    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error)
      
      // Gérer spécifiquement les erreurs de contrainte unique (doublons)
      if (error.code === '23505') { // PostgreSQL unique_violation error code
        console.log('🔄 Doublon détecté par contrainte unique, récupération de l\'inscription existante...')
        
        // Récupérer l'inscription existante
        const { data: existingData, error: fetchError } = await supabase
          .from('inscription_session_participants')
          .select('*')
          .eq('session_id', sessionId)
          .eq('participant_id', participantId)
          .single()
        
        if (fetchError) {
          console.error('❌ Erreur lors de la récupération du doublon:', fetchError)
          throw fetchError
        }
        
        console.log('✅ Inscription existante récupérée:', existingData)
        return NextResponse.json(
          { message: 'Participant already registered for this session (caught by unique constraint)', data: existingData },
          { status: 200 }
        )
      }
      
      // Autres erreurs
      throw error
    }
    
    console.log('✅ Inscription réussie:', data)
    return NextResponse.json({ message: 'Participant registered successfully', data }, { status: 201 })
  } catch (error: any) {
    console.error('💥 Erreur globale API route:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred while registering the participant' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { sessionId, participantId } = await request.json()
    
    if (!sessionId || !participantId) {
      return NextResponse.json(
        { error: 'Session ID and Participant ID are required' },
        { status: 400 }
      )
    }
    
    // Await the supabase client before using it
    const supabase = await supabaseServer()
    
    // Unregister the participant from the session
    const { error } = await supabase
      .from('inscription_session_participants')
      .delete()
      .eq('session_id', sessionId)
      .eq('participant_id', participantId)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ message: 'Participant unregistered successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('Error unregistering participant from session:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred while unregistering the participant' },
      { status: 500 }
    )
  }
}
