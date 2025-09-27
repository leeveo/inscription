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
    
    const { data: config, error } = await supabaseAdmin
      .from('landing_page_configs')
      .select('*')
      .eq('event_id', eventId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching landing page config:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ config: config || null })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, config } = body
    
    if (!eventId || !config) {
      return NextResponse.json({ error: 'Event ID and config are required' }, { status: 400 })
    }
    
    // Validation des données de configuration
    if (!config.templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }
    
    // Vérifier si une configuration existe déjà
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('landing_page_configs')
      .select('id')
      .eq('event_id', eventId)
      .single()
    
    let result
    if (existing) {
      // Mettre à jour la configuration existante
      const { data: updatedConfig, error: updateError } = await supabaseAdmin
        .from('landing_page_configs')
        .update({
          template_id: config.templateId,
          customization: config.customization,
          updated_at: new Date().toISOString()
        })
        .eq('event_id', eventId)
        .select()
        .single()
      
      if (updateError) {
        console.error('Error updating landing page config:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
      
      result = updatedConfig
    } else {
      // Créer une nouvelle configuration
      const { data: newConfig, error: insertError } = await supabaseAdmin
        .from('landing_page_configs')
        .insert({
          event_id: eventId,
          template_id: config.templateId,
          customization: config.customization,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Error creating landing page config:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
      
      result = newConfig
    }
    
    return NextResponse.json({ config: result })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }
    
    const { error } = await supabaseAdmin
      .from('landing_page_configs')
      .delete()
      .eq('event_id', eventId)
    
    if (error) {
      console.error('Error deleting landing page config:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}