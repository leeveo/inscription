import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Utiliser la clé service role pour contourner RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }
    
    const { data: sessions, error } = await supabaseAdmin
      .from('inscription_sessions')
      .select('*')
      .eq('evenement_id', eventId)
      .order('date', { ascending: true })
      .order('heure_debut', { ascending: true })
    
    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, ...sessionData } = body
    
    console.log('➕ POST /api/sessions - Creating new session for event:', eventId)
    console.log('📝 Session data received:', sessionData)
    
    if (!eventId) {
      console.error('❌ Missing eventId in request')
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }
    
    // Validation des données requises
    if (!sessionData.titre || !sessionData.date || !sessionData.heure_debut || !sessionData.heure_fin || !sessionData.type) {
      console.error('❌ Missing required fields:', {
        titre: !!sessionData.titre,
        date: !!sessionData.date,
        heure_debut: !!sessionData.heure_debut,
        heure_fin: !!sessionData.heure_fin,
        type: !!sessionData.type
      })
      return NextResponse.json({ error: 'Missing required fields: titre, date, heure_debut, heure_fin, type' }, { status: 400 })
    }
    
    // Préparer les données d'insertion
    const insertData = {
      evenement_id: eventId,
      titre: sessionData.titre,
      description: sessionData.description || null,
      date: sessionData.date,
      heure_debut: sessionData.heure_debut,
      heure_fin: sessionData.heure_fin,
      intervenant: sessionData.intervenant || null,
      intervenant_id: sessionData.intervenant_id || null,
      programme: sessionData.programme || null,
      lieu: sessionData.lieu || null,
      type: sessionData.type,
      max_participants: sessionData.max_participants || null
    }
    
    console.log('📝 Inserting with data:', insertData)
    
    const { data: newSession, error } = await supabaseAdmin
      .from('inscription_sessions')
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error creating session:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint 
      }, { status: 500 })
    }
    
    if (!newSession) {
      console.error('❌ No session returned after creation')
      return NextResponse.json({ error: 'Failed to create session - no data returned' }, { status: 500 })
    }
    
    console.log('✅ Session created successfully:', newSession)
    return NextResponse.json({ session: newSession })
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, ...sessionData } = body
    
    console.log('🔄 PUT /api/sessions - Updating session:', sessionId)
    console.log('📝 Session data received:', sessionData)
    
    if (!sessionId) {
      console.error('❌ Missing sessionId in request')
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    // Validation des données requises
    if (!sessionData.titre || !sessionData.date || !sessionData.heure_debut || !sessionData.heure_fin || !sessionData.type) {
      console.error('❌ Missing required fields:', {
        titre: !!sessionData.titre,
        date: !!sessionData.date,
        heure_debut: !!sessionData.heure_debut,
        heure_fin: !!sessionData.heure_fin,
        type: !!sessionData.type
      })
      return NextResponse.json({ error: 'Missing required fields: titre, date, heure_debut, heure_fin, type' }, { status: 400 })
    }
    
    // Vérifier que la session existe avant de la mettre à jour
    const { data: existingSession, error: checkError } = await supabaseAdmin
      .from('inscription_sessions')
      .select('id')
      .eq('id', sessionId)
      .single()
    
    if (checkError || !existingSession) {
      console.error('❌ Session not found:', sessionId, checkError)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    // Préparer les données de mise à jour
    const updateData = {
      titre: sessionData.titre,
      description: sessionData.description || null,
      date: sessionData.date,
      heure_debut: sessionData.heure_debut,
      heure_fin: sessionData.heure_fin,
      intervenant: sessionData.intervenant || null,
      intervenant_id: sessionData.intervenant_id || null,
      programme: sessionData.programme || null,
      lieu: sessionData.lieu || null,
      type: sessionData.type,
      max_participants: sessionData.max_participants || null
    }
    
    console.log('📝 Updating with data:', updateData)
    
    const { data: updatedSession, error } = await supabaseAdmin
      .from('inscription_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error updating session:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint 
      }, { status: 500 })
    }
    
    if (!updatedSession) {
      console.error('❌ No session returned after update')
      return NextResponse.json({ error: 'Failed to update session - no data returned' }, { status: 500 })
    }
    
    console.log('✅ Session updated successfully:', updatedSession)
    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    const { error } = await supabaseAdmin
      .from('inscription_sessions')
      .delete()
      .eq('id', sessionId)
    
    if (error) {
      console.error('Error deleting session:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}