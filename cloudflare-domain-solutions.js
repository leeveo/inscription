// Solutions pour le problème Custom Domain Cloudflare
console.log("=== PROBLÈME CUSTOM DOMAIN CLOUDFLARE ===\n");

console.log("❌ ERREUR IDENTIFIÉE :");
console.log("'Only domains active on your Cloudflare account can be added'");
console.log("→ Votre domaine securiteroutiere-journee-sensibilisation.live est chez OVH, pas Cloudflare\n");

console.log("🔧 SOLUTION 1: TRANSFERT DNS VERS CLOUDFLARE (RECOMMANDÉ)\n");

console.log("📋 ÉTAPES POUR LE TRANSFERT DNS :");
console.log("1️⃣ Dans Cloudflare Dashboard :");
console.log("   - Cliquez sur '+ Add a Site'");
console.log("   - Entrez: securiteroutiere-journee-sensibilisation.live");
console.log("   - Choisissez le plan FREE");
console.log("   - Cloudflare va scanner vos enregistrements DNS actuels");

console.log("\n2️⃣ Chez votre registrar (OVH) :");
console.log("   - Allez dans la gestion DNS du domaine");
console.log("   - Remplacez les serveurs DNS par ceux de Cloudflare :");
console.log("     * Cloudflare vous donnera 2 serveurs DNS (ex: amber.ns.cloudflare.com)");
console.log("     * Remplacez les serveurs OVH par ces serveurs Cloudflare");

console.log("\n3️⃣ Attendre la propagation (24-48h max)");

console.log("\n4️⃣ Configurer le Custom Domain dans le Worker");

console.log("\n✅ AVANTAGES DU TRANSFERT DNS :");
console.log("   - Custom Domains functionnent");
console.log("   - SSL automatique");
console.log("   - Protection DDoS gratuite");
console.log("   - Analytics détaillées");
console.log("   - Cache et optimisation automatiques\n");

console.log("🔧 SOLUTION 2: GARDER OVH + MODIFIER LE WORKER (PLUS SIMPLE)\n");

console.log("Si vous ne voulez pas transférer le DNS, modifiez le worker :");

console.log("📝 CODE WORKER MODIFIÉ :");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // SOLUTION: Extraire le domaine depuis l'en-tête CF-Connecting-IP ou URL
    let hostname = request.headers.get('host') || url.hostname;
    
    // Si c'est le worker, chercher le vrai domaine
    if (hostname === 'waivent-domain-router.marcmenu707.workers.dev') {
      // Option 1: Depuis le referer
      const referer = request.headers.get('referer');
      if (referer) {
        try {
          hostname = new URL(referer).hostname;
        } catch (e) {}
      }
      
      // Option 2: Depuis les en-têtes CF
      const cfRay = request.headers.get('cf-ray');
      const xForwardedHost = request.headers.get('x-forwarded-host');
      const xOriginalHost = request.headers.get('x-original-host');
      
      if (xForwardedHost) hostname = xForwardedHost;
      else if (xOriginalHost) hostname = xOriginalHost;
      
      // Option 3: Depuis les paramètres URL
      if (url.searchParams.get('domain')) {
        hostname = url.searchParams.get('domain');
      }
      
      // Fallback: deviner depuis CF-Connecting-IP (pas fiable)
      if (hostname === 'waivent-domain-router.marcmenu707.workers.dev') {
        // Retourner une page de debug
        return new Response(\`
          <h1>Debug Worker</h1>
          <p>Host: \${request.headers.get('host')}</p>
          <p>Referer: \${request.headers.get('referer')}</p>
          <p>X-Forwarded-Host: \${request.headers.get('x-forwarded-host')}</p>
          <p>CF-Ray: \${request.headers.get('cf-ray')}</p>
          <p>CF-Connecting-IP: \${request.headers.get('cf-connecting-ip')}</p>
          <p>All headers: \${JSON.stringify([...request.headers])}</p>
        \`, {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    }
    
    console.log(\`🎯 Domaine détecté: \${hostname}\`);
    
    // Reste du code identique...
  }
};
`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log("\n🚀 SOLUTION 3: ROUTE ALTERNATIVE (IMMEDIATE)\n");

console.log("Utilisez les Routes au lieu de Custom Domains :");
console.log("1. Worker Dashboard → Settings → Triggers → Routes");
console.log("2. Ajoutez ces patterns :");
console.log("   - *.securiteroutiere-journee-sensibilisation.live/*");
console.log("   - securiteroutiere-journee-sensibilisation.live/*");
console.log("3. Mais cela nécessite que le domaine soit sur Cloudflare...\n");

console.log("💡 RECOMMANDATION :");
console.log("→ SOLUTION 2 (modifier le worker) est la plus rapide");
console.log("→ SOLUTION 1 (transfert DNS) est la plus professionnelle à long terme");

console.log("\n🧪 TEST IMMÉDIAT :");
console.log("1. Modifiez votre worker avec le code de la Solution 2");
console.log("2. Testez www.securiteroutiere-journee-sensibilisation.live");
console.log("3. Regardez la page de debug pour voir les en-têtes reçus");
console.log("4. Ajustez la logique selon les en-têtes disponibles");