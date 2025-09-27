import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use the anon key for database access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, anonKey)

// Enhanced function to send ticket via Brevo API
async function sendTicketViaBrevo(to: string, subject: string, html: string, eventName: string) {
  const apiKey = process.env.BREVO_API_KEY
  const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.FROM_EMAIL
  const fromName = process.env.BREVO_FROM_NAME || process.env.FROM_NAME || eventName
  
  console.log('Brevo setup:')
  console.log('- API Key exists:', !!apiKey)
  console.log('- From Email:', fromEmail)
  
  if (!apiKey || !fromEmail) {
    console.log('Brevo credentials missing, skipping real email send')
    return { success: false, reason: 'credentials_missing' }
  }
  
  try {
    console.log(`Preparing to send ticket to: ${to}`)
    
    const payload = {
      sender: {
        email: fromEmail,
        name: fromName
      },
      to: [{
        email: to,
        name: to.split('@')[0] // Use email prefix as name fallback
      }],
      subject: subject,
      htmlContent: html
    }
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    console.log(`Brevo response status: ${response.status}`);
    
    if (!response.ok) {
      return { 
        success: false, 
        reason: 'api_error',
        status: response.status,
        details: responseText
      };
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (error) {
      console.log('Could not parse response as JSON', error);
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending ticket:", error)
    return { 
      success: false, 
      reason: 'exception',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

// Fonction pour obtenir ou créer un token QR unique pour un participant
async function getOrCreateQRToken(participantId: string, eventId: string): Promise<string> {
  try {
    // Vérifier si un token existe déjà
    const { data: existingToken, error: fetchError } = await supabase
      .from('inscription_participant_qr_tokens')
      .select('qr_token')
      .eq('participant_id', participantId)
      .eq('evenement_id', eventId)
      .eq('is_active', true)
      .maybeSingle()
    
    if (fetchError && fetchError.code !== '42P01') {
      console.error('Erreur lors de la récupération du token QR:', fetchError)
    }
    
    if (existingToken) {
      console.log('Token QR existant trouvé')
      return existingToken.qr_token
    }
    
    // Générer un nouveau token unique
    console.log('Génération d\'un nouveau token QR...')
    const newToken = generateUniqueToken()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    
    try {
      const { error: insertError } = await supabase
        .from('inscription_participant_qr_tokens')
        .insert({
          participant_id: participantId,
          evenement_id: eventId,
          qr_token: newToken,
          ticket_url: `${baseUrl}/checkin/${newToken}`,
          is_active: true
        })
      
      if (insertError) {
        console.error('Erreur lors de l\'insertion du token QR:', insertError)
        // Si la table n'existe pas, utiliser un token temporaire basé sur l'ID
        return `temp_${participantId.substring(0, 8)}_${eventId.substring(0, 8)}_${Date.now()}`
      }
      
      console.log('Nouveau token QR créé')
      return newToken
    } catch (insertErr) {
      console.warn('Table QR tokens non disponible, génération token temporaire')
      return `temp_${participantId.substring(0, 8)}_${eventId.substring(0, 8)}_${Date.now()}`
    }
    
  } catch (err) {
    console.error('Exception lors de la gestion du token QR:', err)
    // Fallback : générer un token temporaire unique
    return `temp_${participantId.substring(0, 8)}_${eventId.substring(0, 8)}_${Date.now()}`
  }
}

// Fonction pour générer un token unique
function generateUniqueToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Fonction pour obtenir le modèle de ticket personnalisé
async function getTicketTemplate(eventId: string) {
  try {
    const { data, error } = await supabase
      .from('inscription_ticket_templates')
      .select('*')
      .eq('evenement_id', eventId)
      .maybeSingle()
    
    if (error) {
      if (error.code === '42P01') {
        console.log('Table inscription_ticket_templates n\'existe pas')
        return null
      }
      console.error('Erreur lors de la récupération du modèle de ticket:', error)
      return null
    }
    
    console.log('Template trouvé:', data ? data.subject : 'Template par défaut')
    return data
  } catch (err) {
    console.error('Exception lors de la récupération du template:', err)
    return null
  }
}

// Fonction pour récupérer les sessions inscrites d'un participant
async function getParticipantSessions(participantId: string) {
  const { data, error } = await supabase
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
        type
      )
    `)
    .eq('participant_id', participantId)

  if (error) {
    console.error('Error fetching participant sessions:', error)
    return []
  }

  return data || []
}

// Define proper types
interface EventData {
  id: string;
  nom: string;
  date_debut: string;
  lieu: string;
  description?: string;
}

interface ParticipantData {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  profession?: string;
  created_at: string;
}

// Function to replace template variables with actual data
function replaceTemplateVariables(
  template: string, 
  event: EventData, 
  participant: ParticipantData, 
  sessionsHtml: string,
  qrCodeHtml: string,
  ticketUrl: string
) {
  return template
    .replace(/\{\{event_name\}\}/g, event.nom)
    .replace(/\{\{event_date\}\}/g, new Date(event.date_debut).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
    .replace(/\{\{event_location\}\}/g, event.lieu || '')
    .replace(/\{\{event_description\}\}/g, event.description || '')
    .replace(/\{\{participant_firstname\}\}/g, participant.prenom)
    .replace(/\{\{participant_lastname\}\}/g, participant.nom)
    .replace(/\{\{participant_email\}\}/g, participant.email)
    .replace(/\{\{participant_phone\}\}/g, participant.telephone || '')
    .replace(/\{\{participant_profession\}\}/g, participant.profession || '')
    .replace(/\{\{participant_sessions\}\}/g, sessionsHtml)
    .replace(/\{\{qr_code\}\}/g, qrCodeHtml)
    .replace(/\{\{ticket_url\}\}/g, ticketUrl)
    .replace(/\{\{registration_date\}\}/g, new Date(participant.created_at).toLocaleDateString('fr-FR'))
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== DÉBUT ENVOI TICKET ===')
    const body = await req.json()
    const { participantId, eventId } = body
    
    console.log('Paramètres reçus:', { participantId, eventId })
    
    if (!participantId || !eventId) {
      console.log('Paramètres manquants')
      return NextResponse.json(
        { success: false, message: 'Missing participant ID or event ID' },
        { status: 400 }
      )
    }
    
    // Vérification de la configuration
    const brevoApiKey = process.env.BREVO_API_KEY
    const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.FROM_EMAIL
    
    console.log('Configuration Brevo:')
    console.log('- API Key:', brevoApiKey ? 'Définie' : 'MANQUANTE')
    console.log('- From Email:', fromEmail || 'MANQUANT')
    
    // Fetch event details
    console.log('Récupération de l\'événement...')
    const { data: eventData, error: eventError } = await supabase
      .from('inscription_evenements')
      .select('*')
      .eq('id', eventId)
      .single()
    
    if (eventError || !eventData) {
      console.error('Événement non trouvé:', eventError)
      return NextResponse.json({ 
        success: false, 
        message: 'Event not found' 
      }, { status: 404 })
    }
    
    console.log('Événement trouvé:', eventData.nom)
    
    // Fetch participant details
    console.log('Récupération du participant...')
    const { data: participantData, error: participantError } = await supabase
      .from('inscription_participants')
      .select('*')
      .eq('id', participantId)
      .eq('evenement_id', eventId)
      .single()
    
    if (participantError || !participantData) {
      console.error('Participant non trouvé:', participantError)
      return NextResponse.json({ 
        success: false, 
        message: 'Participant not found' 
      }, { status: 404 })
    }
    
    console.log('Participant trouvé:', participantData.email)

    // Get participant sessions
    const sessions = await getParticipantSessions(participantId)
    
    // Build sessions HTML
    let sessionsHtml = '<p style="color: #6b7280;">Aucune session inscrite</p>'
    if (sessions && sessions.length > 0) {
      sessionsHtml = `
        <div style="margin: 15px 0;">
          ${sessions.map((sessionData: any) => {
            const session = sessionData.inscription_sessions
            if (!session) return ''
            return `
              <div style="border-left: 3px solid #059669; padding-left: 15px; margin-bottom: 15px; background: #f8fafc; padding: 12px; border-radius: 4px;">
                <h4 style="margin: 0 0 8px 0; color: #059669; font-size: 16px; font-weight: bold;">${session.titre}</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 8px;">
                  <span style="font-size: 13px; color: #6b7280;">📅 ${new Date(session.date).toLocaleDateString('fr-FR')}</span>
                  <span style="font-size: 13px; color: #6b7280;">⏰ ${session.heure_debut} - ${session.heure_fin}</span>
                  ${session.lieu ? `<span style="font-size: 13px; color: #6b7280;">📍 ${session.lieu}</span>` : ''}
                  ${session.intervenant ? `<span style="font-size: 13px; color: #6b7280;">👤 ${session.intervenant}</span>` : ''}
                </div>
                ${session.description ? `<p style="margin: 5px 0 0 0; font-size: 13px; color: #9ca3af; font-style: italic;">${session.description}</p>` : ''}
              </div>
            `
          }).join('')}
        </div>
      `
    }

    // Get or create unique QR token for this participant
    console.log('Récupération du token QR unique...')
    const qrToken = await getOrCreateQRToken(participantId, eventId)
    
    // Build QR Code HTML with unique token
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const checkInUrl = `${baseUrl}/checkin/${qrToken}`
    const qrCodeHtml = `
      <div style="text-align: center; margin: 20px 0;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkInUrl)}&bgcolor=FFFFFF&color=000000&margin=10&format=png" 
             alt="QR Code" 
             style="border: 2px solid #e5e7eb; border-radius: 8px; background: white; padding: 10px;" />
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">Scannez ce QR code à l'entrée de l'événement</p>
        <p style="margin: 5px 0 0 0; font-size: 10px; color: #9ca3af;">Code unique : ${qrToken.substring(0, 8)}...</p>
      </div>
    `

    // Get ticket template
    console.log('Récupération du template...')
    const ticketTemplate = await getTicketTemplate(eventId)
    const ticketUrl = `${baseUrl}/ticket/${participantId}`
    
    let subject = 'Votre ticket pour {{event_name}}'
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">{{event_name}}</h1>
          <p style="margin: 10px 0; opacity: 0.9;">{{event_date}} • {{event_location}}</p>
        </div>
        
        <div style="background: white; color: #333; padding: 30px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #667eea; margin-top: 0;">Bonjour {{participant_firstname}} {{participant_lastname}}</h2>
          
          <p>Voici votre ticket électronique pour l'événement <strong>{{event_name}}</strong>.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Détails de votre inscription</h3>
            <p><strong>Email :</strong> {{participant_email}}</p>
            <p><strong>Téléphone :</strong> {{participant_phone}}</p>
            <p><strong>Profession :</strong> {{participant_profession}}</p>
            <p><strong>Date d'inscription :</strong> {{registration_date}}</p>
          </div>
          
          <div style="background: #ecfdf5; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #059669;">Vos sessions inscrites</h3>
            {{participant_sessions}}
          </div>
          
          {{qr_code}}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="{{ticket_url}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Voir mon ticket complet</a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="margin: 0; opacity: 0.8; font-size: 14px;">{{event_description}}</p>
          <p style="margin: 10px 0 0 0; opacity: 0.8; font-size: 12px;">© {{event_name}} - Tous droits réservés</p>
        </div>
      </div>
    `

    if (ticketTemplate) {
      subject = ticketTemplate.subject
      htmlContent = ticketTemplate.html_content
      console.log('Template personnalisé utilisé')
    } else {
      console.log('Template par défaut utilisé')
    }

    // Replace template variables
    console.log('Remplacement des variables...')
    subject = replaceTemplateVariables(subject, eventData, participantData, sessionsHtml, qrCodeHtml, ticketUrl)
    htmlContent = replaceTemplateVariables(htmlContent, eventData, participantData, sessionsHtml, qrCodeHtml, ticketUrl)

    // Send ticket via Brevo
    console.log('Envoi via Brevo...')
    const ticketResult = await sendTicketViaBrevo(
      participantData.email, 
      subject, 
      htmlContent,
      eventData.nom
    )
    
    console.log(`[TICKET ${ticketResult.success ? 'SENT' : 'FAILED'}] To: ${participantData.email}`)
    console.log('Détails:', ticketResult)
    
    if (ticketResult.success) {
      // Mark ticket as sent in database
      try {
        const { error: updateError } = await supabase
          .from('inscription_participants')
          .update({
            ticket_sent: true,
            ticket_sent_at: new Date().toISOString()
          })
          .eq('id', participantId)
        
        if (updateError) {
          console.warn('Erreur mise à jour status ticket:', updateError)
        } else {
          console.log('Status ticket mis à jour en base')
        }
      } catch (updateErr) {
        console.warn('Exception mise à jour status:', updateErr)
      }
    }
    
    console.log('=== FIN ENVOI TICKET ===')
    
    return NextResponse.json({
      success: ticketResult.success,
      message: ticketResult.success ? 'Ticket envoyé avec succès' : 'Erreur lors de l\'envoi du ticket',
      details: ticketResult
    })
    
  } catch (error) {
    console.error('=== ERREUR GLOBALE ENVOI TICKET ===')
    console.error('Error sending ticket:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}