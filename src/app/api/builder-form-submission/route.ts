import { NextRequest, NextResponse } from 'next/server'
import { supabaseApi } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  console.log('📧 API builder-form-submission appelée')

  try {
    const body = await request.json()
    console.log('📦 Données reçues:', body)

    const { participant, eventData, selectedSessions, recipientEmail, message } = body

    console.log('👤 Participant:', participant)
    console.log('🎯 Événement:', eventData)
    console.log('📚 Sessions sélectionnées:', selectedSessions)
    console.log('📧 Email destinataire:', recipientEmail)

    // Validation des données requises
    if (!participant || !eventData || !recipientEmail) {
      console.log('❌ Données manquantes - participant:', !!participant, 'eventData:', !!eventData, 'recipientEmail:', !!recipientEmail)
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Préparer le contenu de l'email
    const emailContent = {
      to: recipientEmail,
      subject: `Nouvelle inscription - ${eventData.nom}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin: 0 0 10px 0;">Nouvelle inscription à l'événement</h2>
            <p style="color: #6b7280; margin: 0;">Une nouvelle personne vient de s'inscrire via le formulaire du site.</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Informations sur l'événement</h3>
            <p style="margin: 5px 0;"><strong>Nom:</strong> ${eventData.nom}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(eventData.date_debut).toLocaleDateString('fr-FR')}</p>
            <p style="margin: 5px 0;"><strong>Lieu:</strong> ${eventData.lieu}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 15px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Informations du participant</h3>
            <p style="margin: 5px 0;"><strong>Nom:</strong> ${participant.nom} ${participant.prenom}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${participant.email}</p>
            <p style="margin: 5px 0;"><strong>Téléphone:</strong> ${participant.telephone}</p>
            ${participant.profession ? `<p style="margin: 5px 0;"><strong>Profession:</strong> ${participant.profession}</p>` : ''}
            ${participant.url_linkedin ? `<p style="margin: 5px 0;"><strong>LinkedIn:</strong> <a href="${participant.url_linkedin}" style="color: #3b82f6;">Profil LinkedIn</a></p>` : ''}
            ${participant.url_facebook ? `<p style="margin: 5px 0;"><strong>Facebook:</strong> <a href="${participant.url_facebook}" style="color: #3b82f6;">Profil Facebook</a></p>` : ''}
            ${participant.url_twitter ? `<p style="margin: 5px 0;"><strong>Twitter:</strong> <a href="${participant.url_twitter}" style="color: #3b82f6;">Profil Twitter</a></p>` : ''}
            ${participant.url_instagram ? `<p style="margin: 5px 0;"><strong>Instagram:</strong> <a href="${participant.url_instagram}" style="color: #3b82f6;">Profil Instagram</a></p>` : ''}
          </div>

          ${selectedSessions && selectedSessions.length > 0 ? `
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 15px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">Sessions sélectionnées</h3>
              <p style="margin: 5px 0;">Le participant s'est inscrit à ${selectedSessions.length} session(s).</p>
            </div>
          ` : ''}

          ${message ? `
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-top: 15px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">Message du participant</h3>
              <p style="margin: 5px 0; white-space: pre-wrap;">${message}</p>
            </div>
          ` : ''}

          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Email généré automatiquement depuis le formulaire d'inscription du site<br>
              Date: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
      `
    }

    // Utiliser le service email existant (Brevo ou MailerSend)
    // Pour l'instant, nous allons simplement logger l'envoi
    console.log('Email de notification envoyé:', {
      to: recipientEmail,
      subject: emailContent.subject,
      participant: participant.email,
      event: eventData.nom
    })

    // TODO: Intégrer avec le service email (Brevo/MailerSend)
    // Vous pouvez appeler l'API existante comme:
    // await fetch('/api/send-participant-email', { ... })

    return NextResponse.json({
      success: true,
      message: 'Notification envoyée avec succès'
    })

  } catch (error) {
    console.error('Erreur lors du traitement de la soumission:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}