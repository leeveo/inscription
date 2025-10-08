const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findDomainId() {
  const domain = 'securiteroutiere-journee-sensibilisation.live';
  
  console.log(`🔍 Recherche de l'ID du domaine: ${domain}`);

  try {
    const { data: domainRecord, error } = await supabase
      .from('builder_domains')
      .select('*')
      .eq('host', domain)
      .single();

    if (error || !domainRecord) {
      console.error('❌ Erreur:', error);
      return;
    }

    console.log('✅ Domaine trouvé:');
    console.log(`  - ID: ${domainRecord.id}`);
    console.log(`  - Host: ${domainRecord.host}`);
    console.log(`  - DNS Status: ${domainRecord.dns_status}`);
    console.log(`  - SSL Status: ${domainRecord.ssl_status}`);
    
    console.log(`\n🧪 Vous pouvez tester l'API verify avec:`);
    console.log(`curl -X POST https://admin.waivent.app/api/builder/domains/${domainRecord.id}/verify`);
    
    return domainRecord.id;

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

findDomainId();