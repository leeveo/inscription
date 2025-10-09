/**
 * Script de diagnostic simplifié pour le système de domaines
 * Usage: node diagnostic-simple.js
 */

// Charger les variables d'environnement
require('dotenv').config({ path: './.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase depuis les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickDiagnostic() {
  console.log('🔍 === DIAGNOSTIC RAPIDE DU SYSTÈME ===\n');
  
  const targetEventId = '533c4f88-f3ed-47b9-8e99-630e5e6bf5b4';
  
  try {
    // 1. Test de la nouvelle vue de statut
    console.log('1️⃣ TEST DE LA VUE DE STATUT:');
    const { data: statusData, error: statusError } = await supabase
      .from('v_domain_status')
      .select('*')
      .eq('event_id', targetEventId);
    
    if (statusError) {
      console.error('❌ Erreur vue statut:', statusError.message);
      
      // Fallback: diagnostic manuel
      console.log('\n🔄 DIAGNOSTIC MANUEL:');
      
      // Vérifier l'événement
      const { data: event, error: eventError } = await supabase
        .from('inscription_evenements')
        .select('id, nom, statut, builder_page_id')
        .eq('id', targetEventId)
        .single();
      
      if (eventError) {
        console.error('❌ Événement non trouvé:', eventError.message);
        return;
      }
      
      console.log(`✅ Événement: ${event.nom} (Status: ${event.statut})`);
      
      // Vérifier le site
      const { data: sites, error: sitesError } = await supabase
        .from('builder_sites')
        .select('*')
        .eq('event_id', targetEventId);
      
      if (sitesError) {
        console.error('❌ Erreur sites:', sitesError.message);
      } else {
        console.log(`🏗️  Sites liés: ${sites.length}`);
        if (sites.length === 0) {
          console.log('⚠️  PROBLÈME: Aucun site builder lié à cet événement');
        }
      }
      
    } else if (statusData && statusData.length > 0) {
      const status = statusData[0];
      console.log('✅ Vue de statut accessible !');
      console.log(`🎯 Événement: ${status.event_name}`);
      console.log(`📊 Statut global: ${status.overall_status}`);
      console.log(`🌐 Domaine: ${status.domain_host || 'AUCUN'}`);
      console.log(`📄 Page: ${status.page_name || 'AUCUNE'} (${status.page_status || 'N/A'})`);
      console.log(`🔧 DNS: ${status.dns_status || 'N/A'}`);
      console.log(`🔒 SSL: ${status.ssl_status || 'N/A'}`);
      
      // Recommandations basées sur le statut
      console.log('\n💡 RECOMMANDATIONS:');
      switch (status.overall_status) {
        case 'OPERATIONAL':
          console.log('✅ Système opérationnel !');
          break;
        case 'DNS_ISSUE':
          console.log('🔧 Problème DNS - Configurez les enregistrements DNS');
          break;
        case 'PAGE_NOT_PUBLISHED':
          console.log('📝 Page non publiée - Publiez votre page');
          break;
        case 'EVENT_INACTIVE':
          console.log('⚠️  Événement inactif - Activez votre événement');
          break;
        default:
          console.log('❓ Statut inconnu - Configuration manquante');
      }
    } else {
      console.log('⚠️  Aucun statut trouvé pour cet événement');
      console.log('🚀 Vous devez créer la configuration complète');
    }

    // 2. Test de la fonction de création de chaîne
    console.log('\n2️⃣ TEST FONCTION DE CRÉATION:');
    console.log('📋 Fonction create_complete_domain_chain disponible');
    console.log('💡 Utilisez-la pour créer automatiquement la configuration');

    // 3. Vérifier la structure des tables
    console.log('\n3️⃣ VÉRIFICATION DES TABLES:');
    
    const tables = ['inscription_evenements', 'builder_sites', 'builder_pages', 'builder_domains'];
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${count} enregistrements`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Non accessible`);
      }
    }

    console.log('\n✅ === DIAGNOSTIC TERMINÉ ===');
    console.log('\n🚀 PROCHAINES ÉTAPES:');
    console.log('1. Si aucun domaine configuré: Utilisez l\'interface pour créer un domaine');
    console.log('2. Si page non publiée: Allez dans le Page Builder et publiez');
    console.log('3. Si DNS non vérifié: Configurez les enregistrements DNS');
    console.log('4. Testez votre domaine personnalisé');

  } catch (error) {
    console.error('❌ Erreur critique:', error.message);
  }
}

// Exécuter le diagnostic
quickDiagnostic();