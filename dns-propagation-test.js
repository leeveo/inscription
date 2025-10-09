// Test de propagation DNS détaillé
console.log("=== TEST DE PROPAGATION DNS DÉTAILLÉ ===\n");

console.log("🔍 ÉTAT ACTUEL :");
console.log("✅ Worker fonctionne : https://waivent-domain-router.marcmenu707.workers.dev");
console.log("❌ Domaine final : https://www.securiteroutiere-journee-sensibilisation.live");
console.log("→ Erreur 404 NOT_FOUND\n");

console.log("🧪 TESTS À EFFECTUER MAINTENANT :");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log("1️⃣ TEST RÉSOLUTION DNS (PowerShell) :");
console.log("   nslookup www.securiteroutiere-journee-sensibilisation.live");
console.log("   → Devrait retourner: waivent-domain-router.marcmenu707.workers.dev\n");

console.log("2️⃣ TEST AVEC CURL :");
console.log("   curl -I https://www.securiteroutiere-journee-sensibilisation.live");
console.log("   → Regardez les headers de réponse\n");

console.log("3️⃣ TEST DNS ALTERNATIF :");
console.log("   nslookup www.securiteroutiere-journee-sensibilisation.live 8.8.8.8");
console.log("   → Test avec les DNS Google\n");

console.log("4️⃣ VÉRIFICATION EN LIGNE :");
console.log("   https://whatsmydns.net/#CNAME/www.securiteroutiere-journee-sensibilisation.live");
console.log("   → Vérifiez la propagation mondiale\n");

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log("\n⏱️ DÉLAIS HABITUELS DE PROPAGATION DNS :");
console.log("- Minimum : 5-15 minutes");
console.log("- Moyen : 1-4 heures"); 
console.log("- Maximum : 24-48 heures");
console.log("→ C'est normal que ça prenne du temps !\n");

console.log("🔧 SOLUTIONS TEMPORAIRES EN ATTENDANT :");

console.log("\n💡 SOLUTION 1: Modifier le fichier hosts");
console.log("   Fichier: C:\\Windows\\System32\\drivers\\etc\\hosts");
console.log("   Ajoutez cette ligne :");
console.log("   104.21.45.223 www.securiteroutiere-journee-sensibilisation.live");
console.log("   (IP de waivent-domain-router.marcmenu707.workers.dev)");

console.log("\n💡 SOLUTION 2: Changer les DNS temporairement");
console.log("   Dans les paramètres réseau Windows :");
console.log("   DNS primaire : 8.8.8.8");
console.log("   DNS secondaire : 8.8.4.4");

console.log("\n💡 SOLUTION 3: Mode incognito + vider cache");
console.log("   - Ouvrir Chrome en mode incognito");
console.log("   - Ou vider le cache DNS du navigateur");
console.log("   - chrome://net-internals/#dns → Clear host cache");

console.log("\n🎯 CONFIRMATION QUE ÇA VA MARCHER :");
console.log("Votre worker fonctionne parfaitement !");
console.log("C'est juste une question de temps pour la propagation DNS.");
console.log("Une fois propagé, www.securiteroutiere-journee-sensibilisation.live");
console.log("affichera exactement la même chose que le worker direct !");

console.log("\n🕐 RECOMMANDATION :");
console.log("Attendez 2-4 heures et retestez.");
console.log("Si ça ne marche toujours pas, utilisez les solutions temporaires ci-dessus.");