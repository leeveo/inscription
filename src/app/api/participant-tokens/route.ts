import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Vérification des variables d'environnement
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required but not defined')
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required but not defined')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Fonction pour générer un token unique
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// GET - Récupérer les informations d'un participant via son token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const eventId = searchParams.get('eventId')
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Récupérer les informations du participant
    const { data: participant, error } = await supabaseAdmin
      .from('inscription_participants')
      .select(`
        id,
        nom,
        prenom,
        email,
        telephone,
        profession,
        date_naissance,
        url_linkedin,
        url_facebook,
        url_twitter,
        url_instagram,
        evenement_id,
        token_landing_page,
        inscription_evenements:evenement_id (
          id,
          nom,
          description,
          lieu,
          date_debut,
          date_fin,
          prix,
          organisateur
        )
      `)  
      .eq('token_landing_page', token)
      .single()

    if (error || !participant) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    // Vérifier que l'eventId correspond (sécurité)
    if (eventId && participant.evenement_id !== eventId) {
      return NextResponse.json({ error: 'Token/Event mismatch' }, { status: 403 })
    }

    // Enregistrer la visite (commenté temporairement pour debug)
    /*
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || null

    await supabaseAdmin
      .from('landing_page_visits')
      .insert({
        participant_id: participant.id,
        event_id: participant.evenement_id,
        token: token,
        ip_address: clientIp,
        user_agent: userAgent,
        referrer: referrer
      })
    */

    return NextResponse.json({ 
      participant: {
        ...participant,
        // Ne pas exposer le token dans la réponse
        token_landing_page: undefined
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Générer ou régénérer un token pour un participant
export async function POST(request: NextRequest) {
  try {
    console.log('🔑 Variables d\'environnement:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'DÉFINI' : 'MANQUANT')
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? `DÉFINI (${supabaseServiceKey.substring(0, 20)}...)` : 'MANQUANT')
    
    const body = await request.json()
    const { participantId, action } = body
    
    console.log('📝 Requête reçue:', { participantId, action })

    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 })
    }

    let token: string
    let attempts = 0
    const maxAttempts = 10

    // Générer un token unique (avec retry en cas de collision)
    do {
      token = generateToken()
      attempts++
      
      console.log(`🔄 Tentative ${attempts}: génération token ${token.substring(0, 8)}...`)
      
      const { data: existing, error: checkError } = await supabaseAdmin
        .from('inscription_participants')
        .select('id')
        .eq('token_landing_page', token)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erreur lors de la vérification du token:', checkError)
        throw checkError
      }
      
      if (!existing) {
        console.log('✅ Token unique trouvé')
        break
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique token')
      }
    } while (true)

    // Mettre à jour le participant avec le nouveau token
    console.log(`💾 Mise à jour du participant ${participantId} avec le token ${token.substring(0, 8)}...`)
    
    const { data: updatedParticipant, error } = await supabaseAdmin
      .from('inscription_participants')
      .update({ token_landing_page: token })
      .eq('id', participantId)
      .select('id, nom, prenom, email, evenement_id, token_landing_page')
      .single()

    if (error) {
      console.error('❌ Erreur lors de la mise à jour du participant:', error)
      throw error
    }
    
    console.log('✅ Participant mis à jour avec succès:', {
      id: updatedParticipant.id,
      nom: updatedParticipant.nom,
      prenom: updatedParticipant.prenom
    })

    // Générer l'URL complète avec le domaine public pour les landing pages
    const publicBaseUrl = process.env.NEXT_PUBLIC_PUBLIC_BASE_URL || 'https://waivent.app'
    const landingUrl = `${publicBaseUrl}/landing/${updatedParticipant.evenement_id}/${token}`

    return NextResponse.json({ 
      token,
      landingUrl,
      participant: {
        ...updatedParticipant,
        token: updatedParticipant.token_landing_page // Compatibilité avec l'interface frontend
      }
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Marquer une conversion (inscription réussie via lien personnalisé)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, participantId } = body

    if (!token || !participantId) {
      return NextResponse.json({ error: 'Token and participant ID are required' }, { status: 400 })
    }

    // Marquer les visites récentes comme converties (commenté temporairement pour debug)
    /*
    const { error } = await supabaseAdmin
      .from('landing_page_visits')
      .update({ 
        converted: true, 
        conversion_at: new Date().toISOString() 
      })
      .eq('token', token)
      .eq('participant_id', participantId)
      .gte('visited_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Dernières 24h

    if (error) {
      throw error
    }
    */

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}