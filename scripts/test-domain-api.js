// Script pour tester l'API de vérification de domaine
require('dotenv').config({ path: '.env.local' });

async function testDomainAPI() {
  const domain = 'www.securiteroutiere-journee-sensibilisation.live';

  console.log(`🔍 Test de l'API pour le domaine: ${domain}`);

  try {
    const response = await fetch(`http://localhost:3000/api/check-domain/${domain}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.authorized) {
      console.log('✅ Domaine autorisé!');
      console.log(`Page: ${result.page.name} (slug: ${result.page.slug})`);
      console.log(`URL directe: https://admin.waivent.app/p/${result.page.slug}`);
    } else {
      console.log('❌ Domaine non autorisé');
      console.log(`Raison: ${result.reason}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('💡 Assurez-vous que le serveur de développement est démarré (npm run dev)');
  }
}

testDomainAPI();