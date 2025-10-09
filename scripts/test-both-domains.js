// Test des deux domaines (avec et sans www)

async function testBothDomains() {
  const domains = [
    'securiteroutiere-journee-sensibilisation.live',
    'www.securiteroutiere-journee-sensibilisation.live'
  ];

  for (const domain of domains) {
    console.log(`\n🧪 Test pour: ${domain}`);
    console.log('='.repeat(50));

    // 1. Test de l'API check-domain
    console.log('1️⃣ Test API check-domain...');
    try {
      const response = await fetch(`https://admin.waivent.app/api/check-domain/${domain}`);
      const result = await response.json();
      
      if (result.authorized) {
        console.log('✅ API check-domain: SUCCÈS');
      } else {
        console.log('❌ API check-domain: ÉCHEC');
        console.log(`   Raison: ${result.reason}`);
      }
    } catch (error) {
      console.log('❌ API check-domain: ERREUR');
      console.log(`   Message: ${error.message}`);
    }

    // 2. Test du reverse proxy Vercel
    console.log('\n2️⃣ Test reverse proxy Vercel...');
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
      }
    } catch (error) {
      console.log('❌ Reverse proxy: ERREUR');
      console.log(`   Message: ${error.message}`);
    }

    // 3. Test direct du domaine
    console.log('\n3️⃣ Test direct du domaine...');
    try {
      const directResponse = await fetch(`https://${domain}`, {
        redirect: 'manual' // Empêcher les redirections automatiques
      });
      
      console.log(`📊 Status: ${directResponse.status}`);
      
      if (directResponse.status === 200) {
        console.log('✅ Domaine direct: SUCCÈS');
      } else if (directResponse.status >= 300 && directResponse.status < 400) {
        const location = directResponse.headers.get('location');
        console.log(`🔄 Domaine direct: REDIRECTION vers ${location}`);
      } else {
        console.log('❌ Domaine direct: ÉCHEC');
      }
    } catch (error) {
      console.log('❌ Domaine direct: ERREUR');
      console.log(`   Message: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 RÉSUMÉ: Pour que les domaines fonctionnent, tous les tests doivent être ✅');
}

testBothDomains();