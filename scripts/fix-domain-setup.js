const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDomainSetup() {
  const domain = 'securiteroutiere-journee-sensibilisation.live';
  const siteId = 'c651f5a0-3012-46a0-9b91-3c7c9c174721';

  console.log(`🔧 Configuration du domaine: ${domain}`);
  console.log(`📍 Site ID: ${siteId}`);

  try {
    // Étape 1: Vérifier si le domaine existe déjà
    const { data: existingDomain } = await supabase
      .from('builder_domains')
      .select('*')
      .eq('host', domain)
      .single();

    if (existingDomain) {
      console.log('⚠️ Le domaine existe déjà:', existingDomain);
      return;
    }

    // Étape 2: Créer le domaine (sans la colonne is_active qui n'existe pas)
    console.log('➕ Création du domaine...');
    const { data: newDomain, error: createError } = await supabase
      .from('builder_domains')
      .insert({
        site_id: siteId,
        type: 'custom',
        host: domain,
        dns_status: 'verified',
        ssl_status: 'active',
        is_primary: true,
        created_at: new Date().toISOString(),
        verified_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création domaine:', createError);
      return;
    }

    console.log('✅ Domaine créé avec succès:');
    console.log(`  - ID: ${newDomain.id}`);
    console.log(`  - Host: ${newDomain.host}`);
    console.log(`  - Site ID: ${newDomain.site_id}`);
    console.log(`  - DNS Status: ${newDomain.dns_status}`);
    console.log(`  - SSL Status: ${newDomain.ssl_status}`);

    // Étape 3: Vérifier la page publiée
    console.log('\n📄 Vérification de la page publiée...');
    const { data: page } = await supabase
      .from('builder_pages')
      .select('*')
      .eq('site_id', siteId)
      .eq('status', 'published')
      .single();

    if (page) {
      console.log('✅ Page publiée trouvée:');
      console.log(`  - Nom: ${page.name}`);
      console.log(`  - Slug: ${page.slug}`);
      console.log(`  - Status: ${page.status}`);
    } else {
      console.log('❌ Aucune page publiée trouvée pour ce site');
    }

    // Étape 4: Tester l'API de vérification du domaine
    console.log('\n🧪 Test de l\'API check-domain...');
    try {
      const response = await fetch(`https://admin.waivent.app/api/check-domain/${domain}`);
      const result = await response.json();
      
      console.log(`🔍 Status: ${response.status}`);
      console.log('📋 Réponse:', JSON.stringify(result, null, 2));
    } catch (apiError) {
      console.error('❌ Erreur API:', apiError.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

fixDomainSetup();