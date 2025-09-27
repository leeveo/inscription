import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use the anon key for database access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, anonKey)

// Enhanced function to send ticket via Brevo API
async function sendTicketViaBrevo(to: string, subject: string, html: string, eventName: string) {
  const apiKey = process.env.BREVO_API_KEY
  const fromEmail = process.env.BREVO_FROM_EMAIL
  const fromName = process.env.BREVO_FROM_NAME || eventName
  
  console.log('Brevo setup:')
  console.log('- API Key exists:', !!apiKey)
  console.log('- From Email:', fromEmail)
  console.log('- Event Name:', eventName)
  
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
    
    console.log('Request payload:', JSON.stringify(payload))
    
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
    console.log(`Brevo response body: ${responseText}`);
    
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

// Fonction pour obtenir le modèle d'email personnalisé
async function getEmailTemplate(eventId: string) {
  const { data, error } = await supabase
    .from('inscription_email_templates')
    .select('*')
    .eq('evenement_id', eventId)
    .maybeSingle()
  
  if (error) {
    console.error('Erreur lors de la récupération du modèle d\'email:', error)
    return null
  }
  
  return data
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

// Define proper types instead of using 'any'
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
}

// Update the function signature to use the new interfaces and support both ticket and landing URLs
function replaceTemplateVariables(
  template: string, 
  event: EventData, 
  participant: ParticipantData, 
  ticketUrl: string,
  landingUrl?: string
) {
  return template
    .replace(/{{event_name}}/g, event.nom)
    .replace(/{{event_date}}/g, new Date(event.date_debut).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
    .replace(/{{event_location}}/g, event.lieu)
    .replace(/{{participant_firstname}}/g, participant.prenom)
    .replace(/{{participant_lastname}}/g, participant.nom)
    .replace(/{{participant_email}}/g, participant.email)
    .replace(/{{ticket_url}}/g, ticketUrl)
    .replace(/{{landing_url}}/g, landingUrl || ticketUrl) // Fallback to ticketUrl if no landing URL
}

export async function POST(req: NextRequest) {
  try {
    const { participantIds, eventId } = await req.json()
    
    if (!participantIds?.length || !eventId) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      )
    }
    
    // Fetch event details
    const { data: eventData, error: eventError } = await supabase
      .from('inscription_evenements')
      .select('*')
      .eq('id', eventId)
      .single()
    
    if (eventError) {
      console.error('Error fetching event:', eventError)
      return NextResponse.json({ message: 'Error fetching event details' }, { status: 500 })
    }
    
    // Fetch participants
    const { data: participantsData, error: participantsError } = await supabase
      .from('inscription_participants')
      .select('*')
      .in('id', participantIds)
      .eq('evenement_id', eventId)
    
    if (participantsError) {
      console.error('Error fetching participants:', participantsError)
      return NextResponse.json({ message: 'Error fetching participants' }, { status: 500 })
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    const results = []
    
    // Récupérer le modèle d'email personnalisé
    const emailTemplate = await getEmailTemplate(eventId)
    
    // Process each participant
    for (const participant of participantsData || []) {
      try {
        const ticketUrl = `${baseUrl}/ticket/${participant.id}`
        
        // Générer le contenu HTML personnalisé
        let emailSubject = 'Votre billet'
        let emailHtml = ''
        
        if (emailTemplate) {
          // Utiliser le modèle personnalisé
          emailSubject = replaceTemplateVariables(
            emailTemplate.subject, 
            eventData, 
            participant, 
            ticketUrl
          )
          
          emailHtml = replaceTemplateVariables(
            emailTemplate.html_content, 
            eventData, 
            participant, 
            ticketUrl
          )
        } else {
          // Fallback au template par défaut
          // Format date for email
          const eventDate = new Date(eventData.date_debut).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          
          // Create email HTML content
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #1e3a8a; margin-bottom: 16px;">Votre billet pour ${eventData.nom}</h2>
              
              <p>Bonjour ${participant.prenom} ${participant.nom},</p>
              
              <p>Voici votre billet pour l'événement "${eventData.nom}" qui aura lieu le ${eventDate} à ${eventData.lieu}.</p>
              
              <div style="margin: 24px 0; text-align: center;">
                <a href="${ticketUrl}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Voir mon billet
                </a>
              </div>
              
              <p>Vous pouvez accéder à votre billet à tout moment en utilisant le lien ci-dessus. N'oubliez pas de présenter votre billet (QR code) lors de votre arrivée à l'événement.</p>
              
              <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </div>
          `;
        }
        
        // Send real email with enhanced response
        const emailResult = await sendTicketViaBrevo(
          participant.email, 
          emailSubject, 
          emailHtml,
          eventData.nom
        );
        
        console.log(`[EMAIL ${emailResult.success ? 'SENT' : 'FAILED'}] To: ${participant.email}, Result:`, emailResult)
        
        // Mark as sent in database
        await supabase
          .from('inscription_participants')
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString()
          })
          .eq('id', participant.id)
        
        results.push({
          participantId: participant.id,
          email: participant.email,
          success: true,
          emailResult: emailResult,
          trialModeActive: process.env.MAILERSEND_IS_TRIAL === 'true'
        })
      } catch (err) {
        console.error(`Error processing participant ${participant.id}:`, err)
        results.push({
          participantId: participant.id,
          email: participant.email,
          success: false
        })
      }
    }
    
    return NextResponse.json({
      message: `Processed ${results.length} emails`,
      results
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
