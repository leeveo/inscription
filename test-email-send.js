/**
 * Test d'envoi d'email pour le participant marcmenu707@gmail.com
 * Événement: fb350c24-7de6-475b-902d-d24ccfb34287
 */

const EVENT_ID = 'fb350c24-7de6-475b-902d-d24ccfb34287';
const PARTICIPANT_EMAIL = 'marcmenu707@gmail.com';
const API_BASE_URL = 'http://localhost:3000';

async function testEmailSend() {
  console.log('🧪 Test d\'envoi d\'email de confirmation d\'inscription');
  console.log('='.repeat(60));
  console.log(`📅 Événement ID: ${EVENT_ID}`);
  console.log(`📧 Participant: ${PARTICIPANT_EMAIL}`);
  console.log('');

  try {
    // Données du participant de test
    const participantData = {
      nom: 'Menu',
      prenom: 'Marc', 
      email: PARTICIPANT_EMAIL,
      telephone: '06 12 34 56 78',
      profession: 'Testeur'
    };

    // Payload pour l'API
    const emailPayload = {
      eventId: EVENT_ID,
      participantData: participantData
    };

    console.log('📤 Envoi de la requête vers l\'API...');
    console.log('URL:', `${API_BASE_URL}/api/send-inscription-email`);
    console.log('Payload:', JSON.stringify(emailPayload, null, 2));
    console.log('');

    // Appel à l'API d'envoi d'email
    const response = await fetch(`${API_BASE_URL}/api/send-inscription-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    });

    const responseData = await response.json();

    console.log('📨 Réponse de l\'API:');
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Body:', JSON.stringify(responseData, null, 2));
    console.log('');

    if (response.ok && responseData.success) {
      console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS !');
      console.log(`📧 Message ID: ${responseData.messageId || 'N/A'}`);
      console.log(`📝 Message: ${responseData.message}`);
      
      console.log('');
      console.log('🎯 Vérifications à faire :');
      console.log(`1. 📧 Vérifier la boîte email de ${PARTICIPANT_EMAIL}`);
      console.log('2. 🎨 Vérifier que le template sélectionné est appliqué');
      console.log('3. 🎨 Vérifier la couleur du header personnalisée');
      console.log('4. 📝 Vérifier l\'objet personnalisé de l\'email');
      console.log('5. 📅 Vérifier les informations de l\'événement');
      console.log('6. 🎯 Vérifier les sessions si présentes');
      
    } else {
      console.log('❌ ÉCHEC DE L\'ENVOI D\'EMAIL');
      console.log(`🚨 Erreur: ${responseData.error || 'Erreur inconnue'}`);
      
      // Suggestions de débogage
      console.log('');
      console.log('🔧 Vérifications à faire :');
      console.log('1. 📅 L\'événement existe-t-il dans la base de données ?');
      console.log('2. 📧 La configuration Brevo est-elle correcte ?');
      console.log('3. ✅ L\'email d\'envoi est-il configuré et autorisé ?');
      console.log('4. 🎨 Les templates d\'email sont-ils disponibles ?');
      console.log('5. 🔐 Les variables d\'environnement sont-elles définies ?');
    }

  } catch (error) {
    console.log('💥 ERREUR LORS DU TEST');
    console.error('Erreur:', error);
    
    console.log('');
    console.log('🔧 Vérifications techniques :');
    console.log('1. 🚀 Le serveur Next.js est-il démarré sur localhost:3000 ?');
    console.log('2. 🛣️ L\'API route est-elle accessible ?');
    console.log('3. 🌐 La connexion réseau fonctionne-t-elle ?');
    console.log('4. 🔥 Y a-t-il des erreurs dans les logs du serveur ?');
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('🏁 Fin du test d\'envoi d\'email');
  console.log('');
  console.log('📌 Pour lancer ce test :');
  console.log('   node test-email-send.js');
}

// Lancer le test automatiquement
testEmailSend().catch(console.error);