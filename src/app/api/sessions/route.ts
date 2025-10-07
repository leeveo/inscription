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
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }
    
    // Validation des données requises
    if (!sessionData.titre || !sessionData.date || !sessionData.heure_debut || !sessionData.heure_fin || !sessionData.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const { data: newSession, error } = await supabaseAdmin
      .from('inscription_sessions')
      .insert({
        evenement_id: eventId,
        titre: sessionData.titre,
        description: sessionData.description || '',
        date: sessionData.date,
        heure_debut: sessionData.heure_debut,
        heure_fin: sessionData.heure_fin,
        intervenant: sessionData.intervenant || '',
        intervenant_id: sessionData.intervenant_id || null,
        programme: sessionData.programme || '',
        lieu: sessionData.lieu || '',
        type: sessionData.type,
        max_participants: sessionData.max_participants
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating session:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ session: newSession })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, ...sessionData } = body
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    const { data: updatedSession, error } = await supabaseAdmin
      .from('inscription_sessions')
      .update({
        titre: sessionData.titre,
        description: sessionData.description || '',
        date: sessionData.date,
        heure_debut: sessionData.heure_debut,
        heure_fin: sessionData.heure_fin,
        intervenant: sessionData.intervenant || '',
        intervenant_id: sessionData.intervenant_id || null,
        programme: sessionData.programme || '',
        lieu: sessionData.lieu || '',
        type: sessionData.type,
        max_participants: sessionData.max_participants
      })
      .eq('id', sessionId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating session:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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