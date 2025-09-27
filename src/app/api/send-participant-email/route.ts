import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import BrevoEmailService from '@/lib/email/brevo'

interface SendEmailRequest {
  eventId: string
  participantId: string
  template: {
    subject: string
    html_content: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { eventId, participantId, template }: SendEmailRequest = await request.json()

    // Initialiser le service Brevo
    let emailService: BrevoEmailService
    try {
      emailService = new BrevoEmailService()
    } catch (error) {
      console.error('Erreur configuration Brevo:', error)
      return NextResponse.json(
        { error: 'Service d\'email non configuré correctement' },
        { status: 500 }
      )
    }

    // Récupérer les données de l'événement et du participant
    const supabase = await supabaseServer()

    const [eventResult, participantResult] = await Promise.all([
      supabase
        .from('inscription_evenements')
        .select('*')
        .eq('id', eventId)
        .single(),
      supabase
        .from('inscription_participants')
        .select('*')
        .eq('id', participantId)
        .single()
    ])

    if (eventResult.error || !eventResult.data) {
      console.error('Événement non trouvé:', eventResult.error)
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    if (participantResult.error || !participantResult.data) {
      console.error('Participant non trouvé:', participantResult.error)
      return NextResponse.json(
        { error: 'Participant non trouvé' },
        { status: 404 }
      )
    }

    const event = eventResult.data
    const participant = participantResult.data

    // Générer l'URL de la page d'inscription personnalisée (TOUJOURS landing page)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'
    
    // S'assurer que le participant a un token pour la landing page
    if (!participant.token_landing_page) {
      console.error('❌ Participant sans token de landing page:', participantId)
      return NextResponse.json(
        { error: 'Participant n\'a pas de token pour la page d\'inscription' },
        { status: 400 }
      )
    }

    const landingUrl = `${baseUrl}/landing/${eventId}/${participant.token_landing_page}`

    console.log(`📧 Préparation envoi email d'inscription pour ${participant.email}`)
    console.log(`🔗 URL de la page d'inscription: ${landingUrl}`)

    // Envoyer l'email avec le lien d'inscription via le service Brevo
    const result = await emailService.sendTicketEmail({
      participant: {
        id: participantId,
        email: participant.email,
        prenom: participant.prenom,
        nom: participant.nom
      },
      event: {
        id: eventId,
        nom: event.nom,
        date_debut: event.date_debut,
        lieu: event.lieu
      },
      template,
      ticketUrl: landingUrl  // Utiliser l'URL de la landing page comme "ticket"
    })

    // Log dans la base de données (optionnel)
    try {
      await supabase
        .from('email_send_logs')
        .insert({
          evenement_id: eventId,
          participant_id: participantId,
          email_address: participant.email,
          subject: template.subject,
          template_used: 'inscription_link',
          ticket_url: landingUrl,
          status: 'sent',
          provider_response: result
        })
      console.log('📝 Log d\'envoi sauvegardé')
    } catch (logError) {
      console.warn('⚠️ Impossible de logger l\'envoi d\'email:', logError)
      // Ne pas faire échouer l'envoi si le log échoue
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      participant: {
        id: participantId,
        email: participant.email,
        name: `${participant.prenom} ${participant.nom}`
      },
      landingUrl
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error)
    
    // Retourner plus de détails sur l'erreur pour le debugging
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'envoi de l\'email',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}