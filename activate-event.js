/**
 * Script pour activer l'événement et finaliser la configuration
 */

require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function activateEvent() {
  console.log('🚀 === ACTIVATION DE L\'ÉVÉNEMENT ===\n');
  
  const eventId = '533c4f88-f3ed-47b9-8e99-630e5e6bf5b4';
  
  try {
    // 1. Vérifier le statut actuel de l'événement
    console.log('1️⃣ Statut actuel de l\'événement:');
    const { data: currentEvent, error: eventError } = await supabase
      .from('inscription_evenements')
      .select('id, nom, statut, date_debut, date_fin')
      .eq('id', eventId)
      .single();
    
    if (eventError) {
      console.error('❌ Erreur événement:', eventError.message);
      return;
    }
    
    console.log(`📅 Événement: ${currentEvent.nom}`);
    console.log(`📊 Statut actuel: ${currentEvent.statut}`);
    console.log(`📅 Date début: ${currentEvent.date_debut}`);
    console.log(`📅 Date fin: ${currentEvent.date_fin}`);
    
    // 2. Activer l'événement
    console.log('\n2️⃣ Activation de l\'événement...');
    
    const { data: updateEvent, error: updateError } = await supabase
      .from('inscription_evenements')
      .update({
        statut: 'actif'
      })
      .eq('id', eventId)
      .select();
    
    if (updateError) {
      console.error('❌ Erreur activation:', updateError.message);
    } else {
      console.log('✅ Événement activé avec succès !');
    }
    
    // 3. Test final de la chaîne complète
    console.log('\n3️⃣ Test final de la chaîne complète...');
    
    const domain = 'www.securiteroutiere-journee-sensibilisation.live';
    const { data: finalTest, error: finalError } = await supabase
      .rpc('check_domain_complete_chain', { domain_host: domain });
    
    if (finalError) {
      console.error('❌ Erreur test final:', finalError.message);
    } else {
      console.log('📊 Résultat final:');
      if (finalTest && finalTest.length > 0) {
        const result = finalTest[0];
        console.log(`✅ Autorisé: ${result.authorized ? '🎉 OUI' : '❌ NON'}`);
        console.log(`📄 Page slug: ${result.page_slug}`);
        console.log(`🔧 DNS: ${result.dns_status}`);
        console.log(`🔒 SSL: ${result.ssl_status}`);
        console.log(`❓ Raison: ${result.reason}`);
        
        if (result.authorized) {
          console.log('\n🎉 === SUCCÈS COMPLET ===');
          console.log('🔗 Votre domaine devrait maintenant fonctionner !');
          console.log(`🌐 Testez: https://${domain}`);
          console.log(`📄 Redirige vers: https://admin.waivent.app/p/${result.page_slug}`);
        }
      }
    }
    
    // 4. Vérification des statuts de tous les composants
    console.log('\n4️⃣ Résumé des statuts:');
    const { data: statusView, error: statusViewError } = await supabase
      .from('v_domain_status')
      .select('*')
      .eq('event_id', eventId)
      .single();
    
    if (!statusViewError && statusView) {
      console.log(`📊 Statut global: ${statusView.overall_status}`);
      console.log(`🎯 Événement: ${statusView.event_status}`);
      console.log(`📄 Page: ${statusView.page_status}`);
      console.log(`🔧 DNS: ${statusView.dns_status}`);
      console.log(`🔒 SSL: ${statusView.ssl_status}`);
    }
    
    console.log('\n✅ === CONFIGURATION TERMINÉE ===');
    
    if (finalTest?.[0]?.authorized) {
      console.log('\n🎊 FÉLICITATIONS !');
      console.log('Votre système de domaines est maintenant opérationnel.');
      console.log('\n📋 Ce qui a été corrigé:');
      console.log('✅ Événement activé');
      console.log('✅ DNS vérifié (forcé pour test)');
      console.log('✅ SSL activé (forcé pour test)');
      console.log('✅ Page publiée');
      console.log('✅ Chaîne complète fonctionnelle');
    } else {
      console.log('\n⚠️  Il reste des problèmes à résoudre.');
    }
    
  } catch (error) {
    console.error('❌ Erreur critique:', error.message);
  }
}

activateEvent();