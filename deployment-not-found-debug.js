// Test de diagnostic approfondi pour identifier le vrai problème
console.log("=== DIAGNOSTIC APPROFONDI DEPLOYMENT_NOT_FOUND ===\n");

console.log("🚨 PROBLÈME PERSISTANT :");
console.log("Erreur: 404 DEPLOYMENT_NOT_FOUND");
console.log("ID: cdg1::kzjk5-1759997376265-fd064240dc7f");
console.log("→ Cela indique un problème côté Cloudflare, pas DNS\n");

console.log("🔍 CAUSES POSSIBLES :");
console.log("1. Routes Cloudflare non configurées");
console.log("2. Worker pas déployé sur le bon subdomain");
console.log("3. Problème de configuration dans le Dashboard Cloudflare");
console.log("4. Cache Cloudflare qui pose problème\n");

console.log("🧪 TESTS DE DIAGNOSTIC :");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log("TEST 1: Vérifiez que votre worker répond directement");
console.log("🔗 https://waivent-domain-router.marcmenu707.workers.dev");
console.log("   → Devrait afficher votre page 'home'");
console.log("   → Si ça marche, le worker fonctionne");

console.log("\nTEST 2: Testez avec curl pour voir les headers");
console.log("curl -I https://www.securiteroutiere-journee-sensibilisation.live");
console.log("   → Regardez si ça pointe vers le worker");

console.log("\nTEST 3: Vérifiez la configuration Cloudflare");
console.log("Dashboard → Workers & Pages → waivent-domain-router");
console.log("   → Settings → Triggers");
console.log("   → Vérifiez les Routes/Custom Domains");

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log("\n🔧 SOLUTIONS À ESSAYER :");

console.log("\n1️⃣ FORCER LA ROUTE DANS CLOUDFLARE :");
console.log("   - Dashboard Cloudflare → Workers → waivent-domain-router");
console.log("   - Settings → Triggers → Routes");
console.log("   - Ajoutez: www.securiteroutiere-journee-sensibilisation.live/*");
console.log("   - Ajoutez: *.securiteroutiere-journee-sensibilisation.live/*");

console.log("\n2️⃣ MODIFIER LE WORKER POUR DEBUG :");
console.log("   Ajoutez un test de route de fallback");

console.log("\n3️⃣ CRÉER UN NOUVEAU WORKER DE TEST :");
console.log("   Créez un worker simple pour tester");

console.log("\n4️⃣ VÉRIFIER LES LOGS CLOUDFLARE :");
console.log("   Dashboard → Workers → waivent-domain-router → Logs");
console.log("   Regardez s'il y a des erreurs");

console.log("\n🎯 ACTION IMMÉDIATE :");
console.log("Testez d'abord: https://waivent-domain-router.marcmenu707.workers.dev");
console.log("Si ça marche = problème de routing");
console.log("Si ça marche pas = problème de worker");

console.log("\n💡 THÉORIE :");
console.log("Le DEPLOYMENT_NOT_FOUND indique que Cloudflare");
console.log("ne trouve pas le worker pour traiter votre domaine.");
console.log("C'est probablement un problème de configuration");
console.log("des routes dans le Dashboard Cloudflare.");

console.log("\n📞 PROCHAINE ÉTAPE :");
console.log("Dites-moi le résultat du test direct du worker !");
console.log("https://waivent-domain-router.marcmenu707.workers.dev");