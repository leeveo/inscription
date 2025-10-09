// Script de test simple pour envoyer un email
const https = require('https');
const http = require('http');

async function testEmail() {
  const data = JSON.stringify({
    eventId: 1, // ID de l'événement à tester (ajustez si nécessaire)
    participantEmail: 'marcmenu707@gmail.com'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/send-inscription-email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body);
        
        try {
          const jsonResponse = JSON.parse(body);
          if (res.statusCode === 200) {
            console.log('✅ Email envoyé avec succès!');
            resolve(jsonResponse);
          } else {
            console.error('❌ Erreur:', jsonResponse);
            reject(new Error(jsonResponse.error || 'Erreur inconnue'));
          }
        } catch (e) {
          console.error('❌ Erreur de parsing:', e);
          console.error('Body brut:', body);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erreur de requête:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

console.log('Test d\'envoi d\'email à marcmenu707@gmail.com...');
console.log('Assurez-vous que le serveur est démarré avec "npm run dev"');
console.log('---');

testEmail()
  .then(() => {
    console.log('Test terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test échoué:', error.message);
    process.exit(1);
  });