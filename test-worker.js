/**
 * Test du Cloudflare Worker
 */

async function testCloudflareWorker() {
  console.log('🔍 === TEST DU CLOUDFLARE WORKER ===\n');
  
  const workerUrl = 'https://waivent-domain-router.marcmenu707.workers.dev';
  const testDomain = 'www.securiteroutiere-journee-sensibilisation.live';
  
  try {
    console.log('1️⃣ Test direct du worker...');
    console.log(`🌐 URL: ${workerUrl}`);
    
    // Test 1: Worker sans header Host (devrait retourner une erreur ou redirection)
    try {
      const response1 = await fetch(workerUrl);
      console.log(`📊 Status direct: ${response1.status}`);
      console.log(`📝 Response direct: ${response1.statusText}`);
    } catch (err) {
      console.log(`❌ Worker direct non accessible: ${err.message}`);
    }
    
    // Test 2: Worker avec header Host (simulation du domaine)
    console.log('\n2️⃣ Test avec header Host simulé...');
    try {
      const response2 = await fetch(workerUrl, {
        headers: {
          'Host': testDomain,
          'User-Agent': 'Test-Script/1.0'
        }
      });
      
      console.log(`📊 Status avec Host: ${response2.status}`);
      console.log(`📝 Response avec Host: ${response2.statusText}`);
      
      if (response2.ok) {
        const text = await response2.text();
        console.log(`📄 Contenu (premiers 200 chars): ${text.substring(0, 200)}...`);
      }
    } catch (err) {
      console.log(`❌ Erreur avec Host: ${err.message}`);
    }
    
    // Test 3: Vérifier si le worker répond aux requêtes
    console.log('\n3️⃣ Test de connectivité basique...');
    try {
      const response3 = await fetch(workerUrl + '/test', {
        method: 'GET',
        headers: {
          'User-Agent': 'Test-Script/1.0'
        }
      });
      console.log(`📊 Status /test: ${response3.status}`);
    } catch (err) {
      console.log(`❌ Connectivité: ${err.message}`);
    }
    
    console.log('\n💡 INTERPRÉTATION:');
    console.log('• Si toutes les requêtes échouent → Worker pas déployé ou URL incorrecte');
    console.log('• Si erreur 404 → Worker déployé mais route non trouvée'); 
    console.log('• Si erreur 500 → Worker déployé mais erreur dans le code');
    console.log('• Si redirection → Worker fonctionne !');
    
  } catch (error) {
    console.error('❌ Erreur critique:', error.message);
  }
}

testCloudflareWorker();