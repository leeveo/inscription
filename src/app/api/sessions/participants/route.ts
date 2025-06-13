import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, participantId } = await request.json()
    
    if (!sessionId || !participantId) {
      return NextResponse.json(
        { error: 'Session ID and Participant ID are required' },
        { status: 400 }
      )
    }
    
    const supabase = supabaseServer()
    
    // Check if the participant is already registered for this session
    const { data: existingRegistration, error: checkError } = await supabase
      .from('inscription_session_participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('participant_id', participantId)
      .maybeSingle()
    
    if (checkError) {
      throw checkError
    }
    
    if (existingRegistration) {
      return NextResponse.json(
        { message: 'Participant already registered for this session', data: existingRegistration },
        { status: 200 }
      )
    }
    
    // Register the participant for the session
    const { data, error } = await supabase
      .from('inscription_session_participants')
      .insert({
        session_id: sessionId,
        participant_id: participantId
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ message: 'Participant registered successfully', data }, { status: 201 })
  } catch (error: any) {
    console.error('Error registering participant for session:', error)
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
    
    const supabase = supabaseServer()
    
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
