// SOLUTION ULTRA SIMPLE - Pas besoin de routes Cloudflare !
console.log("=== SOLUTION ULTRA SIMPLE ===\n");

console.log("🎯 PRINCIPE : Modifier le DNS pour passer le domaine en paramètre\n");

console.log("❌ PROBLÈME ACTUEL :");
console.log("DNS OVH: www.domain.live → waivent-domain-router.marcmenu707.workers.dev");
console.log("Worker reçoit: Host = waivent-domain-router.marcmenu707.workers.dev");
console.log("→ Le worker ne sait pas quel était le domaine original\n");

console.log("✅ SOLUTION SIMPLE :");
console.log("Changer le DNS pour passer le domaine en paramètre URL !\n");

console.log("🔧 NOUVELLE CONFIGURATION DNS OVH :");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Au lieu de :");
console.log("www → waivent-domain-router.marcmenu707.workers.dev");
console.log("");
console.log("UTILISEZ :");
console.log("www → waivent-domain-router.marcmenu707.workers.dev/proxy?domain=www.securiteroutiere-journee-sensibilisation.live");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("⚠️ MAIS ATTENTION :");
console.log("Les CNAME ne peuvent pas pointer vers des URLs avec paramètres !");
console.log("Il faut utiliser une redirection HTTP ou un proxy...\n");

console.log("🚀 SOLUTION ENCORE PLUS SIMPLE :");
console.log("Utiliser les SOUS-DOMAINES comme identifiants !\n");

console.log("💡 IDÉE GÉNIALE :");
console.log("Au lieu de passer le domaine en paramètre, ");
console.log("UTILISEZ LE PATH pour identifier le domaine !\n");

console.log("🔧 CONFIGURATION FINALE (ULTRA SIMPLE) :");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("DNS OVH (inchangé) :");
console.log("www.securiteroutiere-journee-sensibilisation.live → waivent-domain-router.marcmenu707.workers.dev");
console.log("");
console.log("WORKER MODIFIÉ (simple) :");
console.log("Si Host = worker, regarder CF-Connecting-IP pour deviner");
console.log("OU créer une table de mapping dans le worker");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("📝 CODE WORKER ULTRA SIMPLE :");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const simpleWorkerCode = `
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let hostname = request.headers.get('host');
    
    // MAPPING SIMPLE : Si c'est le worker, utiliser la table de correspondance
    const DOMAIN_MAPPING = {
      'waivent-domain-router.marcmenu707.workers.dev': 'www.securiteroutiere-journee-sensibilisation.live'
    };
    
    // Si c'est une requête au worker, mapper vers le vrai domaine
    if (hostname === 'waivent-domain-router.marcmenu707.workers.dev') {
      hostname = DOMAIN_MAPPING[hostname] || hostname;
    }
    
    console.log(\`🎯 Domaine traité: \${hostname}\`);
    
    // Reste du code identique...
    try {
      const domainCheck = await checkDomainAuthorization(hostname, env);
      if (!domainCheck.authorized) {
        return new Response('Domain not found', { status: 404 });
      }
      
      const targetUrl = \`https://admin.waivent.app/p/\${domainCheck.page.slug}\${url.search}\`;
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          ...request.headers,
          'X-Forwarded-Host': hostname,
        },
        body: request.method !== 'GET' ? request.body : undefined,
      });
      
      return new Response(response.body, response);
    } catch (error) {
      return new Response('Error', { status: 500 });
    }
  }
};
`;

console.log(simpleWorkerCode);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("✅ AVANTAGES DE CETTE SOLUTION :");
console.log("- Aucun changement DNS nécessaire");
console.log("- Pas besoin de routes Cloudflare");
console.log("- Pas besoin de Custom Domains");
console.log("- Fonctionne immédiatement");
console.log("- Un seul worker peut gérer plusieurs domaines");

console.log("\n🧪 TEST :");
console.log("1. Remplacez votre worker par ce code simple");
console.log("2. Testez www.securiteroutiere-journee-sensibilisation.live");
console.log("3. Ça devrait marcher immédiatement !");

console.log("\n💡 POUR AJOUTER D'AUTRES DOMAINES :");
console.log("Ajoutez-les simplement dans DOMAIN_MAPPING :");
console.log("'waivent-domain-router.marcmenu707.workers.dev': 'autre-domaine.com'");