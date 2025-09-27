import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use the anon key for database access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, anonKey)

// Function to send landing page link via Brevo API
async function sendLandingLinkViaBrevo(to: string, subject: string, html: string, eventName: string) {
  const apiKey = process.env.BREVO_API_KEY
  const fromEmail = process.env.BREVO_FROM_EMAIL
  const fromName = process.env.BREVO_FROM_NAME || eventName
  
  console.log('Brevo setup for landing link:')
  console.log('- API Key exists:', !!apiKey)
  console.log('- From Email:', fromEmail)
  console.log('- Event Name:', eventName)
  
  if (!apiKey || !fromEmail) {
    console.log('Brevo credentials missing, skipping real email send')
    return { success: false, reason: 'credentials_missing' }
  }
  
  try {
    console.log(`Preparing to send landing page link to: ${to}`)
    
    const payload = {
      sender: {
        email: fromEmail,
        name: fromName
      },
      to: [{
        email: to,
        name: to.split('@')[0]
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
    console.error("Error sending landing page link:", error)
    return { 
      success: false, 
      reason: 'exception',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

// Function to get email template
async function getEmailTemplate(eventId: string) {
  const { data, error } = await supabase
    .from('inscription_email_templates')
    .select('*')
    .eq('evenement_id', eventId)
    .maybeSingle()
  
  if (error) {
    console.error('Error fetching email template:', error)
    return null
  }
  
  return data
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
  token_landing_page?: string;
}

// Template variable replacement function for landing pages
function replaceTemplateVariables(
  template: string, 
  event: EventData, 
  participant: ParticipantData, 
  landingUrl: string,
  ticketUrl?: string
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
    .replace(/{{landing_url}}/g, landingUrl)
    .replace(/{{ticket_url}}/g, ticketUrl || landingUrl) // Fallback to landing URL if no ticket URL
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
    
    // Fetch participants with their landing page tokens
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
    
    // Get email template
    const emailTemplate = await getEmailTemplate(eventId)
    
    // Process each participant
    for (const participant of participantsData || []) {
      try {
        // Check if participant has a landing page token
        if (!participant.token_landing_page) {
          results.push({
            participantId: participant.id,
            email: participant.email,
            success: false,
            error: 'No landing page token found. Please generate one first.'
          })
          continue
        }

        const landingUrl = `${baseUrl}/landing/${eventId}/${participant.token_landing_page}`
        const ticketUrl = `${baseUrl}/ticket/${participant.id}`
        
        // Generate email content
        let emailSubject = `Votre lien d'inscription pour ${eventData.nom}`
        let emailHtml = ''
        
        if (emailTemplate) {
          // Use custom template
          emailSubject = replaceTemplateVariables(
            emailTemplate.subject, 
            eventData, 
            participant, 
            landingUrl,
            ticketUrl
          )
          
          emailHtml = replaceTemplateVariables(
            emailTemplate.html_content, 
            eventData, 
            participant, 
            landingUrl,
            ticketUrl
          )
        } else {
          // Default template for landing pages
          const eventDate = new Date(eventData.date_debut).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #1e3a8a; margin-bottom: 16px;">Confirmez votre inscription à ${eventData.nom}</h2>
              
              <p>Bonjour ${participant.prenom} ${participant.nom},</p>
              
              <p>Nous avons le plaisir de vous inviter à confirmer votre inscription à l'événement "${eventData.nom}" qui aura lieu le ${eventDate} à ${eventData.lieu}.</p>
              
              <div style="margin: 24px 0; text-align: center;">
                <a href="${landingUrl}" 
                   style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Confirmer mon inscription
                </a>
              </div>
              
              <p>Ce lien vous permettra de:</p>
              <ul>
                <li>Confirmer votre participation</li>
                <li>Consulter les détails de l'événement</li>
                <li>Vous inscrire aux sessions qui vous intéressent</li>
                <li>Recevoir votre billet d'accès</li>
              </ul>
              
              <p style="background: #fef3cd; padding: 12px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #f59e0b;">
                <strong>Important:</strong> Ce lien est personnel et unique. Ne le partagez pas.
              </p>
              
              <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                Lien direct: <a href="${landingUrl}" style="color: #2563eb; word-break: break-all;">${landingUrl}</a>
              </p>
              
              <p style="margin-top: 16px; font-size: 14px; color: #6b7280;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </div>
          `;
        }
        
        // Send email
        const emailResult = await sendLandingLinkViaBrevo(
          participant.email, 
          emailSubject, 
          emailHtml,
          eventData.nom
        );
        
        console.log(`[LANDING LINK ${emailResult.success ? 'SENT' : 'FAILED'}] To: ${participant.email}, Result:`, emailResult)
        
        // Mark as sent in database (different field to distinguish from ticket emails)
        await supabase
          .from('inscription_participants')
          .update({
            landing_link_sent: true,
            landing_link_sent_at: new Date().toISOString()
          })
          .eq('id', participant.id)
        
        results.push({
          participantId: participant.id,
          email: participant.email,
          landingUrl: landingUrl,
          success: emailResult.success,
          emailResult: emailResult
        })
      } catch (err) {
        console.error(`Error processing participant ${participant.id}:`, err)
        results.push({
          participantId: participant.id,
          email: participant.email,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }
    
    return NextResponse.json({
      message: `Processed ${results.length} landing page links`,
      results
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}