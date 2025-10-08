import { NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';

interface EmailRequest {
  eventId: string;
  participantData: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    profession?: string;
  };
  customSenderEmail?: string;
}

export async function POST(request: Request) {
  try {
    const body: EmailRequest = await request.json();
    const { eventId, participantData, customSenderEmail } = body;

    if (!eventId || !participantData.email) {
      return NextResponse.json(
        { success: false, error: 'eventId et email du participant sont requis' },
        { status: 400 }
      );
    }

    // Récupérer les informations de l'événement
    const supabase = supabaseApi();
    const { data: event, error: eventError } = await supabase
      .from('inscription_evenements')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    // Déterminer l'email d'envoi avec validation
    const requestedEmail = customSenderEmail || event.email_envoi || event.email_contact;

    if (!requestedEmail) {
      return NextResponse.json(
        { success: false, error: 'Aucun email d\'envoi configuré pour cet événement' },
        { status: 400 }
      );
    }

    // Valider l'autorisation d'envoi pour cette adresse
    const { data: authorizedSender, error: senderError } = await supabase
      .from('authorized_email_senders')
      .select('*')
      .eq('email_address', requestedEmail)
      .eq('is_active', true)
      .eq('verification_status', 'verified')
      .single();

    let senderEmail: string;
    let senderName: string;

    if (senderError || !authorizedSender) {
      console.warn(`⚠️ Email non autorisé: ${requestedEmail}, utilisation de l'email par défaut`);

      // Fallback vers l'email par défaut du SaaS
      const { data: defaultSender, error: defaultError } = await supabase
        .from('authorized_email_senders')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .eq('verification_status', 'verified')
        .single();

      if (defaultError || !defaultSender) {
        return NextResponse.json(
          { success: false, error: 'Aucun email d\'envoi autorisé disponible' },
          { status: 403 }
        );
      }

      senderEmail = defaultSender.email_address;
      senderName = defaultSender.display_name || process.env.BREVO_FROM_NAME || 'Waibooth';

      console.log(`🔄 Utilisation de l'email par défaut: ${senderEmail}`);
    } else {
      senderEmail = authorizedSender.email_address;
      senderName = authorizedSender.display_name || event.nom;

      // Mettre à jour les statistiques d'utilisation
      await supabase
        .from('authorized_email_senders')
        .update({
          last_used_at: new Date().toISOString(),
          usage_count: authorizedSender.usage_count + 1
        })
        .eq('id', authorizedSender.id);
    }

    // Récupérer le template email d'inscription personnalisé s'il existe
    const { data: template } = await supabase
      .from('inscription_email_templates')
      .select('*')
      .eq('evenement_id', eventId)
      .single();

    // Créer le contenu de l'email
    const subject = template?.subject
      ? replaceTemplateVariables(template.subject, event, participantData)
      : `Confirmation d'inscription - ${event.nom}`;

    const htmlContent = template?.html_content
      ? replaceTemplateVariables(template.html_content, event, participantData)
      : generateDefaultEmailContent(event, participantData);

    // Envoyer l'email via Brevo
    const brevoResponse = await sendEmailViaBrevo({
      senderEmail,
      recipientEmail: participantData.email,
      subject,
      htmlContent,
      participantName: `${participantData.prenom} ${participantData.nom}`,
      eventName: event.nom
    });

    if (!brevoResponse.success) {
      console.error('Erreur Brevo:', brevoResponse.error);
      return NextResponse.json(
        { success: false, error: `Erreur d'envoi d'email: ${brevoResponse.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email d\'inscription envoyé avec succès',
      messageId: brevoResponse.messageId
    });

  } catch (error) {
    console.error('Erreur dans l\'envoi d\'email d\'inscription:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

function replaceTemplateVariables(
  template: string,
  event: any,
  participant: { nom: string; prenom: string; email: string; telephone?: string; profession?: string }
): string {
  return template
    .replace(/{{event_name}}/g, event.nom)
    .replace(/{{event_date}}/g, new Date(event.date_debut).toLocaleDateString('fr-FR'))
    .replace(/{{event_location}}/g, event.lieu)
    .replace(/{{event_description}}/g, event.description || '')
    .replace(/{{participant_firstname}}/g, participant.prenom)
    .replace(/{{participant_lastname}}/g, participant.nom)
    .replace(/{{participant_email}}/g, participant.email)
    .replace(/{{participant_phone}}/g, participant.telephone || '')
    .replace(/{{participant_profession}}/g, participant.profession || '')
    .replace(/{{registration_date}}/g, new Date().toLocaleDateString('fr-FR'));
}

function generateDefaultEmailContent(event: any, participant: { nom: string; prenom: string; email: string }): string {
  const eventDate = new Date(event.date_debut).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation d'inscription</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Confirmation d'inscription</h1>
                <p>Merci ${participant.prenom} ${participant.nom} !</p>
            </div>

            <div class="content">
                <p>Votre inscription à l'événement <strong>${event.nom}</strong> a été confirmée avec succès.</p>

                <div class="event-details">
                    <h2>📅 Détails de l'événement</h2>
                    <p><strong>Nom:</strong> ${event.nom}</p>
                    <p><strong>Date:</strong> ${eventDate}</p>
                    <p><strong>Lieu:</strong> ${event.lieu}</p>
                    ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
                    ${event.prix ? `<p><strong>Prix:</strong> ${event.prix}€</p>` : ''}
                </div>

                <div class="event-details">
                    <h2>👤 Vos informations</h2>
                    <p><strong>Nom:</strong> ${participant.prenom} ${participant.nom}</p>
                    <p><strong>Email:</strong> ${participant.email}</p>
                </div>

                <p style="text-align: center;">
                    Nous vous recontacterons prochainement avec plus d'informations.
                </p>
            </div>

            <div class="footer">
                <p>Cet email a été envoyé automatiquement suite à votre inscription.</p>
                <p>Pour toute question, contactez-nous à ${event.email_contact || 'l\'organisateur'}.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

async function sendEmailViaBrevo(params: {
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  htmlContent: string;
  participantName: string;
  eventName: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY;

    if (!brevoApiKey) {
      return { success: false, error: 'Clé API Brevo manquante' };
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          email: params.senderEmail,
          name: `Équipe ${params.eventName}`
        },
        to: [{
          email: params.recipientEmail,
          name: params.participantName
        }],
        subject: params.subject,
        htmlContent: params.htmlContent,
        replyTo: {
          email: params.senderEmail,
          name: `Équipe ${params.eventName}`
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur Brevo:', errorData);
      return {
        success: false,
        error: `Brevo API Error: ${errorData.message || response.statusText}`
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId
    };

  } catch (error) {
    console.error('Erreur lors de l\'envoi via Brevo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}