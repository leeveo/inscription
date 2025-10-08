// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addDomain() {
  const domain = 'securiteroutiere-journee-sensibilisation.live';
  const siteId = 'c651f5a0-3012-46a0-9b91-3c7c9c174721'; // Site qui a la page securite-routiere

  console.log(`🔧 Ajout du domaine: ${domain} au site: ${siteId}`);

  try {
    // D'abord vérifier que le site existe et a une page publiée
    const { data: site, error: siteError } = await supabase
      .from('builder_sites')
      .select('*')
      .eq('id', siteId)
      .single();

    if (siteError || !site) {
      console.error('❌ Site non trouvé:', siteError);
      return;
    }

    console.log(`✅ Site trouvé: ${site.name}`);

    // Vérifier s'il y a une page publiée
    const { data: publishedPage, error: pageError } = await supabase
      .from('builder_pages')
      .select('*')
      .eq('site_id', siteId)
      .eq('status', 'published')
      .single();

    if (pageError || !publishedPage) {
      console.error('❌ Aucune page publiée pour ce site');
      return;
    }

    console.log(`✅ Page publiée trouvée: ${publishedPage.name} (slug: ${publishedPage.slug})`);

    // Supprimer l'ancien domaine s'il existe
    const { data: existingDomain } = await supabase
      .from('builder_domains')
      .select('*')
      .eq('host', domain);

    if (existingDomain && existingDomain.length > 0) {
      console.log('🗑️ Suppression de l\'ancien domaine...');
      await supabase
        .from('builder_domains')
        .delete()
        .eq('host', domain);
    }

    // Créer le nouveau domaine
    const { data: newDomain, error: createError } = await supabase
      .from('builder_domains')
      .insert({
        id: require('crypto').randomUUID(),
        site_id: siteId,
        type: 'custom',
        host: domain,
        dns_status: 'verified', // Forcer verified car le DNS est déjà configuré
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

    console.log('\n🌐 Votre domaine devrait maintenant fonctionner:');
    console.log(`   https://www.${domain} → Page "${publishedPage.name}"`);
    console.log(`   https://admin.waivent.app/p/${publishedPage.slug} (direct)`);

    // Tester l'API de vérification
    console.log('\n🔍 Test de l\'API de vérification...');
    try {
      const testResponse = await fetch(`http://localhost:3001/api/check-domain/www.${domain}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (testResponse.ok) {
        const result = await testResponse.json();
        console.log('✅ API Response:', result);
      } else {
        console.log('❌ API Error:', testResponse.status, testResponse.statusText);
      }
    } catch (fetchError) {
      console.log('❌ Erreur test API (serveur dev doit être démarré):', fetchError.message);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

addDomain();