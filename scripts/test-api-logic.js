const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testApiLogic() {
  const domain = 'securiteroutiere-journee-sensibilisation.live';
  
  console.log(`🧪 Test de la logique API pour: ${domain}`);

  try {
    // Nettoyer le domaine (enlever www. si présent)
    const cleanDomain = domain.replace(/^www\./, '');
    console.log(`🧹 Domaine nettoyé: ${cleanDomain}`);

    // Étape 1: Vérifier si le domaine existe dans builder_domains
    console.log('\n📋 Étape 1: Vérification builder_domains...');
    const { data: domainRecord, error: domainError } = await supabase
      .from('builder_domains')
      .select('*')
      .eq('host', cleanDomain)
      .single();

    if (domainError) {
      console.error('❌ Erreur domaine:', domainError);
      return;
    }

    if (!domainRecord) {
      console.log('❌ Domaine non trouvé');
      return;
    }

    console.log('✅ Domaine trouvé:');
    console.log(`  - ID: ${domainRecord.id}`);
    console.log(`  - Site ID: ${domainRecord.site_id}`);
    console.log(`  - DNS Status: ${domainRecord.dns_status}`);
    console.log(`  - SSL Status: ${domainRecord.ssl_status}`);

    // Étape 2: Vérifier le statut DNS
    if (domainRecord.dns_status !== 'verified') {
      console.log(`⚠️ DNS non vérifié: ${domainRecord.dns_status}`);
      return;
    }

    console.log('✅ DNS vérifié');

    // Étape 3: Vérifier si la page associée est publiée
    console.log('\n📄 Étape 3: Vérification builder_pages...');
    const { data: page, error: pageError } = await supabase
      .from('builder_pages')
      .select('*')
      .eq('site_id', domainRecord.site_id)
      .eq('status', 'published')
      .single();

    if (pageError) {
      console.error('❌ Erreur page:', pageError);
      
      // Vérifions toutes les pages de ce site
      const { data: allPages } = await supabase
        .from('builder_pages')
        .select('*')
        .eq('site_id', domainRecord.site_id);
      
      console.log('\n📋 Toutes les pages de ce site:');
      allPages?.forEach(p => {
        console.log(`  - ${p.name} (${p.slug}) - Status: ${p.status}`);
      });
      return;
    }

    if (!page) {
      console.log('❌ Aucune page publiée trouvée');
      return;
    }

    console.log('✅ Page publiée trouvée:');
    console.log(`  - ID: ${page.id}`);
    console.log(`  - Nom: ${page.name}`);
    console.log(`  - Slug: ${page.slug}`);
    console.log(`  - Status: ${page.status}`);

    console.log('\n🎉 Le domaine devrait être autorisé !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testApiLogic();