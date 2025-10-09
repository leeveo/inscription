/**
 * Test de l'API de vérification des domaines
 */

require('dotenv').config({ path: './.env.local' });

async function testDomainAPI() {
  console.log('🔍 === TEST DE L\'API DE DOMAINES ===\n');
  
  const domain = 'www.securiteroutiere-journee-sensibilisation.live';
  const baseUrl = 'http://localhost:3000'; // Ou votre URL de dev
  
  try {
    // Test de l'API actuelle
    console.log(`🌐 Test du domaine: ${domain}`);
    
    const response = await fetch(`${baseUrl}/api/check-domain/${domain}`);
    const result = await response.json();
    
    console.log('📊 Résultat de l\'API:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.authorized) {
      console.log('✅ Domaine autorisé !');
      console.log(`🔗 Redirection vers: /p/${result.page.slug}`);
    } else {
      console.log('❌ Domaine NON autorisé');
      console.log(`❓ Raison: ${result.reason}`);
      
      // Suggestions basées sur la raison
      if (result.reason === 'Domain DNS not verified') {
        console.log('\n💡 SOLUTION:');
        console.log('1. Configurez les enregistrements DNS chez votre registraire');
        console.log('2. Pointez votre domaine vers admin.waivent.app');
        console.log('3. Attendez la propagation (jusqu\'à 24h)');
        console.log('4. Forcez la vérification DNS');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Si l'argument --local est passé, utiliser localhost, sinon production
const useLocal = process.argv.includes('--local');
if (useLocal) {
  console.log('🏠 Test en local sur localhost:3000');
} else {
  console.log('🌐 Test sur l\'API de production');
  // Remplacer par votre URL de production si nécessaire
}

testDomainAPI();