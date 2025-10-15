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
    let replyToEmail: string | undefined;

    if (senderError || !authorizedSender) {
      console.warn(`⚠️ Email non autorisé: ${requestedEmail}`);

      // Vérifier si l'email client est un domaine autorisé dans Brevo
      const clientEmail = event.email_envoi || requestedEmail;
      const isBrevoAuthorizedDomain = await checkBrevoAuthorizedDomain(clientEmail);
      
      // Priorité 1: Utiliser l'email client si le domaine est autorisé dans Brevo
      if (clientEmail && clientEmail.includes('@') && isBrevoAuthorizedDomain) {
        senderEmail = clientEmail;
        senderName = event.nom || 'Organisation';
        console.log(`📧 ✅ Utilisation de l'email client autorisé: ${senderEmail}`);
      } 
      // Priorité 2: Utiliser votre email avec reply-to client
      else if (clientEmail && clientEmail.includes('@')) {
        // Utiliser votre email vérifié mais avec reply-to du client
        const { data: defaultSender, error: defaultError } = await supabase
          .from('authorized_email_senders')
          .select('*')
          .eq('is_default', true)
          .eq('is_active', true)
          .eq('verification_status', 'verified')
          .single();

        if (!defaultError && defaultSender) {
          senderEmail = defaultSender.email_address;
          senderName = event.nom || defaultSender.display_name || 'Organisation';
          replyToEmail = clientEmail; // Les réponses iront vers le client
          console.log(`📧 ⚠️ Email client non autorisé, utilisation email vérifié avec reply-to: ${senderEmail} (reply-to: ${clientEmail})`);
        } else {
          senderEmail = clientEmail;
          senderName = event.nom || 'Organisation';
          console.log(`📧 ⚠️ Tentative d'utilisation email client non vérifié: ${senderEmail}`);
        }
      } 
      // Fallback: email par défaut du SaaS
      else {
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
      }
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
        
      console.log(`✅ Utilisation de l'email autorisé: ${senderEmail}`);
    }

    // Récupérer le template d'email sélectionné pour cet événement
    let selectedTemplate = null;
    
    // Essayer de récupérer le template sélectionné via email_template_id
    if (event.email_template_id) {
      const { data: templateData, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', event.email_template_id)
        .single();
        
      if (!templateError && templateData) {
        selectedTemplate = templateData;
        console.log(`✅ Template trouvé: ${selectedTemplate.name} (${selectedTemplate.template_type})`);
      }
    }
    
    // Fallback: utiliser le template par défaut si aucun sélectionné
    if (!selectedTemplate) {
      const { data: defaultTemplate, error: defaultError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_default', true)
        .single();
        
      if (!defaultError && defaultTemplate) {
        selectedTemplate = defaultTemplate;
        console.log(`🔄 Utilisation du template par défaut: ${selectedTemplate.name}`);
      }
    }

    // Créer le contenu de l'email
    const subject = event.objet_email_inscription && event.objet_email_inscription.trim()
      ? event.objet_email_inscription
      : `Confirmation d'inscription - ${event.nom}`;

    const htmlContent = selectedTemplate
      ? await generateEmailFromTemplate(selectedTemplate, event, participantData)
      : await generateDefaultEmailContent(event, participantData);

    // Envoyer l'email via Brevo
    const brevoResponse = await sendEmailViaBrevo({
      senderEmail,
      senderName,
      recipientEmail: participantData.email,
      subject,
      htmlContent,
      participantName: `${participantData.prenom} ${participantData.nom}`,
      eventName: event.nom,
      replyToEmail
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

async function generateEmailFromTemplate(selectedTemplate: any, event: any, participant: { nom: string; prenom: string; email: string; telephone?: string; profession?: string }): Promise<string> {
  // Formatter la date avec majuscules
  const eventDate = new Date(event.date_debut).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).replace(/^(.)|\s+(.)/g, c => c.toUpperCase());

  // Récupérer les sessions du participant
  const sessions = await getParticipantSessions(participant.email, event.id);
  const sessionsHtml = await generateSessionsHtmlForTemplate(sessions, selectedTemplate.template_type, event);

  // Variables de remplacement
  let html = selectedTemplate.html_content;
  const variables = {
    'header_color': event.couleur_header_email || '#667eea',
    'subject': event.objet_email_inscription || `Confirmation d'inscription - ${event.nom}`,
    'event_name': event.nom,
    'event_date': eventDate,
    'event_location': event.lieu,
    'event_description': event.description || '',
    'event_price': event.prix?.toString() || '',
    'participant_firstname': participant.prenom,
    'participant_lastname': participant.nom,
    'participant_email': participant.email,
    'participant_phone': participant.telephone || '',
    'participant_profession': participant.profession || '',
    'contact_email': event.email_contact || 'l\'organisateur',
    'logo_url': event.logo_url || ''
  };

  // Remplacer les variables simples
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value);
  });

  // Gérer les conditions Handlebars simples
  html = html.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
    const value = variables[variable as keyof typeof variables];
    return value && value.trim() ? content : '';
  });

  // Remplacer les sessions
  html = html.replace(/{{sessions_html}}/g, sessionsHtml);

  // Nettoyer le HTML restant
  html = html.replace(/{{{([^}]+)}}}/g, (match, content) => {
    const variable = content.trim();
    return variables[variable as keyof typeof variables] || '';
  });

  return html;
}

// Fonction pour générer le HTML des sessions selon le type de template
async function generateSessionsHtmlForTemplate(sessions: any[], templateType: string, event: any): Promise<string> {
  const headerColor = event.couleur_header_email || '#667eea';
  
  if (!sessions || sessions.length === 0) {
    const noSessionsContent = templateType === 'modern' 
      ? `<div style="background: #f8f9ff; padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 4px solid ${headerColor};">
           <h2 style="font-size: 20px; font-weight: 600; color: #2d3748; margin: 0 0 15px 0; display: flex; align-items: center;">
             <span style="font-size: 24px; margin-right: 10px;">🎯</span>
             Vos sessions sélectionnées
           </h2>
           <p style="color: #6b7280; margin: 0; font-style: italic;">
             Aucune session spécifique sélectionnée. Vous aurez accès à l'ensemble du programme.
           </p>
         </div>`
      : templateType === 'classic'
      ? `<div style="background: #f8f9fa; padding: 25px; border: 1px solid #dee2e6; margin: 25px 0;">
           <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #2c3e50; border-bottom: 2px solid ${headerColor}; padding-bottom: 10px;">
             VOS SESSIONS
           </h2>
           <p style="color: #7f8c8d; margin: 0; font-style: italic;">
             Aucune session spécifique sélectionnée. Accès au programme complet.
           </p>
         </div>`
      : templateType === 'original'
      ? `<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
           <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
             🎯 Vos sessions sélectionnées
           </h2>
           <p style="color: #6b7280; margin: 0; font-style: italic;">
             Aucune session spécifique sélectionnée. Vous aurez accès à l'ensemble du programme.
           </p>
         </div>`
      : `<div style="margin: 30px 0;">
           <h2 style="font-size: 18px; font-weight: 600; color: #2d3748; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
             Sessions
           </h2>
           <p style="color: #718096; margin: 0; font-style: italic;">
             Aucune session sélectionnée - Accès au programme complet
           </p>
         </div>`;
    
    return noSessionsContent;
  }

  // Générer le conteneur selon le template
  const containerStart = templateType === 'modern' 
    ? `<div style="background: #f8f9ff; padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 4px solid ${headerColor};">
         <h2 style="font-size: 20px; font-weight: 600; color: #2d3748; margin: 0 0 15px 0; display: flex; align-items: center;">
           <span style="font-size: 24px; margin-right: 10px;">🎯</span>
           Vos sessions sélectionnées
         </h2>`
    : templateType === 'classic'
    ? `<div style="background: #f8f9fa; padding: 25px; border: 1px solid #dee2e6; margin: 25px 0;">
         <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #2c3e50; border-bottom: 2px solid ${headerColor}; padding-bottom: 10px;">
           VOS SESSIONS
         </h2>`
    : templateType === 'original'
    ? `<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
         <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
           🎯 Vos sessions sélectionnées
         </h2>`
    : `<div style="margin: 30px 0;">
         <h2 style="font-size: 18px; font-weight: 600; color: #2d3748; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
           Sessions
         </h2>`;

  const containerEnd = '</div>';

  const sessionsHtml = sessions.map((session, index) => {
    const sessionDate = session.date ? new Date(session.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }) : 'Date à définir';

    if (templateType === 'original') {
      // Utiliser le même format que votre fonction generateSessionsHtml
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
      const borderColor = colors[index % colors.length];
      
      return `
        <div style="border-left: 4px solid ${borderColor}; padding-left: 15px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
            ${session.titre || 'Session sans titre'}
          </h3>
          <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 14px;">
            <span style="margin-right: 15px;">
              🕒 ${sessionDate} - ${session.heure_debut || ''}${session.heure_fin ? ` à ${session.heure_fin}` : ''}
            </span>
            ${session.lieu ? `<span>📍 ${session.lieu}</span>` : ''}
          </p>
          ${session.intervenant ? `<p style="color: #6b7280; margin: 0 0 5px 0; font-size: 14px;"><strong>Intervenant:</strong> ${session.intervenant}</p>` : ''}
          ${session.description ? `<p style="color: #6b7280; margin: 0; font-size: 14px;">${session.description}</p>` : ''}
        </div>
      `;
    }

    // Pour les autres templates
    const formattedDate = session.date ? new Date(session.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).replace(/^(.)|\s+(.)/g, c => c.toUpperCase()) : 'Date à définir';

    const sessionItemStyle = templateType === 'modern'
      ? `background: white; padding: 20px; margin: 15px 0; border-radius: 12px; border-left: 4px solid ${headerColor}; box-shadow: 0 2px 10px rgba(0,0,0,0.05);`
      : templateType === 'classic'
      ? `background: #ffffff; padding: 20px; margin: 15px 0; border: 1px solid #dee2e6; border-left: 4px solid ${headerColor};`
      : `padding: 20px 0; border-bottom: 1px solid #f7fafc;`;

    return `
      <div style="${sessionItemStyle}">
        <div style="font-weight: 600; color: #2d3748; margin-bottom: 8px; font-size: 16px;">
          ${session.titre || 'Session sans titre'}
        </div>
        <div style="color: #718096; font-size: 14px; margin-bottom: 5px;">
          📅 ${formattedDate}${session.heure_debut ? ` - ${session.heure_debut}` : ''}${session.heure_fin ? ` à ${session.heure_fin}` : ''}
        </div>
        ${session.lieu ? `<div style="color: #718096; font-size: 14px; margin-bottom: 5px;">📍 ${session.lieu}</div>` : ''}
        ${session.intervenant ? `<div style="color: #718096; font-size: 14px; margin-bottom: 5px;"><strong>Intervenant:</strong> ${session.intervenant}</div>` : ''}
        ${session.description ? `<div style="color: #718096; font-size: 14px;">${session.description}</div>` : ''}
      </div>
    `;
  }).join('');

  // Ajouter le rappel important selon le template
  const importantNote = templateType === 'modern'
    ? `<div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 15px;">
         <p style="color: #1e40af; margin: 0; font-size: 14px;">
           <strong>Rappel important :</strong> N'oubliez pas de vous présenter avec une pièce d'identité pour accéder au ministère de l'Intérieur.
         </p>
       </div>`
    : templateType === 'classic'
    ? `<div style="background: #e3f2fd; padding: 15px; border: 1px solid #bbdefb; margin-top: 15px;">
         <p style="color: #1565c0; margin: 0; font-size: 14px; font-style: italic;">
           <strong>Rappel :</strong> Munissez-vous d'une pièce d'identité pour l'accès au ministère.
         </p>
       </div>`
    : templateType === 'original'
    ? `<div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 15px;">
         <p style="color: #1e40af; margin: 0; font-size: 14px;">
           <strong>Rappel important :</strong> N'oubliez pas de vous présenter avec une pièce d'identité pour accéder au ministère de l'Intérieur.
         </p>
       </div>`
    : `<div style="padding: 15px; border-left: 3px solid #3b82f6; background: #f8fafc; margin-top: 15px;">
         <p style="color: #1e40af; margin: 0; font-size: 14px;">
           <strong>Important :</strong> Pièce d'identité requise pour l'accès.
         </p>
       </div>`;

  return containerStart + sessionsHtml + importantNote + containerEnd;
}

async function generateDefaultEmailContent(event: any, participant: { nom: string; prenom: string; email: string }): Promise<string> {
  const eventDate = new Date(event.date_debut).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).replace(/^(.)|\s+(.)/g, c => c.toUpperCase());

  // Utiliser la couleur personnalisée ou la couleur par défaut
  const headerColor = event.couleur_header_email || '#667eea';
  
  // Récupérer les sessions du participant
  const sessions = await getParticipantSessions(participant.email, event.id);
  const sessionsHtml = generateSessionsHtml(sessions);
  
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
            .header { background: ${headerColor}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: #f9f9f9; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .button { display: inline-block; padding: 12px 24px; background: ${headerColor}; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .logo { max-width: 150px; height: auto; margin-bottom: 20px; }
            .session-item { background: #f0f0f0; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid ${headerColor}; }
            .session-title { font-weight: bold; color: #333; margin-bottom: 8px; }
            .session-info { color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Confirmation d'inscription</h1>
                <p>Merci ${participant.prenom} ${participant.nom} !</p>
            </div>

            <div class="content">
                ${event.logo_url ? `
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="${event.logo_url}" alt="Logo ${event.nom}" class="logo" />
                </div>` : ''}
                <p>Votre inscription a bien été prise en compte.</p>

                <div class="event-details">
                    <h2>📅 Détails de l'événement</h2>
                    <p><strong>Nom:</strong> ${event.nom}</p>
                    <p><strong>Date:</strong> ${eventDate}</p>
                    <p><strong>Lieu:</strong> ${event.lieu}</p>
                    ${event.description ? `<p>${event.description}</p>` : ''}
                    ${event.prix ? `<p><strong>Prix:</strong> ${event.prix}€</p>` : ''}
                </div>

                ${sessionsHtml}

                <div class="event-details">
                    <h2>👤 Vos informations</h2>
                    <p><strong>Nom:</strong> ${participant.prenom} ${participant.nom}</p>
                    <p><strong>Email:</strong> ${participant.email}</p>
                </div>
            </div>

            <div class="footer">
                <p>Cet email a été envoyé automatiquement suite à votre inscription.</p>
                <p>Pour toute question, vous pouvez nous contacter à l'adresse suivante :<br/>${event.email_contact || 'l\'organisateur'}.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Fonction pour récupérer les sessions auxquelles un participant s'est inscrit
async function getParticipantSessions(participantEmail: string, eventId: string): Promise<any[]> {
  try {
    const supabase = supabaseApi();
    
    // Récupérer le participant par email et eventId
    const { data: participant, error: participantError } = await supabase
      .from('inscription_participants')
      .select('id')
      .eq('email', participantEmail)
      .eq('evenement_id', eventId)
      .single();

    if (participantError || !participant) {
      console.log('Participant non trouvé pour les sessions');
      return [];
    }

    // Récupérer les sessions auxquelles le participant s'est inscrit
    const { data: sessions, error: sessionsError } = await supabase
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
      .eq('participant_id', participant.id);

    if (sessionsError) {
      console.error('Erreur lors de la récupération des sessions:', sessionsError);
      return [];
    }

    return sessions?.map(s => s.inscription_sessions).filter(Boolean) || [];
  } catch (error) {
    console.error('Erreur dans getParticipantSessions:', error);
    return [];
  }
}

// Fonction pour générer le HTML des sessions
function generateSessionsHtml(sessions: any[]): string {
  if (!sessions || sessions.length === 0) {
    return `
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
          🎯 Vos sessions sélectionnées
        </h2>
        <p style="color: #6b7280; margin: 0; font-style: italic;">
          Aucune session spécifique sélectionnée. Vous aurez accès à l'ensemble du programme.
        </p>
      </div>
    `;
  }

  const sessionsHtml = sessions.map((session, index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
    const borderColor = colors[index % colors.length];
    
    const sessionDate = session.date ? new Date(session.date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }) : 'Date à définir';

    return `
      <div style="border-left: 4px solid ${borderColor}; padding-left: 15px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
          ${session.titre || 'Session sans titre'}
        </h3>
        <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 14px;">
          <span style="margin-right: 15px;">
            🕒 ${sessionDate} - ${session.heure_debut || ''}${session.heure_fin ? ` à ${session.heure_fin}` : ''}
          </span>
          ${session.lieu ? `<span>📍 ${session.lieu}</span>` : ''}
        </p>
        ${session.intervenant ? `<p style="color: #6b7280; margin: 0 0 5px 0; font-size: 14px;"><strong>Intervenant:</strong> ${session.intervenant}</p>` : ''}
        ${session.description ? `<p style="color: #6b7280; margin: 0; font-size: 14px;">${session.description}</p>` : ''}
      </div>
    `;
  }).join('');

  return `
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
        🎯 Vos sessions sélectionnées
      </h2>
      ${sessionsHtml}
      <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 15px;">
        <p style="color: #1e40af; margin: 0; font-size: 14px;">
          <strong>Rappel important :</strong>  N’oubliez pas de vous présenter avec une pièce
d’identité pour accéder au ministère de l’Intérieur. 
        </p>
      </div>
    </div>
  `;
}

// Fonction pour vérifier si un domaine est autorisé dans Brevo
async function checkBrevoAuthorizedDomain(email: string): Promise<boolean> {
  if (!email || !email.includes('@')) return false;
  
  const domain = email.split('@')[1];
  
  try {
    const supabase = supabaseApi();
    const { data, error } = await supabase
      .from('brevo_authorized_domains')
      .select('domain_name, is_verified')
      .eq('domain_name', domain.toLowerCase())
      .eq('is_verified', true)
      .eq('is_active', true)
      .single();
    
    if (error || !data) {
      console.log(`🔍 Domaine ${domain} non trouvé dans les domaines autorisés Brevo`);
      return false;
    }
    
    console.log(`✅ Domaine ${domain} vérifié dans Brevo`);
    return true;
  } catch (error) {
    console.warn('Erreur lors de la vérification du domaine Brevo:', error);
    return false;
  }
}

async function sendEmailViaBrevo(params: {
  senderEmail: string;
  senderName?: string;
  recipientEmail: string;
  subject: string;
  htmlContent: string;
  participantName: string;
  eventName: string;
  replyToEmail?: string;
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
          name: params.senderName || `Équipe ${params.eventName}`
        },
        to: [{
          email: params.recipientEmail,
          name: params.participantName
        }],
        subject: params.subject,
        htmlContent: params.htmlContent,
        replyTo: {
          email: params.replyToEmail || params.senderEmail,
          name: params.senderName || `Équipe ${params.eventName}`
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