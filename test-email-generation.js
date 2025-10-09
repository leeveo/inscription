// Test direct de la logique d'envoi d'email sans serveur
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://giafkganhfuxvadeiars.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpYWZrZ2FuaGZ1eHZhZGVpYXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNzMyMjUsImV4cCI6MjA0NDc0OTIyNX0.pS7TxrbTiJK1MhiIFJBELx_u9abS3yub1AcDu3Ex1Y8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour envoyer un email via Brevo (mockée pour le test)
async function sendEmailViaBrevo(emailData) {
  console.log('📧 Simulation d\'envoi via Brevo:');
  console.log('   De:', emailData.senderEmail);
  console.log('   À:', emailData.recipientEmail);
  console.log('   Sujet:', emailData.subject);
  console.log('   Contenu HTML:', emailData.htmlContent.substring(0, 200) + '...');
  
  // Simulation d'un succès
  return {
    success: true,
    messageId: 'mock-message-id-' + Date.now()
  };
}

// Fonction pour récupérer les sessions d'un participant (mockée)
async function getParticipantSessions(email, eventId) {
  // Données de test
  return [
    {
      id: 1,
      nom: 'Session d\'ouverture',
      description: 'Présentation générale de l\'événement',
      date_debut: '2024-11-15T09:00:00',
      date_fin: '2024-11-15T10:30:00',
      lieu: 'Salle principale'
    },
    {
      id: 2,
      nom: 'Atelier pratique',
      description: 'Mise en pratique des concepts présentés',
      date_debut: '2024-11-15T14:00:00',
      date_fin: '2024-11-15T16:00:00',
      lieu: 'Salle de formation'
    }
  ];
}

// Fonction pour générer le HTML des sessions
function generateSessionsHtml(sessions) {
  if (!sessions || sessions.length === 0) {
    return '';
  }

  const sessionsItems = sessions.map(session => {
    const dateDebut = new Date(session.date_debut).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const dateFin = new Date(session.date_fin).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="session-item">
        <div class="session-title">${session.nom}</div>
        <div class="session-info">
          📅 ${dateDebut} - ${dateFin}<br>
          📍 ${session.lieu}<br>
          ${session.description ? `📋 ${session.description}` : ''}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="event-details">
      <h2>📚 Vos sessions inscrites</h2>
      ${sessionsItems}
    </div>`;
}

// Fonction principale de génération d'email
async function generateDefaultEmailContent(event, participant) {
  const headerColor = event.couleur_header_email || '#667eea';
  
  const eventDate = new Date(event.date_evenement).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
                ${event.logo_url ? `<img src="${event.logo_url}" alt="Logo ${event.nom}" class="logo" />` : ''}
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

                ${sessionsHtml}

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

// Test principal
async function testEmailGeneration() {
  console.log('🧪 Test de génération d\'email pour marcmenu707@gmail.com\n');

  // Données d'événement mockées
  const mockEvent = {
    id: 1,
    nom: 'Conférence Tech 2024',
    date_evenement: '2024-11-15',
    lieu: 'Centre de Conférences Paris',
    description: 'Une conférence passionnante sur les dernières innovations technologiques avec des speakers de renommée internationale.',
    prix: '50',
    couleur_header_email: '#4F46E5',
    objet_email_inscription: 'Bienvenue à la Conférence Tech 2024 !',
    email_contact: 'contact@conference-tech.com',
    logo_url: 'https://example.com/logo.png'
  };

  // Données de participant
  const mockParticipant = {
    nom: 'Menu',
    prenom: 'Marc',
    email: 'marcmenu707@gmail.com'
  };

  try {
    // Générer le contenu de l'email
    console.log('1. Génération du contenu HTML...');
    const htmlContent = await generateDefaultEmailContent(mockEvent, mockParticipant);
    
    console.log('✅ Contenu généré avec succès!');
    console.log('Longueur du HTML:', htmlContent.length, 'caractères');
    
    // Sauvegarder le HTML pour inspection
    const fs = require('fs');
    fs.writeFileSync('test-email-output.html', htmlContent);
    console.log('💾 Email sauvegardé dans: test-email-output.html');

    // Simuler l'envoi
    console.log('\n2. Simulation d\'envoi d\'email...');
    const emailData = {
      senderEmail: 'noreply@conference-tech.com',
      senderName: 'Conférence Tech 2024',
      recipientEmail: mockParticipant.email,
      subject: mockEvent.objet_email_inscription || `Confirmation d'inscription - ${mockEvent.nom}`,
      htmlContent: htmlContent,
      participantName: `${mockParticipant.prenom} ${mockParticipant.nom}`,
      eventName: mockEvent.nom,
      replyToEmail: mockEvent.email_contact
    };

    const result = await sendEmailViaBrevo(emailData);
    
    if (result.success) {
      console.log('✅ Test réussi! L\'email serait envoyé avec succès.');
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.log('❌ Test échoué lors de l\'envoi.');
    }

    console.log('\n📋 Résumé du test:');
    console.log('- Email destinataire:', mockParticipant.email);
    console.log('- Sujet:', emailData.subject);
    console.log('- Couleur header:', mockEvent.couleur_header_email);
    console.log('- Sessions incluses: 2 sessions de test');
    console.log('- Fichier HTML généré: test-email-output.html');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Lancer le test
testEmailGeneration();