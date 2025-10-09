// Analyse du problème et solution pour le Cloudflare Worker
console.log("=== ANALYSE DU PROBLÈME WORKER ===\n");

console.log("✅ BONNE NOUVELLE : Le worker fonctionne !");
console.log("❌ PROBLÈME IDENTIFIÉ : Logique de domaine incorrecte\n");

console.log("📋 LOGS ANALYSÉS :");
console.log("- Worker reçoit: waivent-domain-router.marcmenu707.workers.dev");
console.log("- Worker teste: waivent-domain-router.marcmenu707.workers.dev");
console.log("- Résultat: Non autorisé (normal !)\n");

console.log("🔍 CAUSE DU PROBLÈME :");
console.log("Quand vous accédez à www.securiteroutiere-journee-sensibilisation.live :");
console.log("1. DNS redirige vers waivent-domain-router.marcmenu707.workers.dev");
console.log("2. Le worker reçoit l'en-tête Host: waivent-domain-router.marcmenu707.workers.dev");
console.log("3. Au lieu de Host: www.securiteroutiere-journee-sensibilisation.live\n");

console.log("🔧 SOLUTION : MODIFIER LE WORKER.JS\n");

console.log("PROBLÈME DANS LE CODE ACTUEL :");
console.log("const hostname = request.headers.get('host') || url.hostname;");
console.log("↳ Récupère 'waivent-domain-router.marcmenu707.workers.dev'\n");

console.log("CORRECTION NÉCESSAIRE :");
console.log("Le worker doit utiliser l'en-tête 'X-Forwarded-Host' ou 'CF-Connecting-IP'\n");

console.log("🚀 CODE CORRIGÉ À UTILISER :");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORRECTION: Récupérer le vrai domaine client
    const originalHost = request.headers.get('x-forwarded-host') || 
                        request.headers.get('x-original-host') ||
                        request.headers.get('cf-ray') ? 
                        url.searchParams.get('host') : 
                        request.headers.get('host');
    
    // Si c'est une requête directe au worker, extraire du referer ou URL
    let hostname = originalHost;
    if (hostname === 'waivent-domain-router.marcmenu707.workers.dev') {
      const referer = request.headers.get('referer');
      if (referer) {
        hostname = new URL(referer).hostname;
      } else {
        // Fallback: chercher dans l'URL ou params
        hostname = url.searchParams.get('domain') || hostname;
      }
    }
    
    console.log(\`🌐 Domaine original: \${originalHost}\`);
    console.log(\`🎯 Domaine traité: \${hostname}\`);

    // Rest du code reste identique...
    try {
      const domainCheck = await checkDomainAuthorization(hostname, env);
      // ... reste du code
    } catch (error) {
      // ... reste du code
    }
  }
};
`);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log("\n📝 ALTERNATIVE PLUS SIMPLE :");
console.log("Configurez des Custom Domains dans Cloudflare :");
console.log("1. Dashboard Cloudflare → Workers → waivent-domain-router");
console.log("2. Settings → Triggers → Custom Domains");
console.log("3. Ajoutez directement vos domaines");
console.log("   - www.securiteroutiere-journee-sensibilisation.live");
console.log("   - app.securiteroutiere-journee-sensibilisation.live");

console.log("\n⚡ AVANTAGE DES CUSTOM DOMAINS :");
console.log("- Le worker recevra directement le bon hostname");
console.log("- Pas besoin de modifier le code");
console.log("- Plus propre et plus fiable");

console.log("\n🧪 TEST IMMÉDIAT :");
console.log("1. Allez sur https://dash.cloudflare.com");
console.log("2. Workers & Pages → waivent-domain-router");
console.log("3. Settings → Triggers → Custom Domains");
console.log("4. Add Custom Domain");
console.log("5. Ajoutez: www.securiteroutiere-journee-sensibilisation.live");
console.log("6. Testez après 2-3 minutes");