/**
 * Script pour forcer la vérification DNS et déboguer le domaine
 */

require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function forceDNSVerification() {
  console.log('🔧 === FORCE DNS VERIFICATION ===\n');
  
  const domain = 'www.securiteroutiere-journee-sensibilisation.live';
  
  try {
    // 1. Vérifier l'état actuel
    console.log('1️⃣ État actuel du domaine:');
    const { data: currentStatus, error: statusError } = await supabase
      .from('builder_domains')
      .select('*')
      .eq('host', domain)
      .single();
    
    if (statusError) {
      console.error('❌ Erreur:', statusError.message);
      return;
    }
    
    console.log(`📊 Domaine: ${currentStatus.host}`);
    console.log(`🔧 DNS Status: ${currentStatus.dns_status}`);
    console.log(`🔒 SSL Status: ${currentStatus.ssl_status}`);
    console.log(`🏗️  Site ID: ${currentStatus.site_id}`);
    
    // 2. Forcer la vérification DNS (pour les tests)
    console.log('\n2️⃣ Force de la vérification DNS...');
    
    const { data: updateResult, error: updateError } = await supabase
      .from('builder_domains')
      .update({
        dns_status: 'verified',
        ssl_status: 'active',
        verified_at: new Date().toISOString()
      })
      .eq('host', domain)
      .select();
    
    if (updateError) {
      console.error('❌ Erreur mise à jour:', updateError.message);
    } else {
      console.log('✅ DNS forcé à "verified" pour les tests');
      console.log('✅ SSL forcé à "active" pour les tests');
    }
    
    // 3. Tester l'API maintenant
    console.log('\n3️⃣ Test de l\'API après mise à jour...');
    
    const { data: chainResult, error: chainError } = await supabase
      .rpc('check_domain_complete_chain', { domain_host: domain });
    
    if (chainError) {
      console.error('❌ Erreur fonction chain:', chainError.message);
    } else {
      console.log('📊 Résultat de la chaîne complète:');
      if (chainResult && chainResult.length > 0) {
        const result = chainResult[0];
        console.log(`✅ Autorisé: ${result.authorized}`);
        console.log(`📄 Page slug: ${result.page_slug}`);
        console.log(`🎯 Event ID: ${result.event_id}`);
        console.log(`❓ Raison: ${result.reason}`);
      } else {
        console.log('❌ Aucun résultat');
      }
    }
    
    // 4. Test du Cloudflare Worker (simulation)
    console.log('\n4️⃣ Test simulation Cloudflare Worker...');
    console.log(`🔗 URL de redirection: https://admin.waivent.app/p/${chainResult?.[0]?.page_slug || 'unknown'}`);
    
    console.log('\n✅ === TESTS TERMINÉS ===');
    console.log('\n🚀 PROCHAINES ÉTAPES:');
    console.log('1. Testez votre domaine: https://' + domain);
    console.log('2. Il devrait maintenant rediriger vers votre page');
    console.log('3. Si ça marche, configurez vraiment le DNS');
    console.log('4. Si ça ne marche pas, vérifiez les logs Cloudflare');
    
  } catch (error) {
    console.error('❌ Erreur critique:', error.message);
  }
}

forceDNSVerification();