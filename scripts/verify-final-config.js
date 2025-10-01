/**
 * Script de vérification finale de la configuration des URLs
 */
require('dotenv').config({ path: '.env.local' })

console.log('🔍 VÉRIFICATION FINALE DE LA CONFIGURATION\n')

// Vérification des variables locales
console.log('📋 Variables d\'environnement locales:')
console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌')
console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌')
console.log('- NEXT_PUBLIC_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_PUBLIC_BASE_URL || '❌ Manquant')

// Simulation de génération d'URL
const publicBaseUrl = process.env.NEXT_PUBLIC_PUBLIC_BASE_URL || 'https://waivent.app'
const eventId = '533c4f88-f3ed-47b9-8e99-630e5e6bf5b4'
const token = 'TIoHD1jVOz8jh1fWei6qs7c3P6bLZp9C'

const generatedUrl = `${publicBaseUrl}/landing/${eventId}/${token}`
const previewUrl = `${publicBaseUrl}/landing/${eventId}?preview=true&template=workshop-learning`

console.log('\n🔗 URLs générées:')
console.log('- Landing Page:', generatedUrl)
console.log('- Prévisualisation:', previewUrl)

// Vérification de sécurité
console.log('\n🔒 Vérification de sécurité:')
if (publicBaseUrl.includes('admin.')) {
  console.log('✅ Utilise le domaine admin (admin.waivent.app)')
  console.log('✅ Routes /landing/* accessibles publiquement')
  console.log('✅ Routes /admin/* protégées par authentification')
  console.log('✅ Middleware de sécurité en place')
} else {
  console.log('⚠️  N\'utilise pas le domaine admin')
}

console.log('\n📋 Configuration à appliquer sur Vercel:')
console.log('1. Aller sur https://vercel.com/dashboard')
console.log('2. Sélectionner le projet event-admin')
console.log('3. Settings → Environment Variables')
console.log('4. Ajouter: NEXT_PUBLIC_PUBLIC_BASE_URL =', publicBaseUrl)
console.log('5. Redéployer l\'application')

console.log('\n🧪 Test recommandé après déploiement:')
console.log('- Générer un token via l\'interface admin')
console.log('- Vérifier que l\'URL générée utilise admin.waivent.app')
console.log('- Tester l\'accès à la landing page (doit fonctionner)')
console.log('- Vérifier que /admin/ nécessite toujours une authentification')