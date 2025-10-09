/**
 * Script pour vérifier et corriger le statut de l'événement
 */

require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEventStatus() {
  console.log('🔧 === CORRECTION DU STATUT ===\n');
  
  const eventId = '533c4f88-f3ed-47b9-8e99-630e5e6bf5b4';
  
  try {
    // 1. Vérifier les contraintes sur le champ statut
    console.log('1️⃣ Test des valeurs autorisées pour le statut...');
    
    const possibleStatuses = ['actif', 'publié', 'active', 'published', 'en_cours', 'ouvert'];
    
    for (const status of possibleStatuses) {
      try {
        console.log(`🧪 Test du statut: "${status}"`);
        
        const { data, error } = await supabase
          .from('inscription_evenements')
          .update({ statut: status })
          .eq('id', eventId)
          .select();
        
        if (!error) {
          console.log(`✅ Statut "${status}" accepté !`);
          
          // Test immédiat de l'autorisation
          const domain = 'www.securiteroutiere-journee-sensibilisation.live';
          const { data: testResult, error: testError } = await supabase
            .rpc('check_domain_complete_chain', { domain_host: domain });
          
          if (!testError && testResult?.[0]?.authorized) {
            console.log('🎉 AUTORISATION RÉUSSIE !');
            console.log(`📊 Résultat: ${JSON.stringify(testResult[0], null, 2)}`);
            
            // Test final de la vue
            const { data: finalStatus } = await supabase
              .from('v_domain_status')
              .select('*')
              .eq('event_id', eventId)
              .single();
            
            console.log(`\n📈 Statut global final: ${finalStatus?.overall_status}`);
            
            if (finalStatus?.overall_status === 'OPERATIONAL') {
              console.log('\n🎊 === SUCCÈS COMPLET ===');
              console.log('🌐 Votre domaine est maintenant opérationnel !');
              console.log(`🔗 Testez: https://${domain}`);
              console.log(`📄 Redirige vers: https://admin.waivent.app/p/${testResult[0].page_slug}`);
              
              return; // Arrêter le test, on a trouvé la solution
            }
          } else {
            console.log(`⚠️  Statut accepté mais autorisation échoue: ${testResult?.[0]?.reason}`);
          }
        } else {
          console.log(`❌ Statut "${status}" rejeté: ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ Erreur avec "${status}": ${err.message}`);
      }
    }
    
    // 2. Si aucun statut ne marche, vérifier la contrainte
    console.log('\n2️⃣ Vérification des contraintes de la base...');
    
    // Obtenir les informations sur les contraintes
    const { data: events, error: eventsError } = await supabase
      .from('inscription_evenements')
      .select('statut')
      .limit(10);
    
    if (!eventsError) {
      const existingStatuses = [...new Set(events.map(e => e.statut))];
      console.log('📊 Statuts existants dans la base:', existingStatuses);
    }
    
  } catch (error) {
    console.error('❌ Erreur critique:', error.message);
  }
}

fixEventStatus();