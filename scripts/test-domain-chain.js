// Test complet de la chaîne de domaine personnalisé

async function testDomainChain() {
  const domain = 'securiteroutiere-journee-sensibilisation.live';
  
  console.log(`🧪 Test complet pour: ${domain}\n`);

  // 1. Test de l'API check-domain
  console.log('1️⃣ Test API check-domain...');
  try {
    const response = await fetch(`https://admin.waivent.app/api/check-domain/${domain}`);
    const result = await response.json();
    
    if (result.authorized) {
      console.log('✅ API check-domain: SUCCÈS');
      console.log(`   Page trouvée: ${result.page.name} (slug: ${result.page.slug})`);
    } else {
      console.log('❌ API check-domain: ÉCHEC');
      console.log(`   Raison: ${result.reason}`);
    }
  } catch (error) {
    console.log('❌ API check-domain: ERREUR');
    console.log(`   Message: ${error.message}`);
  }

  console.log('');

  // 2. Test du reverse proxy Vercel
  console.log('2️⃣ Test reverse proxy Vercel...');
  try {
    const proxyResponse = await fetch(`https://reverse-proxy-git-master-leeveos-projects.vercel.app`, {
      headers: {
        'Host': domain,
        'X-Forwarded-Host': domain
      }
    });
    
    if (proxyResponse.ok) {
      console.log('✅ Reverse proxy: SUCCÈS');
      console.log(`   Status: ${proxyResponse.status}`);
    } else {
      console.log('❌ Reverse proxy: ÉCHEC');
      console.log(`   Status: ${proxyResponse.status}`);
      const errorText = await proxyResponse.text();
      console.log(`   Response: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log('❌ Reverse proxy: ERREUR');
    console.log(`   Message: ${error.message}`);
  }

  console.log('');

  // 3. Test direct de la page sur l'app principale
  console.log('3️⃣ Test page directe...');
  try {
    const pageResponse = await fetch(`https://admin.waivent.app/p/home`, {
      headers: {
        'X-Forwarded-Host': domain,
        'X-Original-Host': domain
      }
    });
    
    if (pageResponse.ok) {
      console.log('✅ Page directe: SUCCÈS');
      console.log(`   Status: ${pageResponse.status}`);
    } else {
      console.log('❌ Page directe: ÉCHEC');
      console.log(`   Status: ${pageResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Page directe: ERREUR');
    console.log(`   Message: ${error.message}`);
  }

  console.log('\n📋 Résumé:');
  console.log('Pour que le domaine fonctionne, il faut que les 3 tests soient ✅');
}

testDomainChain();