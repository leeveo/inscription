// Diagnostic complet du déploiement Cloudflare Worker
console.log("=== DIAGNOSTIC CLOUDFLARE WORKER ===\n");

console.log("🚨 ERREUR IDENTIFIÉE :");
console.log("Code: DEPLOYMENT_NOT_FOUND");
console.log("Signification: Le worker n'est pas déployé ou la route n'existe pas\n");

console.log("🔍 VÉRIFICATIONS À EFFECTUER DANS CLOUDFLARE :\n");

console.log("1️⃣ VÉRIFIER LE DÉPLOIEMENT DU WORKER :");
console.log("   - Allez sur https://dash.cloudflare.com");
console.log("   - Section 'Workers & Pages'");
console.log("   - Cherchez 'waivent-domain-router'");
console.log("   - VÉRIFIEZ qu'il est bien DÉPLOYÉ (statut vert)\n");

console.log("2️⃣ VÉRIFIER LES ROUTES PERSONNALISÉES :");
console.log("   - Dans votre worker 'waivent-domain-router'");
console.log("   - Onglet 'Settings' → 'Triggers'");
console.log("   - Section 'Custom Domains'");
console.log("   - AJOUTEZ ces domaines :");
console.log("     * www.securiteroutiere-journee-sensibilisation.live");
console.log("     * app.securiteroutiere-journee-sensibilisation.live\n");

console.log("3️⃣ ACTIONS IMMÉDIATES À EFFECTUER :");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log("\n📤 ÉTAPE 1: REDÉPLOYER LE WORKER");
console.log("   - Copiez votre code worker.js");
console.log("   - Dans Cloudflare Dashboard → Workers & Pages");
console.log("   - Cliquez sur 'waivent-domain-router'");
console.log("   - Onglet 'Quick Edit' ou 'Code'");
console.log("   - Collez votre code");
console.log("   - Cliquez 'Save and Deploy'");

console.log("\n🌐 ÉTAPE 2: CONFIGURER LES ROUTES CUSTOM");
console.log("   - Dans le worker → Settings → Triggers");
console.log("   - Section 'Custom Domains'");
console.log("   - Cliquez 'Add Custom Domain'");
console.log("   - Ajoutez: www.securiteroutiere-journee-sensibilisation.live");
console.log("   - Ajoutez: app.securiteroutiere-journee-sensibilisation.live");

console.log("\n🔧 ÉTAPE 3: ALTERNATIVE - UTILISER ROUTES");
console.log("   Si Custom Domains ne fonctionne pas :");
console.log("   - Section 'Routes' dans le worker");
console.log("   - Ajoutez ces patterns :");
console.log("     * www.securiteroutiere-journee-sensibilisation.live/*");
console.log("     * app.securiteroutiere-journee-sensibilisation.live/*");

console.log("\n⚠️ CONFIGURATION DNS ACTUELLE (CORRECTE) :");
console.log("   ✅ www → waivent-domain-router.marcmenu707.workers.dev");
console.log("   ✅ app → waivent-domain-router.marcmenu707.workers.dev");

console.log("\n🧪 TEST APRÈS CORRECTION :");
console.log("   1. Attendez 2-3 minutes après le déploiement");
console.log("   2. Testez: https://www.securiteroutiere-journee-sensibilisation.live");
console.log("   3. Vérifiez les logs dans Cloudflare Dashboard");

console.log("\n💡 CAUSES POSSIBLES :");
console.log("   - Worker pas déployé");
console.log("   - Custom domains/routes non configurées");
console.log("   - Problème de synchronisation Cloudflare");
console.log("   - Worker suspendu ou désactivé");

console.log("\n🆘 EN CAS D'ÉCHEC :");
console.log("   - Vérifiez les logs Cloudflare Worker");
console.log("   - Testez d'abord: waivent-domain-router.marcmenu707.workers.dev");
console.log("   - Contactez le support Cloudflare si le worker ne répond pas");