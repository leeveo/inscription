import { NextResponse } from 'next/server';
import { supabaseApi } from '@/lib/supabase/server';

interface InvitationEmailRequest {
  eventId: string;
  participants: Array<{
    email: string;
    nom: string;
    prenom: string;
    telephone?: string;
    profession?: string;
  }>;
  invitationTemplate: string;
  registrationFormType: string;
}

export async function POST(request: Request) {
  try {
    const body: InvitationEmailRequest = await request.json();
    const { eventId, participants, invitationTemplate, registrationFormType } = body;

    console.log('📧 === DÉBUT ENVOI EMAILS D\'INVITATION ===');
    console.log('📋 Données reçues:', { 
      eventId, 
      participantsCount: participants?.length || 0,
      participants: participants,
      invitationTemplate,
      registrationFormType 
    });

    if (!eventId || !participants || participants.length === 0) {
      console.error('❌ Données manquantes pour envoi emails');
      return NextResponse.json(
        { success: false, error: 'EventId et liste de participants requis' },
        { status: 400 }
      );
    }

    const supabase = supabaseApi();

    // Récupérer les informations de l'événement
    console.log('🔍 Recherche événement avec ID:', eventId);
    const { data: event, error: eventError } = await supabase
      .from('inscription_evenements')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('❌ Événement non trouvé:', eventError);
      return NextResponse.json(
        { success: false, error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    console.log('✅ Événement trouvé:', { 
      nom: event.nom, 
      email_contact: event.email_contact, 
      organisateur: event.organisateur 
    });

    const results: Array<{ participant: string; status: 'sent' | 'error'; error?: string }> = [];

    // Envoyer les emails d'invitation pour chaque participant
    console.log(`📤 Début envoi pour ${participants.length} participant(s)`);
    
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      console.log(`\n📧 [${i+1}/${participants.length}] Envoi à ${participant.email}`);
      
      try {
        // Générer l'email d'invitation personnalisé
        const invitationSubject = `Invitation - ${event.nom}`;
        console.log('📝 Génération contenu email...');
        
        const invitationContent = await generateInvitationEmail({
          event,
          participant,
          invitationTemplate,
          registrationFormType
        });
        
        console.log('✅ Contenu généré, taille:', invitationContent.length, 'caractères');

        // Configuration email - Utiliser toujours l'email Brevo vérifié
        const senderEmail = process.env.BREVO_FROM_EMAIL || 'waibooth.app@gmail.com';
        const senderName = event.organisateur || event.nom || process.env.BREVO_FROM_NAME || 'Waibooth';
        
        console.log('📤 Configuration email:', {
          senderEmail,
          senderName,
          recipientEmail: participant.email,
          subject: invitationSubject
        });

        // Utiliser l'API d'envoi d'emails existante
        const emailResponse = await sendEmailViaBrevo({
          senderEmail,
          senderName,
          recipientEmail: participant.email,
          subject: invitationSubject,
          htmlContent: invitationContent,
          participantName: `${participant.prenom} ${participant.nom}`,
          eventName: event.nom
        });

        console.log('📧 Réponse Brevo:', emailResponse);

        if (emailResponse.success) {
          console.log('✅ Email envoyé avec succès à', participant.email, 'MessageID:', emailResponse.messageId);
          results.push({
            participant: participant.email,
            status: 'sent'
          });
        } else {
          console.error('❌ Échec envoi email à', participant.email, ':', emailResponse.error);
          results.push({
            participant: participant.email,
            status: 'error',
            error: emailResponse.error
          });
        }

        // Petit délai pour éviter de surcharger l'API Brevo
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Erreur lors de l'envoi à ${participant.email}:`, error);
        results.push({
          participant: participant.email,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      message: `${successCount} email(s) d'invitation envoyé(s) avec succès`,
      results: {
        sent: successCount,
        errors: errorCount,
        details: results
      }
    });

  } catch (error) {
    console.error('Erreur dans l\'envoi d\'emails d\'invitation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

async function generateInvitationEmail(params: {
  event: any;
  participant: any;
  invitationTemplate: string;
  registrationFormType: string;
}): Promise<string> {
  const { event, participant, invitationTemplate, registrationFormType } = params;

  // URL d'inscription (à adapter selon votre système)
  const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/inscription/${event.id}?type=${registrationFormType}`;

  const eventDate = new Date(event.date_debut).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).replace(/^(.)|\s+(.)/g, c => c.toUpperCase());

  const headerColor = event.couleur_header_email || '#3b82f6';

  // Template moderne
  if (invitationTemplate === 'invitation1') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation - ${event.nom}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              
              <!-- Header moderne -->
              <div style="background: linear-gradient(135deg, ${headerColor} 0%, #667eea 100%); color: white; padding: 40px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
                  <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">
                      🎉 Vous êtes invité(e) !
                  </h1>
                  <p style="margin: 0; font-size: 18px; opacity: 0.9;">
                      ${event.nom}
                  </p>
              </div>

              <!-- Contenu -->
              <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
                  <p style="font-size: 18px; margin: 0 0 20px 0;">
                      Bonjour <strong>${participant.prenom}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.7;">
                      Nous avons le plaisir de vous inviter à participer à <strong>${event.nom}</strong>.
                      Cet événement promet d'être enrichissant et nous serions ravis de vous y accueillir.
                  </p>

                  <!-- Détails de l'événement -->
                  <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid ${headerColor}; margin: 25px 0;">
                      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">
                          📅 Détails de l'événement
                      </h3>
                      <p style="margin: 0 0 10px 0;"><strong>Date :</strong> ${eventDate}</p>
                      ${event.lieu ? `<p style="margin: 0 0 10px 0;"><strong>Lieu :</strong> ${event.lieu}</p>` : ''}
                      ${event.description ? `<p style="margin: 10px 0 0 0; color: #666; line-height: 1.6;">${event.description}</p>` : ''}
                  </div>

                  <!-- Bouton d'inscription -->
                  <div style="text-align: center; margin: 30px 0;">
                      <a href="${registrationUrl}" 
                         style="display: inline-block; background: linear-gradient(135deg, ${headerColor} 0%, #667eea 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                          ✨ S'inscrire maintenant
                      </a>
                  </div>

                  <p style="margin: 20px 0 0 0; font-size: 14px; color: #666; text-align: center;">
                      Cliquez sur le bouton ci-dessus pour confirmer votre participation
                  </p>
              </div>

              <!-- Footer -->
              <div style="text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #eee;">
                  <p style="margin: 0 0 10px 0;">
                      Cet email vous a été envoyé par <strong>${event.organisateur || event.nom}</strong>
                  </p>
                  ${event.email_contact ? `
                  <p style="margin: 0;">
                      Pour toute question : <a href="mailto:${event.email_contact}" style="color: ${headerColor};">${event.email_contact}</a>
                  </p>
                  ` : ''}
              </div>
          </div>
      </body>
      </html>
    `;
  }

  // Template classique
  if (invitationTemplate === 'invitation2') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation - ${event.nom}</title>
      </head>
      <body style="font-family: Georgia, serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              
              <!-- Header classique -->
              <div style="background: #2c3e50; color: white; padding: 35px; text-align: center; border-top: 5px solid ${headerColor};">
                  <h1 style="margin: 0 0 15px 0; font-size: 24px; font-weight: normal; letter-spacing: 1px; text-transform: uppercase;">
                      Invitation Officielle
                  </h1>
                  <div style="width: 100px; height: 2px; background: ${headerColor}; margin: 0 auto;"></div>
              </div>

              <!-- Contenu -->
              <div style="background: white; padding: 40px; margin-bottom: 20px;">
                  <p style="font-size: 16px; margin: 0 0 25px 0; text-align: center; font-style: italic;">
                      Madame, Monsieur <strong>${participant.nom}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 25px 0; font-size: 16px; text-align: justify; line-height: 1.8;">
                      Nous avons l'honneur de vous inviter à participer à <strong>${event.nom}</strong>.
                      Votre présence serait un honneur pour nous et enrichirait grandement cet événement.
                  </p>

                  <!-- Informations de l'événement -->
                  <div style="border: 2px solid ${headerColor}; padding: 25px; margin: 30px 0; background-color: #fafafa;">
                      <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 18px; text-align: center; text-transform: uppercase; letter-spacing: 1px;">
                          Informations Pratiques
                      </h3>
                      <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                              <td style="padding: 8px 0; font-weight: bold; width: 30%;">Événement :</td>
                              <td style="padding: 8px 0;">${event.nom}</td>
                          </tr>
                          <tr>
                              <td style="padding: 8px 0; font-weight: bold;">Date :</td>
                              <td style="padding: 8px 0;">${eventDate}</td>
                          </tr>
                          ${event.lieu ? `
                          <tr>
                              <td style="padding: 8px 0; font-weight: bold;">Lieu :</td>
                              <td style="padding: 8px 0;">${event.lieu}</td>
                          </tr>
                          ` : ''}
                      </table>
                      ${event.description ? `
                      <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
                          <p style="margin: 0; color: #555; text-align: justify; line-height: 1.6;">${event.description}</p>
                      </div>
                      ` : ''}
                  </div>

                  <!-- Bouton inscription -->
                  <div style="text-align: center; margin: 35px 0;">
                      <a href="${registrationUrl}" 
                         style="display: inline-block; background: ${headerColor}; color: white; text-decoration: none; padding: 12px 35px; border: 2px solid ${headerColor}; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s;">
                          Confirmer ma présence
                      </a>
                  </div>

                  <p style="margin: 25px 0 0 0; font-size: 14px; color: #666; text-align: center; font-style: italic;">
                      Nous vous prions de bien vouloir confirmer votre participation
                  </p>
              </div>

              <!-- Footer -->
              <div style="background: #2c3e50; color: #bdc3c7; padding: 20px; text-align: center; font-size: 13px;">
                  <p style="margin: 0 0 5px 0;">
                      ${event.organisateur || event.nom}
                  </p>
                  ${event.email_contact ? `
                  <p style="margin: 0;">
                      Contact : ${event.email_contact}
                  </p>
                  ` : ''}
              </div>
          </div>
      </body>
      </html>
    `;
  }

  // Template élégant (par défaut)
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation - ${event.nom}</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            
            <!-- Card principale -->
            <div style="background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
                
                <!-- Header élégant -->
                <div style="background: linear-gradient(135deg, ${headerColor} 0%, #9333ea 100%); color: white; padding: 50px 30px; text-align: center; position: relative;">
                   
                    <div style="position: relative; z-index: 1;">
                        <h1 style="margin: 0 0 15px 0; font-size: 32px; font-weight: 300; letter-spacing: -1px;">
                            Invitation Exclusive
                        </h1>
                        <div style="width: 80px; height: 2px; background: white; margin: 0 auto; opacity: 0.8;"></div>
                    </div>
                </div>

                <!-- Contenu élégant -->
                <div style="padding: 50px 40px;">
                    <p style="font-size: 20px; margin: 0 0 30px 0; text-align: center; color: #555;">
                        Cher(e) <span style="color: ${headerColor}; font-weight: 600;">${participant.prenom} ${participant.nom}</span>,
                    </p>
                    
                    <p style="margin: 0 0 35px 0; font-size: 16px; text-align: center; line-height: 1.8; color: #666;">
                        Vous êtes cordialement invité(e) à rejoindre un événement d'exception : 
                        <strong style="color: #333;">${event.nom}</strong>.
                    </p>

                    <!-- Card détails -->
                    <div style="background: linear-gradient(135deg, #f8f9ff 0%, #f0f0ff 100%); padding: 30px; border-radius: 15px; margin: 35px 0; border: 1px solid #e0e7ff;">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <h3 style="margin: 0; color: ${headerColor}; font-size: 18px; font-weight: 600;">
                                🗓️ Détails de l'événement
                            </h3>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 15px;">
                            <div style="text-align: center;">
                                <div style="font-weight: 600; color: #333; margin-bottom: 5px;">📅 ${eventDate}</div>
                            </div>
                            ${event.lieu ? `
                            <div style="text-align: center;">
                                <div style="font-weight: 600; color: #333; margin-bottom: 5px;">📍 ${event.lieu}</div>
                            </div>
                            ` : ''}
                        </div>
                        
                        ${event.description ? `
                        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #ddd;">
                            <p style="margin: 0; color: #555; text-align: center; line-height: 1.7; font-style: italic;">
                                "${event.description}"
                            </p>
                        </div>
                        ` : ''}
                    </div>

                    <!-- Bouton CTA -->
                    <div style="text-align: center; margin: 45px 0;">
                        <a href="${registrationUrl}" 
                           style="display: inline-block; background: linear-gradient(135deg, ${headerColor} 0%, #9333ea 100%); color: white; text-decoration: none; padding: 18px 45px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); transition: all 0.3s ease; text-transform: none;">
                            ✨ Réserver ma place
                        </a>
                    </div>

                    <p style="margin: 30px 0 0 0; font-size: 14px; color: #888; text-align: center; line-height: 1.6;">
                        Cliquez sur le bouton pour accéder au formulaire d'inscription<br/>
                        <em>Votre présence sera un honneur pour nous</em>
                    </p>
                </div>

                <!-- Footer élégant -->
                <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #333;">
                        ${event.organisateur || event.nom}
                    </p>
                    ${event.email_contact ? `
                    <p style="margin: 0; font-size: 14px; color: #666;">
                        Contact : <a href="mailto:${event.email_contact}" style="color: ${headerColor}; text-decoration: none;">${event.email_contact}</a>
                    </p>
                    ` : ''}
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
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
    console.log('🔑 Vérification clé API Brevo...');
    const brevoApiKey = process.env.BREVO_API_KEY;

    if (!brevoApiKey) {
      console.error('❌ Clé API Brevo manquante dans les variables d\'environnement');
      return { success: false, error: 'Clé API Brevo manquante' };
    }
    
    console.log('✅ Clé API Brevo présente, longueur:', brevoApiKey.length);

    const emailPayload = {
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
    };

    console.log('📤 Payload Brevo:', {
      sender: emailPayload.sender,
      to: emailPayload.to,
      subject: emailPayload.subject,
      htmlContentLength: emailPayload.htmlContent.length
    });

    console.log('🌐 Appel API Brevo...');
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify(emailPayload)
    });

    console.log('📡 Statut réponse Brevo:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erreur Brevo - Status:', response.status);
      console.error('❌ Erreur Brevo - Détails:', errorData);
      return {
        success: false,
        error: `Brevo API Error: ${errorData.message || response.statusText}`
      };
    }

    const data = await response.json();
    console.log('✅ Succès Brevo - Réponse:', data);
    return {
      success: true,
      messageId: data.messageId
    };

  } catch (error) {
    console.error('❌ Exception lors de l\'envoi via Brevo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}