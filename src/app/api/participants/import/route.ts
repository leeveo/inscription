import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client directly without relying on realtime features
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    // Disable realtime as it's not needed for this API route
    // This helps avoid the dynamic import issues
    realtime: {
      connect: false
    }
  }
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventId, participants } = body
    
    if (!eventId || !participants || !Array.isArray(participants)) {
      return NextResponse.json(
        { message: 'Missing or invalid required parameters' },
        { status: 400 }
      )
    }
    
    // Validate event exists
    const { data: eventData, error: eventError } = await supabase
      .from('inscription_evenements')
      .select('id')
      .eq('id', eventId)
      .single()
    
    if (eventError || !eventData) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }
    
    // Process participants in batches to avoid timeouts
    const batchSize = 50
    let importedCount = 0
    let errorCount = 0
    
    // Process in batches
    for (let i = 0; i < participants.length; i += batchSize) {
      const batch = participants.slice(i, i + batchSize)
      
      // Format participants data
      const formattedParticipants = batch.map(participant => ({
        evenement_id: eventId,
        nom: participant.nom,
        prenom: participant.prenom,
        email: participant.email,
        telephone: participant.telephone,
        site_web: participant.site_web || null,
      }))
      
      // Insert batch
      const { data, error } = await supabase
        .from('inscription_participants')
        .insert(formattedParticipants)
        .select()
      
      if (error) {
        console.error('Error inserting batch:', error)
        errorCount += batch.length
      } else {
        importedCount += data.length
      }
    }
    
    return NextResponse.json({
      message: 'Import completed',
      imported: importedCount,
      errors: errorCount,
      total: participants.length
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Server error during import' },
      { status: 500 }
    )
  }
}
