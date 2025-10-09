// Test de l'API d'envoi d'email avec des données mockées
// Ce script teste l'API sans dépendre de la base de données

const testEmailAPI = async () => {
  console.log('📧 Test de l\'API d\'envoi d\'email...\n');

  // URL de l'API locale (assure-toi que le serveur est démarré avec npm run dev)
  const apiUrl = 'http://localhost:3000/api/send-inscription-email';

  // Données de test
  const testData = {
    eventId: 1, // ID d'un événement existant
    participantEmail: 'marcmenu707@gmail.com'
  };

  try {
    console.log('🚀 Envoi de la requête à:', apiUrl);
    console.log('📦 Données:', JSON.stringify(testData, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Status de la réponse:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('📄 Réponse brute:', responseText);

    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        console.log('✅ Succès! Email envoyé.');
        console.log('📋 Détails:', result);
      } catch (e) {
        console.log('✅ Succès! (réponse non-JSON)');
      }
    } else {
      console.error('❌ Erreur HTTP:', response.status);
      try {
        const errorResult = JSON.parse(responseText);
        console.error('📋 Détails de l\'erreur:', errorResult);
      } catch (e) {
        console.error('📋 Message d\'erreur:', responseText);
      }
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connexion refusée. Vérifiez que le serveur est démarré avec "npm run dev"');
    } else {
      console.error('❌ Erreur de requête:', error.message);
    }
  }
};

console.log('='.repeat(50));
console.log('TEST D\'ENVOI D\'EMAIL À marcmenu707@gmail.com');
console.log('='.repeat(50));
console.log('');
console.log('⚠️  IMPORTANT: Assurez-vous que le serveur est démarré:');
console.log('   npm run dev');
console.log('');

testEmailAPI();