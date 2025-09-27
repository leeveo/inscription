// Script de test rapide pour vérifier la configuration Brevo
require('dotenv').config({ path: '.env.local' })

const brevoApiKey = process.env.BREVO_API_KEY
const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.FROM_EMAIL
const fromName = process.env.BREVO_FROM_NAME || process.env.FROM_NAME

console.log('=== TEST CONFIGURATION BREVO ===')
console.log('BREVO_API_KEY:', brevoApiKey ? '✅ Définie' : '❌ Manquante')
console.log('BREVO_FROM_EMAIL:', fromEmail ? `✅ ${fromEmail}` : '❌ Manquante')
console.log('BREVO_FROM_NAME:', fromName ? `✅ ${fromName}` : '⚠️ Optionnelle (non définie)')

if (!brevoApiKey) {
  console.log('\n❌ ERREUR: Ajoutez BREVO_API_KEY dans .env.local')
}

if (!fromEmail) {
  console.log('\n❌ ERREUR: Ajoutez BREVO_FROM_EMAIL dans .env.local')
}

if (brevoApiKey && fromEmail) {
  console.log('\n✅ Configuration Brevo complète !')
}

console.log('===================================\n')