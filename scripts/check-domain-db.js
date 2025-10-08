const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDomain() {
  const domain = 'securiteroutiere-journee-sensibilisation.live';
  const wwwDomain = 'www.securiteroutiere-journee-sensibilisation.live';

  console.log(`🔍 Vérification du domaine: ${domain}`);

  try {
    // Vérifier builder_domains
    console.log('\n📋 Table builder_domains:');
    const { data: domainRecords, error: domainError } = await supabase
      .from('builder_domains')
      .select('*')
      .or(`host.eq.${domain},host.eq.${wwwDomain}`);

    if (domainError) {
      console.error('❌ Erreur builder_domains:', domainError);
    } else {
      console.log(`✅ Trouvé ${domainRecords.length} enregistrement(s) dans builder_domains:`);
      domainRecords.forEach(record => {
        console.log(`  - ID: ${record.id}`);
        console.log(`    Site ID: ${record.site_id}`);
        console.log(`    Host: ${record.host}`);
        console.log(`    DNS Status: ${record.dns_status}`);
        console.log(`    SSL Status: ${record.ssl_status}`);
        console.log(`    Active: ${record.is_active}`);
        console.log('');
      });
    }

    // Vérifier builder_sites
    console.log('\n🏗️ Table builder_sites:');
    const { data: siteRecords, error: siteError } = await supabase
      .from('builder_sites')
      .select('*');

    if (siteError) {
      console.error('❌ Erreur builder_sites:', siteError);
    } else {
      console.log(`✅ Trouvé ${siteRecords.length} site(s):`);
      siteRecords.forEach(site => {
        console.log(`  - ID: ${site.id}`);
        console.log(`    Nom: ${site.name}`);
        console.log(`    Event ID: ${site.event_id}`);
        console.log(`    Status: ${site.status}`);
        console.log('');
      });
    }

    // Vérifier builder_pages
    console.log('\n📄 Table builder_pages:');
    const { data: pageRecords, error: pageError } = await supabase
      .from('builder_pages')
      .select('*')
      .eq('status', 'published');

    if (pageError) {
      console.error('❌ Erreur builder_pages:', pageError);
    } else {
      console.log(`✅ Trouvé ${pageRecords.length} page(s) publiée(s):`);
      pageRecords.forEach(page => {
        console.log(`  - ID: ${page.id}`);
        console.log(`    Site ID: ${page.site_id}`);
        console.log(`    Nom: ${page.name}`);
        console.log(`    Slug: ${page.slug}`);
        console.log(`    Status: ${page.status}`);
        console.log('');
      });
    }

    // Si le domaine n'existe pas, proposer de l'ajouter
    if (domainRecords.length === 0) {
      console.log('\n⚠️ Le domaine n\'existe pas dans builder_domains');

      if (siteRecords.length > 0) {
        const firstSite = siteRecords[0];
        console.log(`\n💡 Proposition: Ajouter le domaine au site "${firstSite.name}" (${firstSite.id})`);

        // Créer le domaine
        const { data: newDomain, error: createError } = await supabase
          .from('builder_domains')
          .insert({
            id: require('crypto').randomUUID(),
            site_id: firstSite.id,
            type: 'custom',
            host: domain,
            dns_status: 'verified', // Forcer verified pour test
            ssl_status: 'active',
            is_primary: true,
            is_active: true,
            created_at: new Date().toISOString(),
            verified_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Erreur création domaine:', createError);
        } else {
          console.log('✅ Domaine créé avec succès:');
          console.log(`  - ID: ${newDomain.id}`);
          console.log(`  - Host: ${newDomain.host}`);
          console.log(`  - Site ID: ${newDomain.site_id}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

checkDomain();